import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building2,
  Sliders,
  ShieldCheck,
  Bell,
  Lock,
  Save,
  Check,
  Camera,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentRole, settings, updateSettings, showToast, changePassword } = useApp();

  const [instituteName, setInstituteName] = useState(settings.instituteName);
  const [instituteCode, setInstituteCode] = useState(settings.instituteCode);
  const [campusAddress, setCampusAddress] = useState(settings.campusAddress);
  const [minThreshold, setMinThreshold] = useState(settings.minimumAttendanceThreshold);
  const [graceWindow, setGraceWindow] = useState(settings.attendanceWindowMinutes);
  const [allowCustomSecs, setAllowCustomSecs] = useState(settings.allowTeacherCustomSections);
  const [requireNotice, setRequireNotice] = useState(settings.requireFaceConsentNotice);

  useEffect(() => {
    setInstituteName(settings.instituteName);
    setInstituteCode(settings.instituteCode);
    setCampusAddress(settings.campusAddress);
    setMinThreshold(settings.minimumAttendanceThreshold);
    setGraceWindow(settings.attendanceWindowMinutes);
    setAllowCustomSecs(settings.allowTeacherCustomSections);
    setRequireNotice(settings.requireFaceConsentNotice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.id]);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pw.current) return showToast('Enter your current password', 'error');
    if (pw.next.length < 8) return showToast('New password must be at least 8 characters', 'error');
    if (pw.next !== pw.confirm) return showToast('New passwords do not match', 'error');
    setPwSaving(true);
    const ok = await changePassword(pw.current, pw.next);
    setPwSaving(false);
    if (ok) setPw({ current: '', next: '', confirm: '' });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      instituteName,
      instituteCode,
      campusAddress,
      minimumAttendanceThreshold: minThreshold,
      attendanceWindowMinutes: graceWindow,
      allowTeacherCustomSections: allowCustomSecs,
      requireFaceConsentNotice: requireNotice,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">
              {currentRole === 'admin' ? 'Institute Administration & Biometric Rules' : 'Portal Preferences'}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {currentRole === 'admin'
              ? 'Global attendance verification algorithms, threshold standards, and campus identities.'
              : 'Manage communication alerts and display options.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Admin Institute Profile Section */}
        {currentRole === 'admin' && (
          <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Institute Identity & Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">University / Institute Name</label>
                <input
                  type="text"
                  value={instituteName}
                  onChange={e => setInstituteName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Institute Accreditation Code</label>
                <input
                  type="text"
                  value={instituteCode}
                  onChange={e => setInstituteCode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">Campus Physical Address</label>
                <input
                  type="text"
                  value={campusAddress}
                  onChange={e => setCampusAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Attendance Parameters (Admin Only) */}
        {currentRole === 'admin' && (
          <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Biometric Attendance Policies</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#101624] rounded-xl border border-slate-800 space-y-2">
                <label className="block text-slate-200 font-semibold">
                  Minimum Attendance Threshold (%):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="90"
                    value={minThreshold}
                    onChange={e => setMinThreshold(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <span className="text-base font-bold font-mono text-cyan-400 shrink-0">
                    {minThreshold}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Students below this mark receive automated academic warnings and risk examination debarment.
                </p>
              </div>

              <div className="p-4 bg-[#101624] rounded-xl border border-slate-800 space-y-2">
                <label className="block text-slate-200 font-semibold">
                  Late Arrival Grace Period (Minutes):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={graceWindow}
                    onChange={e => setGraceWindow(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-base font-bold font-mono text-amber-400 shrink-0">
                    {graceWindow}m
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Arrivals within window are registered as 'Late'; arrivals after are flagged 'Absent'.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <label className="flex items-center gap-3 p-3 bg-[#101624] rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowCustomSecs}
                  onChange={e => setAllowCustomSecs(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                />
                <div>
                  <div className="font-semibold text-slate-200">Allow Faculty Dynamic Section Management</div>
                  <div className="text-[11px] text-slate-400">
                    Enables teachers to instantiate dynamic sections (e.g., Section F, G) when cohort overflows.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-[#101624] rounded-xl border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireNotice}
                  onChange={e => setRequireNotice(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                />
                <div>
                  <div className="font-semibold text-slate-200">Mandatory Biometric Privacy Consent</div>
                  <div className="text-[11px] text-slate-400">
                    Requires explicit student acknowledgment before face recognition embeddings can be captured.
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Save Bar */}
        {currentRole === 'admin' && (
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
        )}
      </form>

      {/* Notifications */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
          <Bell className="w-4 h-4 text-purple-400" />
          <span>Communication & Dispatches</span>
        </h3>
        <p className="text-xs text-slate-400">
          In-app notifications are created automatically when attendance is saved, when a student falls below the
          institute attendance threshold, and when a teacher receives a new class assignment.
        </p>
      </div>

      {/* Security: change password */}
      <form onSubmit={handleChangePassword} className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Account Security · Change Password</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Current Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={pw.current}
              onChange={e => setPw({ ...pw, current: e.target.value })}
              className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={pw.next}
              onChange={e => setPw({ ...pw, next: e.target.value })}
              placeholder="Min. 8 characters"
              className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={pw.confirm}
              onChange={e => setPw({ ...pw, confirm: e.target.value })}
              className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pwSaving}
            className="px-6 py-2.5 bg-[#101624] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>{pwSaving ? 'Updating…' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
