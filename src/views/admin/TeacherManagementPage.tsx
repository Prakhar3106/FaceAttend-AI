import React, { useState } from 'react';
import { NeutralAvatar } from '../../components/common/NeutralAvatar';
import { PhotoPicker } from '../../components/common/PhotoPicker';
import { LoginPasswordModal } from '../../components/common/LoginPasswordModal';
import { useApp } from '../../context/AppContext';
import { Teacher, TeacherAssignment } from '../../types';
import { downloadCsvFile } from '../../services/api';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  BookOpen,
  Layers,
  Phone,
  Mail,
  Shield,
  Plus,
  X,
  KeyRound,
} from 'lucide-react';

export const TeacherManagementPage: React.FC = () => {
  const {
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    assignTeacher,
    removeAssignment,
    departments,
    courses,
    classes,
    sections,
    subjects,
    academicYears,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [assignModalTeacher, setAssignModalTeacher] = useState<Teacher | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [loginFor, setLoginFor] = useState<Teacher | null>(null);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<Blob | null | undefined>(undefined);

  const emptyForm = () => ({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    department: departments[0]?.name || '',
    designation: 'Assistant Professor',
    username: '',
    status: 'active' as 'active' | 'inactive',
    password: '',
  });

  // Teacher Form State (add + edit)
  const [formData, setFormData] = useState(emptyForm);

  const openAdd = () => {
    setEditingTeacher(null);
    setFormData(emptyForm());
    setPhoto(undefined);
    setAddModalOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      employeeId: t.employeeId,
      email: t.email,
      phone: t.phone,
      department: t.department,
      designation: t.designation,
      username: t.username,
      status: t.status,
      password: '',
    });
    setPhoto(undefined);
    setAddModalOpen(true);
  };

  const closeForm = () => {
    setAddModalOpen(false);
    setEditingTeacher(null);
  };

  // Assign Form State
  const [assignData, setAssignData] = useState({
    academicYearId: '',
    courseId: '',
    classId: '',
    semesterNumber: 1,
    sectionId: '',
    subjectId: '',
  });

  const openAssign = (t: Teacher) => {
    const cls = classes[0];
    const sec = sections.find(s => s.classId === cls?.id);
    setAssignData({
      academicYearId: academicYears.find(y => y.isCurrent)?.id || academicYears[0]?.id || '',
      courseId: cls?.courseId || courses[0]?.id || '',
      classId: cls?.id || '',
      semesterNumber: cls?.semesterNumber || 1,
      sectionId: sec?.id || '',
      subjectId: subjects.find(s => s.classId === cls?.id)?.id || '',
    });
    setAssignModalTeacher(t);
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === 'all' || t.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.employeeId.trim() || !formData.email.trim()) {
      showToast('Please fill all required teacher fields', 'error');
      return;
    }
    if (formData.password && formData.password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    setSaving(true);
    let ok: boolean;
    if (editingTeacher) {
      ok = await updateTeacher(
        editingTeacher.id,
        {
          name: formData.name.trim(),
          employeeId: formData.employeeId.trim(),
          ...(editingTeacher.hasLogin ? {} : { email: formData.email.trim() }),
          phone: formData.phone.trim(),
          department: formData.department,
          designation: formData.designation.trim(),
          status: formData.status,
        },
        photo
      );
    } else {
      ok = await addTeacher({
        name: formData.name.trim(),
        employeeId: formData.employeeId.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        designation: formData.designation.trim(),
        username: formData.username || formData.employeeId.trim().toLowerCase(),
        status: formData.status,
        avatar: '',
        joinedDate: new Date().toISOString().substring(0, 10),
        password: formData.password || undefined,
        photo: photo instanceof Blob ? photo : null,
      });
    }
    setSaving(false);
    if (ok) closeForm();
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalTeacher) return;

    const academicYear = academicYears.find(y => y.id === assignData.academicYearId);
    const course = courses.find(c => c.id === assignData.courseId);
    const cls = classes.find(c => c.id === assignData.classId);
    const sec = sections.find(s => s.id === assignData.sectionId);
    const subj = subjects.find(s => s.id === assignData.subjectId);

    if (!cls || !sec || !subj) {
      showToast('Choose a class, section and subject (create them in Academic Structure first)', 'error');
      return;
    }

    const ok = await assignTeacher({
      teacherId: assignModalTeacher.id,
      teacherName: assignModalTeacher.name,
      academicYearId: assignData.academicYearId,
      academicYearName: academicYear?.name || '',
      courseId: assignData.courseId || cls.courseId,
      courseName: course?.name || '',
      classId: cls.id,
      className: cls.name,
      semesterNumber: cls.semesterNumber,
      sectionId: sec.id,
      sectionName: sec.name,
      subjectId: subj.id,
      subjectName: subj.name,
    });

    if (ok) setAssignModalTeacher(null);
  };

  const handleExportCsv = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Status', 'Assigned Classes'];
    const rows = filteredTeachers.map(t => [
      t.employeeId,
      t.name,
      t.email,
      t.department,
      t.designation,
      t.status,
      t.assignments.map(a => `${a.className}(${a.sectionName})-${a.subjectName}`).join('; '),
    ]);
    downloadCsvFile('Faculty_Roster_FaceAttend', headers, rows);
    showToast('Faculty roster CSV downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Faculty & Teacher Management</h2>
          </div>
          <p className="text-xs text-slate-400">
            Admin exclusive authority. Provision faculty accounts, assign academic courses, classes, and dynamic sections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-[#101624] hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl text-xs font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Teacher</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teacher by name, employee ID or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#151C2B] text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="px-3 py-2 text-xs bg-[#151C2B] text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Roster Table */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#101624] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Assigned Classes & Subjects</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTeachers.map(teacher => (
                <tr key={teacher.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <NeutralAvatar src={teacher.avatar} name={teacher.name} size="sm" rounded="rounded-full" className="shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-100">{teacher.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">@{teacher.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{teacher.employeeId}</td>
                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-medium">{teacher.designation}</div>
                    <div className="text-[10px] text-slate-400">{teacher.department}</div>
                  </td>
                  <td className="py-3 px-4 space-y-0.5">
                    <div className="text-[11px] text-slate-300 truncate">{teacher.email}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{teacher.phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    {teacher.assignments.length === 0 ? (
                      <span className="text-slate-500 italic">No classes assigned</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {teacher.assignments.map(asg => (
                          <span
                            key={asg.id}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-950/70 border border-blue-900/50 text-blue-300 truncate"
                            title={`${asg.subjectName} (${asg.className} · ${asg.sectionName})`}
                          >
                            {asg.className}-{asg.sectionName}: {asg.subjectName.split(' ')[0]}
                            <button
                              onClick={() => void removeAssignment(asg.id)}
                              className="text-blue-400/70 hover:text-rose-400"
                              title="Remove this assignment"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() =>
                        updateTeacher(teacher.id, {
                          status: teacher.status === 'active' ? 'inactive' : 'active',
                        })
                      }
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        teacher.status === 'active'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {teacher.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openAssign(teacher)}
                        className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded text-[11px] font-medium transition-colors"
                        title="Assign Class & Subject"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => setLoginFor(teacher)}
                        className={`p-1 transition-colors ${teacher.hasLogin ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-400 hover:text-blue-400'}`}
                        title={teacher.hasLogin ? 'Login active · set new password' : 'Create teacher login'}
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEdit(teacher)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Edit Profile"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(teacher.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Faculty Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#151C2B] border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {editingTeacher ? <Edit className="w-4 h-4 text-blue-400" /> : <UserPlus className="w-4 h-4 text-blue-400" />}
                <span>{editingTeacher ? 'Edit Faculty Profile' : 'Provision Faculty Account'}</span>
              </h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <PhotoPicker
                label="Faculty Photograph"
                currentUrl={editingTeacher?.avatar}
                value={photo}
                onChange={setPhoto}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="Employee ID"
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingTeacher?.hasLogin}
                    title={editingTeacher?.hasLogin ? 'Email is locked because this teacher already has a login' : undefined}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="faculty@institute.edu"
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Mobile number"
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">— Select department —</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Associate Professor"
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {!editingTeacher && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Login Password (optional)</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min. 8 characters — lets the teacher sign in with this email"
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition-all"
                >
                  {saving ? 'Saving…' : editingTeacher ? 'Save Changes' : 'Create Faculty Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {assignModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#151C2B] border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Assign Class & Subject</h3>
                <p className="text-xs text-slate-400">Assigning to: {assignModalTeacher.name}</p>
              </div>
              <button
                onClick={() => setAssignModalTeacher(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Academic Year</label>
                <select
                  value={assignData.academicYearId}
                  onChange={e => setAssignData({ ...assignData, academicYearId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                >
                  {academicYears.map(ay => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} {ay.isCurrent ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Course</label>
                <select
                  value={assignData.courseId}
                  onChange={e => setAssignData({ ...assignData, courseId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Class</label>
                  <select
                    value={assignData.classId}
                    onChange={e => {
                      const cls = classes.find(c => c.id === e.target.value);
                      setAssignData({
                        ...assignData,
                        classId: e.target.value,
                        courseId: cls?.courseId || assignData.courseId,
                        semesterNumber: cls?.semesterNumber || assignData.semesterNumber,
                        sectionId: sections.find(sec => sec.classId === e.target.value)?.id || '',
                        subjectId: subjects.find(sub => sub.classId === e.target.value)?.id || '',
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                  >
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Dynamic Section</label>
                  <select
                    value={assignData.sectionId}
                    onChange={e => setAssignData({ ...assignData, sectionId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                  >
                    {sections
                      .filter(sec => sec.classId === assignData.classId)
                      .map(sec => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Subject</label>
                <select
                  value={assignData.subjectId}
                  onChange={e => setAssignData({ ...assignData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                >
                  {subjects.filter(sub => sub.classId === assignData.classId).length === 0 && (
                    <option value="">No subjects for this class yet</option>
                  )}
                  {subjects.filter(sub => sub.classId === assignData.classId).map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} · {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalTeacher(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-600/30 transition-all"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loginFor && (
        <LoginPasswordModal
          kind="teacher"
          recordId={loginFor.id}
          name={loginFor.name}
          email={loginFor.email}
          hasLogin={!!loginFor.hasLogin}
          onClose={() => setLoginFor(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#151C2B] border border-rose-800/80 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Delete Faculty Account?</h3>
            <p className="text-xs text-slate-400 mb-4">
              Are you sure you want to remove this teacher from the institute? All active class assignments will be unlinked.
            </p>
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteTeacher(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
