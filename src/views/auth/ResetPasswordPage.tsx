import React, { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { supabase } from '@/integrations/supabase/client';
import { ASSETS } from '../../assets';
import { ScanFace, Lock, ArrowRight, BadgeAlert, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const search = new URLSearchParams(window.location.search);
    const err = hash.get('error_description') || search.get('error_description');
    if (err) setLinkError(err.replace(/\+/g, ' '));
    const { data: sub } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (password.length < 8) return setErrorMsg('Password must be at least 8 characters.');
    if (password !== confirm) return setErrorMsg('Passwords do not match.');
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);
    if (error) return setErrorMsg(error.message);
    setDone(true);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#0B0F19] overflow-hidden font-sans">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${ASSETS.authBackground})` }}>
        <div className="absolute inset-0 bg-[#0B0F19]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/50 to-[#0B0F19]/30" />
      </div>
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/50 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <ScanFace className="w-4 h-4 text-cyan-400" />
            <span>FaceAttend AI · Password Recovery</span>
          </div>
        </div>
        <div className="bg-[#151C2B]/95 border border-slate-800 rounded-2xl shadow-2xl p-6 backdrop-blur-xl">
          {done ? (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h2 className="text-lg font-bold text-white">Password updated</h2>
              <p className="text-xs text-slate-300">You can now continue to your portal with the new password.</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-white mb-1">Choose a new password</h2>
              <p className="text-xs text-slate-400 mb-5">Enter a new password for your FaceAttend account.</p>
              {(linkError || errorMsg) && (
                <div className="mb-4 p-3 bg-rose-950/50 border border-rose-800/60 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                  <BadgeAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg || `${linkError}. Request a new reset link from the login page.`}</span>
                </div>
              )}
              {!ready && !linkError && (
                <p className="mb-4 text-[11px] text-slate-400">Verifying your reset link… If nothing happens, open the link from your email again.</p>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: 'New Password', value: password, set: setPassword },
                  { label: 'Confirm Password', value: confirm, set: setConfirm },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">{f.label}</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        value={f.value}
                        onChange={e => f.set(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={isLoading || !ready}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Update Password'}
                </button>
              </form>
              <button onClick={() => navigate('/login')} className="mt-4 text-[11px] text-slate-400 hover:text-white flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Back to login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
