import React, { useState } from 'react';
import { NeutralAvatar } from '../../components/common/NeutralAvatar';
import { useApp } from '../../context/AppContext';
import { todayISO } from '../../lib/attendanceStats';
import { downloadCsvFile } from '../../services/api';
import {
  FileBarChart2,
  Download,
  Filter,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GraduationCap,
  Layers,
  Printer,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { currentRole, students, attendanceRecords, classes, sections, subjects, academicYears, showToast } =
    useApp();

  const [filterClass, setFilterClass] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(() => todayISO().slice(0, 8) + '01');
  const [endDate, setEndDate] = useState(() => todayISO());

  const filteredRecords = attendanceRecords.filter(r => {
    const matchesClass = filterClass === 'all' || r.classId === filterClass;
    const matchesSection = filterSection === 'all' || r.sectionId === filterSection;
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentEnrollment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = (!startDate || r.date >= startDate) && (!endDate || r.date <= endDate);
    return matchesClass && matchesSection && matchesStatus && matchesSearch && matchesDate;
  });

  const handleExportCsv = () => {
    const headers = [
      'Enrollment ID',
      'Student Name',
      'Subject',
      'Class',
      'Section',
      'Date',
      'Status',
      'Time Detected',
      'Faculty',
    ];
    const rows = filteredRecords.map(r => [
      r.studentEnrollment,
      r.studentName,
      r.subjectName,
      r.className,
      r.sectionName,
      r.date,
      r.status,
      r.timeDetected,
      r.teacherName,
    ]);
    downloadCsvFile('Attendance_Audit_Report', headers, rows);
    showToast(`Exported ${filteredRecords.length} attendance rows to CSV`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Metrics summary
  const total = filteredRecords.length || 1;
  const present = filteredRecords.filter(r => r.status === 'Present').length;
  const late = filteredRecords.filter(r => r.status === 'Late').length;
  const absent = filteredRecords.filter(r => r.status === 'Absent').length;
  const rate = (((present + late) / total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileBarChart2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Attendance Intelligence & Reports</h2>
          </div>
          <p className="text-xs text-slate-400">
            {currentRole === 'admin'
              ? 'Institute-wide attendance ledger. Generate audits by department, class, and dynamic section.'
              : currentRole === 'teacher'
              ? 'Assigned sections and module attendance registers.'
              : 'Personal attendance verification record.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#101624] hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xl text-xs font-medium transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 mb-1">Total Logs Filtered</div>
          <div className="text-2xl font-bold text-white font-mono">{filteredRecords.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Between {startDate} and {endDate}</div>
        </div>

        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-emerald-400 mb-1">Present Marks</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{present}</div>
          <div className="text-[10px] text-emerald-400/80 mt-1">Biometric recognized</div>
        </div>

        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-amber-400 mb-1">Late Arrivals</div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{late}</div>
          <div className="text-[10px] text-amber-400/80 mt-1">Grace approved</div>
        </div>

        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-cyan-400 mb-1">Attendance Yield</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{rate}%</div>
          <div className="text-[10px] text-slate-400 mt-1">{absent} absent records</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#101624] text-white border border-slate-700/80 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 bg-[#101624] text-slate-200 border border-slate-700/80 rounded-lg focus:outline-none"
            >
              <option value="all">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={filterSection}
              onChange={e => setFilterSection(e.target.value)}
              className="w-full px-3 py-2 bg-[#101624] text-slate-200 border border-slate-700/80 rounded-lg focus:outline-none"
            >
              <option value="all">All Dynamic Sections</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-[#101624] text-slate-200 border border-slate-700/80 rounded-lg focus:outline-none"
            >
              <option value="all">All Attendance States</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="Pending Verification">Pending Verification</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              aria-label="From date"
              className="w-full px-2 py-2 bg-[#101624] text-slate-200 border border-slate-700/80 rounded-lg focus:outline-none text-[11px]"
            />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              aria-label="To date"
              className="w-full px-2 py-2 bg-[#101624] text-slate-200 border border-slate-700/80 rounded-lg focus:outline-none text-[11px]"
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#101624] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Enrollment ID</th>
                <th className="py-3 px-4">Subject & Faculty</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Time Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    No matching attendance logs found for the applied filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{rec.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <NeutralAvatar src={rec.studentPhoto} name={rec.studentName} size="sm" rounded="rounded-full" className="shrink-0" />
                        <span className="font-semibold text-slate-100">{rec.studentName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{rec.studentEnrollment}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-medium">{rec.subjectName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Prof. {rec.teacherName}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {rec.className} · {rec.sectionName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium ${
                          rec.status === 'Present'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : rec.status === 'Late'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{rec.timeDetected}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
