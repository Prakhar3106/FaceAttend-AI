import React, { useState } from 'react';
import { NeutralAvatar } from '../../components/common/NeutralAvatar';
import { StudentFormModal } from '../../components/common/StudentFormModal';
import { LoginPasswordModal } from '../../components/common/LoginPasswordModal';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { downloadCsvFile } from '../../services/api';
import {
  GraduationCap,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  ScanFace,
  X,
  FileSpreadsheet,
  KeyRound,
} from 'lucide-react';

export const StudentManagementPage: React.FC = () => {
  const {
    students,
    updateStudent,
    deleteStudent,
    importStudents,
    classes,
    sections,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [loginFor, setLoginFor] = useState<Student | null>(null);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvResult, setCsvResult] = useState<{ inserted: number; failed: string[] } | null>(null);
  const [csvBusy, setCsvBusy] = useState(false);
  const csvInputRef = React.useRef<HTMLInputElement | null>(null);

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === 'all' || s.classId === filterClass;
    const matchesSection = filterSection === 'all' || s.sectionId === filterSection;
    return matchesSearch && matchesClass && matchesSection;
  });

  const parseCsv = (text: string): Record<string, string>[] => {
    const rows: string[][] = [];
    let cur: string[] = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"' && text[i + 1] === '"') {
          field += '"';
          i++;
        } else if (ch === '"') inQuotes = false;
        else field += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === ',') {
        cur.push(field);
        field = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        cur.push(field);
        field = '';
        if (cur.some(c => c.trim() !== '')) rows.push(cur);
        cur = [];
      } else field += ch;
    }
    cur.push(field);
    if (cur.some(c => c.trim() !== '')) rows.push(cur);
    if (rows.length < 2) return [];
    const headers = rows[0].map(h => h.trim().toLowerCase().replace(/[^a-z]/g, ''));
    return rows.slice(1).map(r => Object.fromEntries(headers.map((h, idx) => [h, (r[idx] || '').trim()])));
  };

  const pick = (row: Record<string, string>, keys: string[]) => {
    for (const k of keys) if (row[k]) return row[k];
    return '';
  };

  const handleCsvFile = async (file: File) => {
    setCsvResult(null);
    setCsvFileName(file.name);
    const text = await file.text();
    const rows = parseCsv(text);
    setCsvRows(rows);
    if (rows.length === 0) showToast('No student rows found. The first line must contain column headers.', 'error');
  };

  const handleProcessCsv = async () => {
    if (csvRows.length === 0) return;
    const prepared = [];
    const problems: string[] = [];
    for (const row of csvRows) {
      const enrollmentNo = pick(row, ['enrollmentid', 'enrollmentno', 'enrollmentnumber', 'enrollment', 'rollno']);
      const name = pick(row, ['fullname', 'name', 'studentname']);
      const email = pick(row, ['email', 'institutionalemail', 'studentemail']);
      const clsName = pick(row, ['class', 'classname', 'classcode']);
      const secName = pick(row, ['section', 'sectionname']);
      const cls = classes.find(
        c => c.name.toLowerCase() === clsName.toLowerCase() || c.code.toLowerCase() === clsName.toLowerCase()
      );
      const sec = sections.find(
        x => x.classId === cls?.id && (x.name.toLowerCase() === secName.toLowerCase() || x.name.toLowerCase() === `section ${secName}`.toLowerCase())
      );
      if (!enrollmentNo || !name || !email) {
        problems.push(`${enrollmentNo || name || 'Row'}: Enrollment ID, Full Name and Email are required`);
        continue;
      }
      if (!cls || !sec) {
        problems.push(`${enrollmentNo}: class "${clsName}" / section "${secName}" not found`);
        continue;
      }
      prepared.push({
        name,
        enrollmentNo,
        email,
        phone: pick(row, ['phone', 'contactphone', 'mobile']),
        dob: pick(row, ['dob', 'dateofbirth']),
        department: '',
        course: '',
        academicYear: '',
        semester: cls.semesterNumber,
        classId: cls.id,
        className: cls.name,
        sectionId: sec.id,
        sectionName: sec.name,
        username: enrollmentNo.toLowerCase(),
        status: 'active' as const,
        avatar: '',
        faceStatus: 'Not Enrolled' as const,
        consentGiven: false,
      });
    }
    setCsvBusy(true);
    const res = await importStudents(prepared);
    setCsvBusy(false);
    setCsvResult({ inserted: res.inserted, failed: [...problems, ...res.failed] });
    showToast(`${res.inserted} student records imported`, res.inserted > 0 ? 'success' : 'error');
  };


  const handleExportCsv = () => {
    const headers = [
      'Enrollment No',
      'Full Name',
      'Department',
      'Course',
      'Class',
      'Section',
      'Email',
      'Biometric Status',
      'Attendance Rate',
    ];
    const rows = filteredStudents.map(s => [
      s.enrollmentNo,
      s.name,
      s.department,
      s.course,
      s.className,
      s.sectionName,
      s.email,
      s.faceStatus,
      `${s.attendanceRate}%`,
    ]);
    downloadCsvFile('Enrolled_Students_Roster', headers, rows);
    showToast('Student directory CSV downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Student Enrollment & Management</h2>
          </div>
          <p className="text-xs text-slate-400">
            Maintain institute-wide student rosters, biometric registration records, and class affiliations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="px-3 py-2 bg-[#101624] hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-[#101624] hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student by name, enrollment ID or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#151C2B] text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            className="px-3 py-2 text-xs bg-[#151C2B] text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterSection}
            onChange={e => setFilterSection(e.target.value)}
            className="px-3 py-2 text-xs bg-[#151C2B] text-slate-200 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Sections</option>
            {sections.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
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
                <th className="py-3 px-4">Class & Dynamic Section</th>
                <th className="py-3 px-4">Biometric Enrollment</th>
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                  <td className="py-3 px-4">
                    <div className="text-slate-200 font-medium">{student.className}</div>
                    <div className="text-[10px] text-blue-400 font-semibold">{student.sectionName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
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
                    <div
                      className={`font-bold ${
                        student.totalClasses > 0 && student.attendanceRate < 75 ? 'text-rose-400' : student.totalClasses > 0 ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {student.totalClasses > 0 ? `${student.attendanceRate}%` : '—'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {student.presentDays}P / {student.absentDays}A
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() =>
                        updateStudent(student.id, {
                          status: student.status === 'active' ? 'inactive' : 'active',
                        })
                      }
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        student.status === 'active'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {student.status}
                    </button>
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
                        onClick={() => setEditStudent(student)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Edit Student Record"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(student.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Student Record"
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

      {/* Add / Edit Student Modal */}
      {(addModalOpen || editStudent) && (
        <StudentFormModal
          student={editStudent}
          onClose={() => {
            setAddModalOpen(false);
            setEditStudent(null);
          }}
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

      {/* Bulk CSV Import Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#151C2B] border border-slate-700 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Bulk Student CSV Import</span>
              </h3>
              <button
                onClick={() => {
                  setBulkModalOpen(false);
                  setCsvRows([]);
                  setCsvFileName('');
                  setCsvResult(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Upload a CSV with a header row: <span className="font-mono text-slate-300">Enrollment ID, Full Name, Email, Class, Section</span>{' '}
              (optional: Phone, DOB). Class and Section must match existing names.
            </p>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) void handleCsvFile(f);
              }}
            />
            <div
              onClick={() => csvInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center bg-[#101624] hover:border-blue-500 transition-colors cursor-pointer mb-4"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-200">
                {csvFileName ? `${csvFileName} · ${csvRows.length} rows` : 'Click to upload CSV spreadsheet'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">.csv up to 10MB</div>
            </div>
            {csvResult && (
              <div className="mb-4 p-3 bg-[#101624] border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="text-emerald-400 font-semibold">{csvResult.inserted} imported</div>
                {csvResult.failed.length > 0 && (
                  <div className="text-rose-300 space-y-0.5 max-h-32 overflow-y-auto">
                    {csvResult.failed.map((f, i) => (
                      <div key={i}>· {f}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  setBulkModalOpen(false);
                  setCsvRows([]);
                  setCsvFileName('');
                  setCsvResult(null);
                }}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                {csvResult ? 'Done' : 'Cancel'}
              </button>
              <button
                disabled={csvRows.length === 0 || csvBusy}
                onClick={() => void handleProcessCsv()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg"
              >
                {csvBusy ? 'Importing…' : 'Process File'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#151C2B] border border-rose-800/80 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Delete Student Record?</h3>
            <p className="text-xs text-slate-400 mb-4">
              Are you sure? Removing this student will delete their associated biometric enrollment and attendance records.
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
                  deleteStudent(deleteConfirmId);
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
