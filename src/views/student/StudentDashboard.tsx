import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Download,
  ScanFace,
  ShieldCheck,
  User,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useNavigate } from '@/lib/router-compat';
import { downloadCsvFile } from '../../services/api';
import { subjectBreakdown, monthlyTrend as buildMonthlyTrend, attendanceRate } from '../../lib/attendanceStats';
import { NeutralAvatar } from '../../components/common/NeutralAvatar';

export const StudentDashboard: React.FC = () => {
  const { currentUser, students, attendanceRecords, showToast, settings } = useApp();
  const navigate = useNavigate();

  // Find the logged-in student record
  const currentStudent =
    students.find(s => s.id === currentUser?.id || s.email === currentUser?.email) || {
      id: currentUser?.id || '',
      name: currentUser?.name || '',
      enrollmentNo: currentUser?.enrollmentNo || '',
      course: currentUser?.course || '',
      className: currentUser?.className || '',
      sectionName: currentUser?.sectionName || '',
      avatar: currentUser?.avatar || '',
      faceStatus: 'Not Enrolled' as const,
      attendanceRate: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      totalClasses: 0,
    };

  const studentRecords = attendanceRecords.filter(r => r.studentId === currentStudent?.id);

  // Subject-wise attendance calculation
  const subjectAttendance = subjectBreakdown(studentRecords);

  const monthlyTrend = buildMonthlyTrend(studentRecords).map(m => ({ month: m.month, rate: m.attendance }));
  const overallRate = studentRecords.length ? attendanceRate(studentRecords) : currentStudent.attendanceRate;

  const handleDownloadPersonalReport = () => {
    const headers = ['Subject Code', 'Subject Name', 'Total Classes', 'Present', 'Attendance %'];
    const rows = subjectAttendance.map(s => [
      s.code,
      s.subject,
      s.classes,
      s.present,
      `${s.attendance}%`,
    ]);
    downloadCsvFile(`Attendance_Report_${currentStudent.enrollmentNo}`, headers, rows);
    showToast('Personal attendance transcript downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center bg-gradient-to-r from-[#101624] via-[#151C2B] to-[#101624]"
          style={settings.campusPhotoUrl ? { backgroundImage: `url(${settings.campusPhotoUrl})` } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/90 to-[#0B0F19]/70" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <NeutralAvatar src={currentStudent.avatar} name={currentStudent.name} size="lg" rounded="rounded-2xl" className="shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                  {currentStudent.enrollmentNo}
                </span>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {currentStudent.faceStatus === 'Enrolled' ? 'Biometrics Enrolled' : 'Biometrics Not Enrolled'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {currentStudent.name}
              </h2>
              <p className="text-xs text-slate-300">
                {currentStudent.course} · {currentStudent.className} ({currentStudent.sectionName}){currentUser?.classTeacher ? ` · Class Teacher: ${currentUser.classTeacher}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/student/calendar')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Attendance Calendar</span>
            </button>
            <button
              onClick={handleDownloadPersonalReport}
              className="px-4 py-2.5 bg-[#151C2B] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Classes */}
        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center justify-between">
            <span>Total Classes</span>
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{currentStudent.totalClasses}</div>
          <div className="text-[10px] text-slate-400 mt-1">Conducted to date</div>
        </div>

        {/* Present */}
        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-emerald-400 font-medium mb-1 flex items-center justify-between">
            <span>Present</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{currentStudent.presentDays}</div>
          <div className="text-[10px] text-emerald-400/80 mt-1">Verified entries</div>
        </div>

        {/* Late */}
        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-amber-400 font-medium mb-1 flex items-center justify-between">
            <span>Late</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{currentStudent.lateDays}</div>
          <div className="text-[10px] text-amber-400/80 mt-1">&lt;15 min grace</div>
        </div>

        {/* Absent */}
        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-rose-400 font-medium mb-1 flex items-center justify-between">
            <span>Absent</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{currentStudent.absentDays}</div>
          <div className="text-[10px] text-rose-400/80 mt-1">Leave or missed</div>
        </div>

        {/* Aggregate Attendance Percentage */}
        <div className="col-span-2 sm:col-span-1 bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-cyan-400 font-medium mb-1 flex items-center justify-between">
            <span>Overall %</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{overallRate}%</div>
          <div className="text-[10px] text-emerald-400 mt-1">{currentStudent.totalClasses === 0 && studentRecords.length === 0 ? "No records yet" : overallRate >= 75 ? "Meets 75% rule" : "Below 75% rule"}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject-Wise Breakdown Bar Chart (Col 7) */}
        <div className="lg:col-span-7 bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Subject-Wise Attendance</h3>
              <p className="text-xs text-slate-400">Subjects with recorded attendance</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              {subjectAttendance.length === 0 ? 'No data' : overallRate >= 75 ? 'Compliant' : 'At risk'}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="subject" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101624',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="attendance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Area Chart (Col 5) */}
        <div className="lg:col-span-5 bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1">Monthly Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Consistency progression across semester</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="studentTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101624',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#studentTrend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3">Recent Biometric Verification Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#101624] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4">Class & Room</th>
                <th className="py-2.5 px-4">Detection Time</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {studentRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 px-4 text-center text-slate-500">No attendance records yet.</td>
                </tr>
              )}
              {studentRecords.slice(0, 10).map(r => (
                <tr key={r.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 font-mono text-slate-300">{r.date}</td>
                  <td className="py-2.5 px-4 font-medium text-white">{r.subjectName}</td>
                  <td className="py-2.5 px-4 text-slate-400">{r.className} {r.sectionName}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">{r.timeDetected}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                        r.status === 'Present'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : r.status === 'Late'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
