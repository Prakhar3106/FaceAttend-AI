import React, { useMemo, useState } from 'react';
import { UserPlus, X, Edit } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { PhotoPicker } from './PhotoPicker';

interface StudentFormModalProps {
  student?: Student | null; // edit when provided
  /** Restrict selectable sections (teachers may only use their assigned sections). */
  allowedSectionIds?: string[];
  onClose: () => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({ student, allowedSectionIds, onClose }) => {
  const { classes, sections, addStudent, updateStudent, showToast } = useApp();
  const isEdit = !!student;

  const usableSections = useMemo(
    () => sections.filter(s => !allowedSectionIds || allowedSectionIds.includes(s.id)),
    [sections, allowedSectionIds]
  );
  const usableClasses = useMemo(
    () => classes.filter(c => usableSections.some(s => s.classId === c.id)),
    [classes, usableSections]
  );

  const firstClass = student?.classId || usableClasses[0]?.id || '';
  const [form, setForm] = useState({
    name: student?.name || '',
    enrollmentNo: student?.enrollmentNo || '',
    email: student?.email || '',
    phone: student?.phone || '',
    dob: student?.dob || '',
    classId: firstClass,
    sectionId: student?.sectionId || usableSections.find(s => s.classId === firstClass)?.id || '',
    password: '',
  });
  const [photo, setPhoto] = useState<Blob | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const handleClassChange = (classId: string) => {
    setForm(prev => ({ ...prev, classId, sectionId: usableSections.find(s => s.classId === classId)?.id || '' }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.enrollmentNo.trim() || !form.email.trim()) {
      showToast('Please fill all required student fields', 'error');
      return;
    }
    if (!form.sectionId) {
      showToast('Please choose a class and section', 'error');
      return;
    }
    if (form.password && form.password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    setSaving(true);
    let ok = false;
    if (isEdit && student) {
      ok = await updateStudent(
        student.id,
        {
          name: form.name.trim(),
          enrollmentNo: form.enrollmentNo.trim(),
          ...(student.hasLogin ? {} : { email: form.email.trim() }),
          phone: form.phone.trim(),
          dob: form.dob,
          classId: form.classId,
          sectionId: form.sectionId,
        },
        photo
      );
    } else {
      ok = await addStudent({
        name: form.name.trim(),
        enrollmentNo: form.enrollmentNo.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        dob: form.dob,
        department: '',
        course: '',
        academicYear: '',
        semester: 1,
        classId: form.classId,
        className: '',
        sectionId: form.sectionId,
        sectionName: '',
        username: form.enrollmentNo.trim().toLowerCase(),
        status: 'active',
        avatar: '',
        faceStatus: 'Not Enrolled',
        consentGiven: false,
        password: form.password || undefined,
        photo: photo instanceof Blob ? photo : null,
      });
    }
    setSaving(false);
    if (ok) onClose();
  };

  const inputCls = 'w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#151C2B] border border-slate-700 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {isEdit ? <Edit className="w-4 h-4 text-blue-400" /> : <UserPlus className="w-4 h-4 text-blue-400" />}
            <span>{isEdit ? 'Edit Student Record' : 'Enroll New Student'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {usableSections.length === 0 ? (
          <p className="text-xs text-slate-400">
            {allowedSectionIds
              ? 'You have no assigned sections yet. Ask your Institute Admin to assign you a class, section and subject.'
              : 'Create a class and section first (Academic Structure → Classes / Sections).'}
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3 text-xs">
            <PhotoPicker label="Student Photograph" currentUrl={student?.avatar} value={photo} onChange={setPhoto} hint="Clear, front-facing photo (used for face enrollment)" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Student Name *</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Enrollment ID *</label>
                <input type="text" required value={form.enrollmentNo} onChange={e => setForm({ ...form, enrollmentNo: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Institutional Email *</label>
                <input
                  type="email"
                  required
                  disabled={!!student?.hasLogin}
                  title={student?.hasLogin ? 'Email is locked because this student already has a login' : undefined}
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={`${inputCls} disabled:text-slate-500 disabled:cursor-not-allowed`}
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Date of Birth</label>
                <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className={inputCls} />
              </div>
              {!isEdit && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Login Password (optional)</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 8 characters"
                    className={inputCls}
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Class *</label>
                <select value={form.classId} onChange={e => handleClassChange(e.target.value)} className={inputCls}>
                  {usableClasses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Dynamic Section *</label>
                <select value={form.sectionId} onChange={e => setForm({ ...form, sectionId: e.target.value })} className={inputCls}>
                  {usableSections
                    .filter(s => s.classId === form.classId)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            {!isEdit && (
              <p className="text-[11px] text-slate-500">
                With a password the student can sign in to the Student portal using this email. You can also create the login later.
              </p>
            )}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition-all"
              >
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Register Student Record'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
