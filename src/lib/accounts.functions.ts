import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader, getRequestIP } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

type Result = { ok: true; created?: boolean } | { ok: false; error: string };

const memberInput = z.object({
  kind: z.enum(['teacher', 'student']),
  recordId: z.string().uuid(),
});

/**
 * Creates the sign-in account for a teacher or student record (or sets a new password
 * when the account already exists). Admins manage teachers and students; teachers manage
 * students they can see. Visibility is enforced by the caller's own row-level security.
 */
export const provisionMemberLogin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    memberInput.extend({ password: z.string().min(8, 'Password must be at least 8 characters').max(72) }).parse(input)
  )
  .handler(async ({ data, context }): Promise<Result> => {
    const { supabase, userId } = context;
    const { data: me } = await supabase.from('user_roles').select('role, institute_id').eq('user_id', userId).maybeSingle();
    if (!me) return { ok: false, error: 'Your account is not linked to an institute.' };
    if (data.kind === 'teacher' && me.role !== 'admin') return { ok: false, error: 'Only the Main Admin can manage faculty accounts.' };
    if (data.kind === 'student' && me.role === 'student') return { ok: false, error: 'Not allowed.' };

    const table = data.kind === 'teacher' ? 'teachers' : 'students';
    const { data: rec } = await supabase
      .from(table)
      .select('id, institute_id, user_id, email, name')
      .eq('id', data.recordId)
      .maybeSingle();
    if (!rec || rec.institute_id !== me.institute_id) return { ok: false, error: 'Record not found in your institute.' };

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    if (rec.user_id) {
      const { data: target } = await supabaseAdmin
        .from('user_roles')
        .select('role, institute_id')
        .eq('user_id', rec.user_id)
        .maybeSingle();
      if (!target || target.institute_id !== me.institute_id || target.role !== data.kind) {
        return { ok: false, error: 'This login belongs to a different account.' };
      }
      const { error } = await supabaseAdmin.auth.admin.updateUserById(rec.user_id, { password: data.password });
      if (error) {
        console.error('updateUserById failed', error);
        return { ok: false, error: 'Could not update the password. Please try again.' };
      }
      return { ok: true, created: false };
    }

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: rec.email.trim().toLowerCase(),
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: rec.name },
    });
    if (createErr || !created.user) {
      const msg = createErr?.message?.toLowerCase() ?? '';
      if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
        return { ok: false, error: 'An account with this email already exists. Use a different email.' };
      }
      console.error('createUser failed', createErr);
      return { ok: false, error: 'Could not create the login account.' };
    }
    const newUserId = created.user.id;

    const { error: roleErr } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: newUserId, institute_id: rec.institute_id, role: data.kind });
    if (roleErr) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      console.error('role insert failed', roleErr);
      return { ok: false, error: 'Could not link the account to your institute.' };
    }
    const { error: linkErr } = await supabaseAdmin.from(table).update({ user_id: newUserId }).eq('id', rec.id);
    if (linkErr) {
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      console.error('link failed', linkErr);
      return { ok: false, error: 'Could not link the account to the record.' };
    }
    await supabaseAdmin.from('notifications').insert({
      institute_id: rec.institute_id,
      user_id: newUserId,
      title: 'Welcome to FaceAttend AI',
      message:
        data.kind === 'teacher'
          ? 'Your faculty account is active. You can manage your assigned sections and take live attendance.'
          : 'Your student account is active. You can follow your attendance and biometric enrollment here.',
      category: 'system',
      target_role: data.kind,
    });
    return { ok: true, created: true };
  });

/** Deletes a teacher/student record and, when present, its sign-in account. */
export const removeMember = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => memberInput.parse(input))
  .handler(async ({ data, context }): Promise<Result> => {
    const { supabase, userId } = context;
    const { data: me } = await supabase.from('user_roles').select('role, institute_id').eq('user_id', userId).maybeSingle();
    if (!me) return { ok: false, error: 'Your account is not linked to an institute.' };
    if (data.kind === 'teacher' && me.role !== 'admin') return { ok: false, error: 'Only the Main Admin can remove faculty.' };
    if (data.kind === 'student' && me.role === 'student') return { ok: false, error: 'Not allowed.' };

    const table = data.kind === 'teacher' ? 'teachers' : 'students';
    const { data: rec } = await supabase.from(table).select('id, institute_id, user_id').eq('id', data.recordId).maybeSingle();
    if (!rec || rec.institute_id !== me.institute_id) return { ok: false, error: 'Record not found in your institute.' };

    const { error: delErr, count } = await supabase.from(table).delete({ count: 'exact' }).eq('id', rec.id);
    if (delErr || !count) return { ok: false, error: 'You are not allowed to remove this record.' };

    if (rec.user_id) {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const { data: target } = await supabaseAdmin
        .from('user_roles')
        .select('role, institute_id')
        .eq('user_id', rec.user_id)
        .maybeSingle();
      if (target && target.institute_id === me.institute_id && target.role === data.kind) {
        await supabaseAdmin.auth.admin.deleteUser(rec.user_id);
      }
    }
    return { ok: true };
  });

/** Writes an audit trail entry with the caller's identity and IP address. */
export const writeAuditLog = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ action: z.string().min(1).max(200), details: z.string().max(1000) }).parse(input)
  )
  .handler(async ({ data, context }): Promise<Result> => {
    const { supabase, userId } = context;
    const { data: me } = await supabase.from('user_roles').select('role, institute_id').eq('user_id', userId).maybeSingle();
    if (!me) return { ok: false, error: 'No institute' };
    const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', userId).maybeSingle();
    const ip = getRequestHeader('cf-connecting-ip') || getRequestIP({ xForwardedFor: true }) || '';
    const { error } = await supabase.from('audit_logs').insert({
      institute_id: me.institute_id,
      actor_id: userId,
      actor_name: profile?.full_name || profile?.email || '',
      actor_role: me.role,
      action: data.action,
      details: data.details,
      ip_address: ip,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  });
