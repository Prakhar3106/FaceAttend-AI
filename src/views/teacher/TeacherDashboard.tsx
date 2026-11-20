import React from 'react';
import { useApp } from '../../context/AppContext';
import { weeklyBreakdown, subjectBreakdown, attendanceRate, todayISO } from '../../lib/attendanceStats';
import { NeutralAvatar } from '../../components/common/NeutralAvatar';
import { useNavigate } from '@/lib/router-compat';
import {
  Grid3X3,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Calendar,
  BrainCircuit,
  ArrowRight,
  TrendingUp,
  Camera,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const TeacherDashboard: React.FC = () => {
  const { currentUser, teachers, students, attendanceRecords, aiInsights } = useApp();
  const navigate = useNavigate();

  // Find the logged-in teacher
  const currentTeacher =
    teachers.find(t => t.id === currentUser?.id || t.email === currentUser?.email);

  const assignments = currentTeacher?.assignments || [];

  // Filter students assigned to this teacher's classes/sections
  const assignedClassIds = Array.from(new Set(assignments.map(a => a.classId)));
  const assignedSectionIds = Array.from(new Set(assignments.map(a => a.sectionId)));

  const assignedStudents = students.filter(
    s => assignedClassIds.includes(s.classId) && assignedSectionIds.includes(s.sectionId)
  );

  const teacherRecords = attendanceRecords.filter(r => r.teacherId === currentTeacher?.id);
  const totalAssignedStudents = assignedStudents.length;

  // Chart data
  const teacherWeeklyData = weeklyBreakdown(teacherRecords).map(d => ({ day: d.day, attendance: Math.min(100, d.present + d.late) }));
  const teacherSubjectData = subjectBreakdown(teacherRecords).map(d => ({ subject: d.subject, attendance: d.attendance }));
  const teacherAvg = attendanceRate(teacherRecords);
  const assignedSectionNames = Array.from(new Set(assignments.map(a => a.sectionName))).join(', ');

  // Today's sessions: one per real class/section/subject assignment, marked complete once attendance is saved today
  const today = todayISO();
  let nextMarked = false;
  const todayTimetable = assignments.map(a => {
    const done = attendanceRecords.some(
      r => r.date === today && r.sectionId === a.sectionId && r.subjectId === a.subjectId
    );
    let status = done ? 'Completed' : 'Pending';
    if (!done && !nextMarked) {
      status = 'Next Class';
      nextMarked = true;
    }
    return {
      time: done ? 'Attendance saved' : 'Attendance pending',
      subject: a.subjectName,
      code: a.subjectId,
      class: `${a.className} · ${a.sectionName}`,
      hall: a.academicYearName,
      status,
    };
  });

  return (
    <div className="space-y-6">
      {/* Teacher Profile Header Card */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <NeutralAvatar src={currentTeacher?.avatar} name={currentTeacher?.name} size="lg" rounded="rounded-2xl" className="shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">{currentTeacher?.name || currentUser?.name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold">
                {currentTeacher?.employeeId}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentTeacher?.designation} · {currentTeacher?.department}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {assignments.map(asg => (
                <span
                  key={asg.id}
                  className="px-2 py-0.5 text-[10px] bg-slate-800/80 text-slate-300 rounded border border-slate-700/60"
                >
                  {asg.className} ({asg.sectionName}) · {asg.subjectName.split(' ')[0]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Launch Attendance Button */}
        <button
          onClick={() => navigate('/teacher/live-attendance')}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 shrink-0 group"
        >
          <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Launch AI Face Scanner</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Teacher Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Assigned Classes</span>
            <Grid3X3 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{assignedClassIds.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">{assignments.length} section allocations</div>
        </div>

        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Assigned Students</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalAssignedStudents}</div>
          <div className="text-[11px] text-emerald-400 mt-1">{assignedSectionNames || "No sections assigned"}</div>
        </div>

        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Today's Sessions</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{todayTimetable.length} Classes</div>
          <div className="text-[11px] text-amber-400 mt-1">{todayTimetable.length === 0 ? "No sessions assigned" : `${todayTimetable.filter(t => t.status === 'Completed').length} of ${todayTimetable.length} marked`}</div>
        </div>

        <div className="bg-[#151C2B] border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Class Attendance Avg</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{teacherAvg}%</div>
          <div className="text-[11px] text-slate-400 mt-1">{teacherRecords.length} records</div>
        </div>
      </div>

      {/* Main Grid: Charts & Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Charts (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Weekly Attendance */}
          <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-1">My Classes: Weekly Trend</h3>
            <p className="text-xs text-slate-400 mb-4">Daily percentage attendance for your assigned sections</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={teacherWeeklyData}>
                  <defs>
                    <linearGradient id="teacherGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
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
                    dataKey="attendance"
                    stroke="#22C55E"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#teacherGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Comparison */}
          <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-1">Subject-Wise Attendance Comparison</h3>
            <p className="text-xs text-slate-400 mb-4">Biometric attendance marked by lecture module</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teacherSubjectData}>
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
        </div>

        {/* Right Column: Today's Timetable & Low Attendance (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Today's Timetable */}
          <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Today's Teaching Sessions</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">{todayTimetable.length} slots</span>
            </div>

            <div className="space-y-3">
              {todayTimetable.length === 0 && <p className="text-xs text-slate-500">No class, section or subject has been assigned to you yet.</p>}
              {todayTimetable.map((slot, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs transition-colors ${
                    slot.status === 'Next Class'
                      ? 'bg-blue-950/30 border-blue-600/50'
                      : 'bg-[#101624] border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-slate-400 text-[11px]">{slot.time}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                        slot.status === 'Completed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : slot.status === 'Next Class'
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{slot.subject}</h4>
                  <div className="text-slate-400 mt-1 flex items-center justify-between">
                    <span>{slot.class}</span>
                    <span className="text-slate-500 font-mono text-[10px]">{slot.hall}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Attendance Watchlist */}
          <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Assigned Section Students At Risk (&lt;75%)</span>
            </h3>

            <div className="space-y-2">
              {assignedStudents
                .filter(s => s.totalClasses > 0 && s.attendanceRate < 75)
                .map(st => (
                  <div
                    key={st.id}
                    className="p-2.5 bg-[#101624] border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <NeutralAvatar src={st.avatar} name={st.name} role="student" size="xs" rounded="rounded-full" className="shrink-0" />
                      <div>
                        <div className="font-medium text-slate-200">{st.name}</div>
                        <div className="text-[10px] text-slate-400">{st.enrollmentNo}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-rose-400 font-mono">{st.attendanceRate}%</div>
                      <div className="text-[10px] text-slate-500">{st.absentDays} absents</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
