import React, { useState } from 'react';
import { NeutralAvatar } from '../../components/common/NeutralAvatar';
import { StudentFormModal } from '../../components/common/StudentFormModal';
import { LoginPasswordModal } from '../../components/common/LoginPasswordModal';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { downloadCsvFile } from '../../services/api';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ScanFace,
  Layers,
  X,
  UserPlus,
  Edit,
  Trash2,
  KeyRound,
} from 'lucide-react';

export const TeacherStudentsPage: React.FC = () => {
  const { currentUser, teachers, students, showToast, deleteStudent } = useApp();

  const currentTeacher =
    teachers.find(t => t.id === currentUser?.id || t.email === currentUser?.email);

  const assignments = currentTeacher?.assignments || [];

  // Available sections for this teacher
  const assignedSections = Array.from(
    new Map(assignments.map(a => [a.sectionId, { id: a.sectionId, name: a.sectionName, className: a.className }])).values()
  );

  const [pickedSectionId, setSelectedSectionId] = useState<string>('');
  const selectedSectionId = pickedSectionId || assignedSections[0]?.id || '';
  const [studentForm, setStudentForm] = useState<{ open: boolean; student: Student | null }>({ open: false, student: null });
  const [loginFor, setLoginFor] = useState<Student | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  // Filter students strictly assigned to this teacher and selected section
  const sectionStudents = students.filter(
    s => s.sectionId === selectedSectionId
  );

  const filteredStudents = sectionStudents.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCsv = () => {
    const currentSecName = assignedSections.find(s => s.id === selectedSectionId)?.name || 'Section';
    const headers = ['Enrollment No', 'Full Name', 'Class', 'Section', 'Attendance Rate', 'Face Status', 'Present', 'Absent', 'Late'];
    const rows = filteredStudents.map(s => [
      s.enrollmentNo,
      s.name,
      s.className,
      s.sectionName,
      `${s.attendanceRate}%`,
      s.faceStatus,
      s.presentDays,
      s.absentDays,
      s.lateDays,
    ]);
    downloadCsvFile(`Assigned_Students_${currentSecName}`, headers, rows);
    showToast(`Exported ${filteredStudents.length} student records`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Section Selection Tabs */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">My Assigned Students & Sections</h2>
            </div>
            <p className="text-xs text-slate-400">
              Scoped strictly to your allocated courses and sections. Isolated from other faculty rosters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-[#101624] hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl text-xs font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Section CSV</span>
            </button>
            <button
              onClick={() => setStudentForm({ open: true, student: null })}
              disabled={assignedSections.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Section Switcher Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-medium text-slate-400 mr-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Switch Section:</span>
          </span>
          {assignedSections.length === 0 && (
            <span className="text-xs text-slate-500">No sections assigned yet — ask your Institute Admin to assign you.</span>
          )}
          {assignedSections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setSelectedSectionId(sec.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSectionId === sec.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-[#101624] text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sec.className} · {sec.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students in this section..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#151C2B] text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-white font-bold">{filteredStudents.length}</span> students in active section
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#101624] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Enrollment ID</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Biometric Status</th>
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">Class Breakdown</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <NeutralAvatar src={student.avatar} name={student.name} size="sm" rounded="rounded-full" className="shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-100">{student.name}</div>
                        <div className="text-[10px] text-slate-400">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{student.enrollmentNo}</td>
                  <td className="py-3 px-4 text-slate-300 font-medium">
                    {student.className} · {student.sectionName}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                        student.faceStatus === 'Enrolled'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : student.faceStatus === 'Needs Review'
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      <ScanFace className="w-3 h-3" />
                      <span>{student.faceStatus}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span
                      className={`font-bold text-xs ${
                        student.attendanceRate < 75 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {student.attendanceRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    <span className="text-emerald-400">{student.presentDays}P</span> /{' '}
                    <span className="text-amber-400">{student.lateDays}L</span> /{' '}
                    <span className="text-rose-400">{student.absentDays}A</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => setLoginFor(student)}
                      className={`p-1 transition-colors ${student.hasLogin ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-400 hover:text-blue-400'}`}
                      title={student.hasLogin ? 'Login active · set new password' : 'Create student login'}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setStudentForm({ open: true, student })}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      title="Edit Student"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(student)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove Student"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedStudentForModal(student)}
                      className="px-2.5 py-1 bg-[#101624] hover:bg-slate-800 text-blue-400 hover:text-blue-300 rounded text-[11px] font-medium border border-slate-700/60 transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {studentForm.open && (
        <StudentFormModal
          student={studentForm.student}
          allowedSectionIds={assignedSections.map(s => s.id)}
          onClose={() => setStudentForm({ open: false, student: null })}
        />
      )}

      {loginFor && (
        <LoginPasswordModal
          kind="student"
          recordId={loginFor.id}
          name={loginFor.name}
          email={loginFor.email}
          hasLogin={!!loginFor.hasLogin}
          onClose={() => setLoginFor(null)}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#151C2B] border border-rose-800/80 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Remove {deleteConfirm.name}?</h3>
            <p className="text-xs text-slate-400 mb-4">
              This deletes the student record, face enrollment, sign-in account and attendance history.
            </p>
            <div className="flex items-center justify-end gap-2 text-xs">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-slate-400 hover:text-white">
                Cancel
              </button>
              <button
                onClick={() => {
                  void deleteStudent(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Inspection Modal */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#151C2B] border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Student Attendance Card</h3>
              <button
                onClick={() => setSelectedStudentForModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <NeutralAvatar src={selectedStudentForModal.avatar} name={selectedStudentForModal.name} size="lg" rounded="rounded-2xl" className="shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">{selectedStudentForModal.name}</h4>
                <div className="text-xs text-slate-400 font-mono">
                  {selectedStudentForModal.enrollmentNo}
                </div>
                <div className="text-[11px] text-blue-400 mt-0.5">
                  {selectedStudentForModal.className} · {selectedStudentForModal.sectionName}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-[#101624] rounded-xl border border-slate-800 text-center mb-4 text-xs font-mono">
              <div>
                <div className="text-emerald-400 font-bold text-sm">
                  {selectedStudentForModal.presentDays}
                </div>
                <div className="text-[10px] text-slate-400">Present</div>
              </div>
              <div>
                <div className="text-amber-400 font-bold text-sm">
                  {selectedStudentForModal.lateDays}
                </div>
                <div className="text-[10px] text-slate-400">Late</div>
              </div>
              <div>
                <div className="text-rose-400 font-bold text-sm">
                  {selectedStudentForModal.absentDays}
                </div>
                <div className="text-[10px] text-slate-400">Absent</div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Institutional Email:</span>
                <span>{selectedStudentForModal.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Biometric Verification:</span>
                <span className="text-emerald-400 font-medium">
                  {selectedStudentForModal.faceStatus}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Compliance Status:</span>
                <span
                  className={
                    selectedStudentForModal.attendanceRate < 75 ? 'text-rose-400' : 'text-emerald-400'
                  }
                >
                  {selectedStudentForModal.attendanceRate < 75 ? 'At Risk (<75%)' : 'Eligible for Exams'}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedStudentForModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
