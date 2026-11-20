import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '../../context/AppContext';
import { NeutralAvatar } from '../../components/common/NeutralAvatar';
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Building2,
  ScanFace,
  Lock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const { currentUser, students, showToast, changePassword, refresh } = useApp();

  const currentStudent =
    students.find(s => s.id === currentUser?.id || s.email === currentUser?.email) || {
      name: currentUser?.name || '',
      enrollmentNo: currentUser?.enrollmentNo || '',
      course: currentUser?.course || '',
      className: currentUser?.className || '',
      sectionName: currentUser?.sectionName || '',
      department: currentUser?.department || '',
      email: currentUser?.email || '',
      academicYear: '',
      semester: currentUser?.semester || '',
      phone: '',
      avatar: currentUser?.avatar || '',
      faceStatus: 'Not Enrolled',
      attendanceRate: 0,
      presentDays: 0,
      totalClasses: 0,
    };

  const [phone, setPhone] = useState(currentStudent?.phone || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [saving, setSaving] = useState(false);

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.rpc('update_my_student_contact', { _phone: phone.trim() });
    setSaving(false);
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    await refresh();
    showToast('Personal contact information updated successfully');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return showToast('Enter your current password', 'error');
    if (newPassword.length < 8) return showToast('New password must be at least 8 characters', 'error');
    const ok = await changePassword(password, newPassword);
    if (ok) {
      setPassword('');
      setNewPassword('');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <NeutralAvatar src={currentStudent.avatar} name={currentStudent.name} role="student" size="xl" rounded="rounded-2xl" />
        <div className="text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-white">{currentStudent.name}</h2>
            <span className="text-xs font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded">
              {currentStudent.enrollmentNo}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {currentStudent.course} · {currentStudent.className} ({currentStudent.sectionName})
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <ScanFace className="w-3.5 h-3.5" /> Biometric: {currentStudent.faceStatus}
            </span>
            <span className="flex items-center gap-1 text-cyan-400 font-mono">
              Attendance: {currentStudent.attendanceRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Academic Identity Details (Protected Fields) */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Official Academic Identity</span>
            </h3>
            <p className="text-xs text-slate-400">
              Academic credentials are verified and locked by the Institute Administration.
            </p>
          </div>
          <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded flex items-center gap-1">
            <Lock className="w-3 h-3" /> Locked Fields
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-[#101624] border border-slate-800 rounded-xl">
            <div className="text-slate-500 mb-0.5">Department</div>
            <div className="text-slate-200 font-medium">{currentStudent.department}</div>
          </div>

          <div className="p-3 bg-[#101624] border border-slate-800 rounded-xl">
            <div className="text-slate-500 mb-0.5">Course / Degree</div>
            <div className="text-slate-200 font-medium">{currentStudent.course}</div>
          </div>

          <div className="p-3 bg-[#101624] border border-slate-800 rounded-xl">
            <div className="text-slate-500 mb-0.5">Academic Cycle</div>
            <div className="text-slate-200 font-medium">{currentStudent.academicYear}</div>
          </div>

          <div className="p-3 bg-[#101624] border border-slate-800 rounded-xl">
            <div className="text-slate-500 mb-0.5">Class & Semester</div>
            <div className="text-slate-200 font-medium">
              {currentStudent.className} · Semester {currentStudent.semester}
            </div>
          </div>

          <div className="p-3 bg-[#101624] border border-slate-800 rounded-xl">
            <div className="text-slate-500 mb-0.5">Assigned Dynamic Section</div>
            <div className="text-blue-400 font-bold">{currentStudent.sectionName}</div>
          </div>

          <div className="p-3 bg-[#101624] border border-slate-800 rounded-xl">
            <div className="text-slate-500 mb-0.5">Designated Class Faculty</div>
            <div className="text-slate-200 font-medium">{currentUser?.classTeacher || '—'}</div>
          </div>
        </div>
      </div>

      {/* Editable Contact & Password Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1">Personal Contact Info</h3>
          <p className="text-xs text-slate-400 mb-4">Phone number for institutional SMS alerts.</p>

          <form onSubmit={handleUpdateContact} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Institutional Email</label>
              <input
                type="email"
                disabled
                value={currentStudent.email}
                className="w-full px-3 py-2 bg-[#101624] text-slate-500 border border-slate-800 rounded-lg cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Mobile Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-all mt-2"
            >
              Update Contact
            </button>
          </form>
        </div>

        <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1">Security & Password</h3>
          <p className="text-xs text-slate-400 mb-4">Change your portal login passphrase.</p>

          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Current Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-all mt-2"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
