import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubjectItem } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  UserCheck,
  Download,
  GraduationCap,
  Layers,
  X,
  Edit,
  Trash2,
} from 'lucide-react';
import { downloadCsvFile } from '../../services/api';

export const SubjectManagementPage: React.FC = () => {
  const { subjects, addSubject, teachers, classes, courses, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const emptyForm = () => ({
    name: '',
    code: '',
    courseId: classes[0]?.courseId || courses[0]?.id || '',
    semesterNumber: classes[0]?.semesterNumber || 1,
    classId: classes[0]?.id || '',
    assignedTeacherId: '',
    credits: 4,
    studentCount: 0,
  });

  const [formData, setFormData] = useState(emptyForm);

  const openAdd = () => {
    setFormData(emptyForm());
    setAddModalOpen(true);
  };

  const filteredSubjects = subjects.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.assignedTeacherName && s.assignedTeacherName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;
    const cls = classes.find(c => c.id === formData.classId);
    if (!cls) {
      showToast('Create a class cohort first (Academic Structure → Classes)', 'error');
      return;
    }

    const teacher = teachers.find(t => t.id === formData.assignedTeacherId);

    const ok = await addSubject({
      ...formData,
      courseId: cls.courseId,
      semesterNumber: cls.semesterNumber,
      assignedTeacherId: formData.assignedTeacherId || undefined,
      assignedTeacherName: teacher?.name || 'Unassigned',
    });

    if (ok) setAddModalOpen(false);
  };

  const handleExportCsv = () => {
    const headers = ['Subject Code', 'Subject Name', 'Class', 'Credits', 'Assigned Faculty', 'Enrolled Students'];
    const rows = filteredSubjects.map(s => [
      s.code,
      s.name,
      classes.find(c => c.id === s.classId)?.name || '',
      s.credits,
      s.assignedTeacherName || 'Unassigned',
      s.studentCount,
    ]);
    downloadCsvFile('Curriculum_Subjects_Roster', headers, rows);
    showToast('Subject catalog CSV downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Subject Curriculum & Faculty Mapping</h2>
          </div>
          <p className="text-xs text-slate-400">
            Define course modules, assign faculty coordinators, and regulate academic credit allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search subject code, name or assigned professor..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs bg-[#151C2B] text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map(subject => {
          const parentClass = classes.find(c => c.id === subject.classId);
          return (
            <div
              key={subject.id}
              className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-950/80 text-blue-400 border border-blue-900/50">
                    {subject.code}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{subject.credits} Credits</span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">{subject.name}</h3>
                <div className="text-xs text-slate-400">Class: {parentClass?.name || '—'}</div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Assigned Faculty:</span>
                  <span className="font-semibold text-slate-200">
                    {subject.assignedTeacherName || 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Enrolled Students:</span>
                  <span className="font-mono text-cyan-400 font-medium">{subject.studentCount} students</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subject Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#151C2B] border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Add Curriculum Subject</span>
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="CS-305"
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={formData.credits}
                    onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Subject Full Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Design & Analysis of Algorithms"
                  className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Class</label>
                  <select
                    value={formData.classId}
                    onChange={e => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Faculty In-Charge</label>
                  <select
                    value={formData.assignedTeacherId}
                    onChange={e => setFormData({ ...formData, assignedTeacherId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#101624] text-white border border-slate-700 rounded-lg focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-all"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
