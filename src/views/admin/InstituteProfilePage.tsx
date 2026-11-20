import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InstituteSetupModal } from '../../components/admin/InstituteSetupModal';
import { NeutralAvatar } from '../../components/common/NeutralAvatar';
import {
  Building2,
  FolderTree,
  Plus,
  MapPin,
  Mail,
  Phone,
  Edit3,
  CheckCircle2,
  X,
  Upload,
} from 'lucide-react';

export const InstituteProfilePage: React.FC = () => {
  const { settings, departments, addDepartment } = useApp();

  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptHod, setDeptHod] = useState('');

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName || !deptCode) return;
    addDepartment({
      name: deptName.trim(),
      code: deptCode.trim().toUpperCase(),
      hodName: deptHod.trim(),
    });
    setAddDeptOpen(false);
    setDeptName('');
    setDeptCode('');
    setDeptHod('');
  };

  return (
    <div className="space-y-6">
      {/* Institute Hero Card with Real Campus Photo or Neutral Architectural Placeholder */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        {settings.campusPhotoUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url(${settings.campusPhotoUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/90 to-[#0B0F19]/60" />
            <div className="absolute inset-0 bg-[#0B0F19]/40 backdrop-blur-[0.5px]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#101624] via-[#151C2B] to-[#101624]">
            <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
          </div>
        )}

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-400 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                <span>{settings.instituteCode || 'Institute'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/50 text-emerald-300 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Registered Institution</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Actual Uploaded Logo or Neutral Emblem */}
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={`${settings.instituteName} Logo`}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain bg-black/40 p-1.5 border border-slate-700 shadow-xl shrink-0"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg">
                  <Building2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              )}

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                  {settings.instituteName}
                </h2>
                <p className="text-xs text-slate-300 mt-1">Official Institutional Administration & Biometric Registry</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{settings.campusAddress || 'Campus address not added'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{settings.contactEmail || 'Contact email not added'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{settings.contactPhone || 'Contact phone not added'}</span>
              </div>
            </div>
          </div>

          {/* Quick Setup / Edit Button */}
          <div className="shrink-0">
            <button
              onClick={() => setSetupModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Institute & Upload Branding</span>
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Administrator / Authority Card (Neutral Avatar, No Fake Portraits) */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <NeutralAvatar role="admin" size="xl" name={settings.hodName || 'Institutional Administrator'} />
        <div className="space-y-1 text-center sm:text-left flex-1">
          <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-400 px-2 py-0.5 rounded border border-blue-800">
            OFFICIAL INSTITUTE ADMINISTRATOR & HOD
          </span>
          <h3 className="text-lg font-bold text-white">{settings.hodName || 'Institutional Administrator'}</h3>
          <p className="text-xs text-slate-400 max-w-xl">
            Holds central executive administrative authority over academic departments, faculty rosters, dynamic class cohorts, and AI facial recognition attendance parameters.
          </p>
        </div>
        <button
          onClick={() => setSetupModalOpen(true)}
          className="px-3.5 py-2 bg-[#101624] hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
        >
          Update Details
        </button>
      </div>

      {/* Departments Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-blue-400" />
              <span>Academic Engineering Departments</span>
            </h3>
            <p className="text-xs text-slate-400">
              Departmental faculties, student cohorts, and instructional assignments.
            </p>
          </div>

          <button
            onClick={() => setAddDeptOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map(dept => (
            <div
              key={dept.id}
              className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-950/80 text-blue-400 border border-blue-900/50">
                    {dept.code}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{dept.hodName}</span>
                </div>
                <h4 className="text-base font-bold text-white">{dept.name}</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs font-mono">
                <div className="p-2.5 bg-[#101624] rounded-lg">
                  <div className="text-slate-400 text-[10px]">Faculty Count</div>
                  <div className="text-slate-200 font-bold">{dept.totalTeachers} Instructors</div>
                </div>
                <div className="p-2.5 bg-[#101624] rounded-lg">
                  <div className="text-slate-400 text-[10px]">Student Body</div>
                  <div className="text-cyan-400 font-bold">{dept.totalStudents} Students</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Department Modal */}
      {addDeptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#151C2B] border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Add Academic Department</h3>
              <button onClick={() => setAddDeptOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDept} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  value={deptCode}
                  onChange={e => setDeptCode(e.target.value)}
                  placeholder="AI-ML / MECH / CIVIL"
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Department Full Name</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={e => setDeptName(e.target.value)}
                  placeholder="Artificial Intelligence & Machine Learning"
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Department Chair / Coordinator</label>
                <input
                  type="text"
                  value={deptHod}
                  onChange={e => setDeptHod(e.target.value)}
                  placeholder="e.g. Department Head (AI-ML)"
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddDeptOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-all"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Institute Registration & Setup Modal */}
      <InstituteSetupModal isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} />
    </div>
  );
};
