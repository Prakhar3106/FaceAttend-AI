import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { weeklyBreakdown, monthlyTrend, attendanceRate, todayISO } from '../../lib/attendanceStats';
import { NeutralAvatar } from '../../components/common/NeutralAvatar';
import { InstituteSetupModal } from '../../components/admin/InstituteSetupModal';
import {
  Users,
  GraduationCap,
  Building2,
  Layers,
  Grid3X3,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  BrainCircuit,
  Calendar,
  ArrowUpRight,
  ShieldAlert,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { downloadCsvFile } from '../../services/api';
import { useNavigate } from '@/lib/router-compat';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    settings,
    academicYears,
    departments,
    courses,
    classes,
    sections,
    subjects,
    teachers,
    students,
    attendanceRecords,
    aiInsights,
    auditLogs,
    showToast,
  } = useApp();

  const navigate = useNavigate();
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  const currentYear = academicYears.find(y => y.isCurrent) || academicYears[0];
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate live statistics
  const totalStudentsCount = students.length;
  const totalTeachersCount = teachers.length;
  const totalDeptCount = departments.length;
  const totalCourseCount = courses.length;
  const totalClassCount = classes.length;
  const totalSectionCount = sections.length;
  const totalSubjectCount = subjects.length;

  const todayRecords = attendanceRecords.filter(r => r.date === todayISO());
  const todayPresent = todayRecords.filter(r => r.status === 'Present').length;
  const todayLate = todayRecords.filter(r => r.status === 'Late').length;
  const todayAbsent = todayRecords.filter(r => r.status === 'Absent').length;
  const todayTotal = todayRecords.length;
  const todayAttendancePct = todayTotal > 0 ? (((todayPresent + todayLate) / todayTotal) * 100).toFixed(1) : '0';

  // Chart Data: Weekly Attendance
  const weeklyData = weeklyBreakdown(attendanceRecords);
  const weeklyAvg = attendanceRate(attendanceRecords);

  // Monthly Attendance Trend
  const monthlyTrendData = monthlyTrend(attendanceRecords);

  // Department-wise Attendance
  const deptAttendanceData = departments.map(d => ({
    name: d.code,
    attendance: attendanceRate(
      attendanceRecords.filter(r => students.find(st => st.id === r.studentId)?.department === d.name)
    ),
    students: students.filter(st => st.department === d.name).length,
  }));

  // Attendance Distribution Pie
  const pieData = [
    { name: 'Present', value: todayPresent, color: '#22C55E' },
    { name: 'Late', value: todayLate, color: '#F59E0B' },
    { name: 'Absent', value: todayAbsent, color: '#EF4444' },
  ];

  const handleExportAdminSummary = () => {
    const headers = ['Metric', 'Current Value', 'Target', 'Status'];
    const rows = [
      ['Total Students Enrolled', totalStudentsCount, '', ''],
      ['Total Teachers', totalTeachersCount, '', ''],
      ['Departments', totalDeptCount, '', ''],
      ['Total Classes', totalClassCount, '', ''],
      ['Dynamic Sections', totalSectionCount, '', ''],
      ['Today Attendance Rate', `${todayAttendancePct}%`, `>= ${settings.minimumAttendanceThreshold}%`, ''],
    ];
    downloadCsvFile(`Institute_Attendance_Summary_${currentYear?.name}`, headers, rows);
    showToast('Institute Attendance Summary CSV downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Campus Image Scrim */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center bg-gradient-to-r from-[#101624] via-[#151C2B] to-[#101624]"
          style={settings.campusPhotoUrl ? { backgroundImage: `url(${settings.campusPhotoUrl})` } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/90 to-transparent" />
          <div className="absolute inset-0 bg-[#0B0F19]/60 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {settings.instituteCode}
              </span>
              <span className="text-xs text-slate-400 font-mono">Academic Year {currentYear?.name}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, {currentUser?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Institute Attendance Operations Console · {currentDateStr}. Real-time monitoring across all
              academic departments and lecture halls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/admin/attendance-live')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <span>Live Attendance Monitor</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportAdminSummary}
              className="px-4 py-2.5 bg-[#151C2B] hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Animated Stat Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between mb-2 text-slate-400">
            <span className="text-xs font-medium">Total Students</span>
            <GraduationCap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalStudentsCount}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active enrollments</span>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between mb-2 text-slate-400">
            <span className="text-xs font-medium">Faculty Members</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalTeachersCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">{totalDeptCount} departments</div>
        </div>

        {/* Departments */}
        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between mb-2 text-slate-400">
            <span className="text-xs font-medium">Departments</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalDeptCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">{totalCourseCount} courses</div>
        </div>

        {/* Classes & Dynamic Sections */}
        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between mb-2 text-slate-400">
            <span className="text-xs font-medium">Classes / Sections</span>
            <Grid3X3 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {totalClassCount} <span className="text-sm font-normal text-slate-400">/ {totalSectionCount}</span>
          </div>
          <div className="text-[11px] text-amber-400 mt-1">Dynamic sections</div>
        </div>

        {/* Total Subjects */}
        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between mb-2 text-slate-400">
            <span className="text-xs font-medium">Active Subjects</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalSubjectCount}</div>
          <div className="text-[11px] text-cyan-400 mt-1">{subjects.filter(sb => sb.assignedTeacherId).length} assigned</div>
        </div>

        {/* Today's Attendance Rate */}
        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between mb-2 text-slate-400">
            <span className="text-xs font-medium">Today's Attendance</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{todayAttendancePct}%</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {todayPresent}P · {todayLate}L · {todayAbsent}A
          </div>
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Attendance Trend (Area Chart - Col 8) */}
        <div className="lg:col-span-8 bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Weekly Attendance Flow (% Present)</h3>
              <p className="text-xs text-slate-400">Aggregated verification rates across all current sections</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Avg: {weeklyAvg}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
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
                  dataKey="present"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#presentGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Present vs Absent Ratio (Pie Chart - Col 4) */}
        <div className="lg:col-span-4 bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Today's Distribution</h3>
            <p className="text-xs text-slate-400 mb-2">Live biometric recognition status</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101624',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
            <div>
              <div className="text-emerald-400 font-bold font-mono">{todayPresent}</div>
              <div className="text-[10px] text-slate-400">Present</div>
            </div>
            <div>
              <div className="text-amber-400 font-bold font-mono">{todayLate}</div>
              <div className="text-[10px] text-slate-400">Late</div>
            </div>
            <div>
              <div className="text-rose-400 font-bold font-mono">{todayAbsent}</div>
              <div className="text-[10px] text-slate-400">Absent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Department-wise Attendance Bar Chart */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Department-Wise Attendance Performance</h3>
            <p className="text-xs text-slate-400">Comparison across academic engineering disciplines</p>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101624',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="attendance" fill="#60A5FA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom 3-Column Overview: Low Attendance Alerts, Recent Activities, AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Low Attendance Alerts */}
        <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Low Attendance Alerts (&lt;{settings.minimumAttendanceThreshold}%)</span>
            </h3>
            <span className="text-[10px] text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded font-mono">
              Action Required
            </span>
          </div>

          <div className="space-y-2.5">
            {!students.some(s => s.totalClasses > 0 && s.attendanceRate < settings.minimumAttendanceThreshold) && (
              <p className="text-[11px] text-slate-500">No low attendance alerts.</p>
            )}
            {students
              .filter(s => s.totalClasses > 0 && s.attendanceRate < settings.minimumAttendanceThreshold)
              .slice(0, 3)
              .map(student => (
                <div
                  key={student.id}
                  className="p-3 bg-[#101624] border border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <NeutralAvatar src={student.avatar} name={student.name} role="student" size="sm" rounded="rounded-full" className="shrink-0" />
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-slate-200 truncate">{student.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {student.enrollmentNo} · {student.className}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-rose-400 font-mono">
                      {student.attendanceRate}%
                    </div>
                    <div className="text-[10px] text-slate-500">{student.absentDays} absents</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* AI Smart Insights */}
        <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-blue-400" />
              <span>AI Biometric Insights</span>
            </h3>
            <span className="text-[10px] text-blue-400 font-mono">{aiInsights.length}</span>
          </div>

          <div className="space-y-2.5">
            {aiInsights.length === 0 && <p className="text-[11px] text-slate-500">No insights yet.</p>}
            {aiInsights.slice(0, 2).map(insight => (
              <div key={insight.id} className="p-3 bg-[#101624] border border-slate-800 rounded-xl text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-200 truncate">{insight.title}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${
                      insight.severity === 'critical'
                        ? 'text-rose-400 bg-rose-950/80'
                        : 'text-amber-400 bg-amber-950/80'
                    }`}
                  >
                    {insight.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{insight.description}</p>
                <div className="mt-2 text-[10px] text-blue-400 font-mono">{insight.relatedEntity}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Activity */}
        <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Recent System Activities</span>
            </h3>
            <span className="text-[10px] text-slate-400">Audit Trail</span>
          </div>

          <div className="space-y-2.5">
            {auditLogs.length === 0 && <p className="text-[11px] text-slate-500">No activity recorded yet.</p>}
            {auditLogs.slice(0, 3).map(log => (
              <div key={log.id} className="p-3 bg-[#101624] border border-slate-800 rounded-xl text-xs">
                <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
                  <span className="truncate">{log.action}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{log.timestamp.split(' ')[1]}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{log.details}</p>
                <div className="mt-1 text-[10px] text-slate-500 font-mono">By: {log.actorName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
