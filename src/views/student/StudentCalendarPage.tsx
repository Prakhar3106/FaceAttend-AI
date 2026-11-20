import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Coffee,
  Info,
  BookOpen,
} from 'lucide-react';

export const StudentCalendarPage: React.FC = () => {
  const { currentUser, currentRole, students, attendanceRecords } = useApp();

  const currentStudent =
    students.find(s => s.id === currentUser?.id || s.email === currentUser?.email);
  // Students see their own days; teachers see the sessions of their assigned sections
  const studentRecords =
    currentRole === 'student'
      ? attendanceRecords.filter(r => r.studentId === (currentStudent?.id || currentUser?.id))
      : attendanceRecords;

  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Calendar Attendance Map (Day -> State)
  // Green = Present, Red = Absent, Yellow = Late, Grey = Holiday / Weekend
  const dateKey = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const recordsForDay = (day: number) => studentRecords.filter(r => r.date === dateKey(day));
  const getDayStatus = (day: number, dayOfWeek: number) => {
    const rs = recordsForDay(day);
    if (rs.some(r => r.status === 'Absent')) return { status: 'Absent', label: 'Absent' };
    if (rs.some(r => r.status === 'Late')) return { status: 'Late', label: 'Late Arrival' };
    if (rs.some(r => r.status === 'Present')) return { status: 'Present', label: 'Biometric Verified' };
    if (dayOfWeek === 0 || dayOfWeek === 6) return { status: 'Holiday', label: 'Weekend' };
    return { status: 'Scheduled', label: 'No record' };
  };

  // Days in month logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  // Day metrics summary
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let holidayCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(currentYear, currentMonth, d).getDay();
    const s = getDayStatus(d, dow);
    if (s.status === 'Present') presentCount++;
    else if (s.status === 'Absent') absentCount++;
    else if (s.status === 'Late') lateCount++;
    else if (s.status === 'Holiday') holidayCount++;
  }

  const selectedDayStatus = selectedDay
    ? getDayStatus(selectedDay, new Date(currentYear, currentMonth, selectedDay).getDay())
    : null;

  return (
    <div className="space-y-6">
      {/* Header and Legend Bar */}
      <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Monthly Attendance Calendar</h2>
          </div>
          <p className="text-xs text-slate-400">
            Click on any date to inspect lecture attendance breakdown and time stamps. Read-only record.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-300">Late</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-slate-300">Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-700" />
            <span className="text-slate-400">Holiday / Off</span>
          </div>
        </div>
      </div>

      {/* Main Calendar Viewport + Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (Col 8) */}
        <div className="lg:col-span-8 bg-[#151C2B] border border-slate-800 rounded-2xl p-6 shadow-xl">
          {/* Calendar Controls */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">
                {monthNames[currentMonth]} {currentYear}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 bg-[#101624] hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/80 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentMonth(10);
                  setCurrentYear(2026);
                  setSelectedDay(3);
                }}
                className="px-3 py-1.5 bg-[#101624] hover:bg-slate-800 text-xs text-slate-300 rounded-lg border border-slate-700/80 transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 bg-[#101624] hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/80 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Header */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset tiles */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-14 sm:h-20 rounded-xl bg-slate-900/20 opacity-30" />
            ))}

            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dow = new Date(currentYear, currentMonth, day).getDay();
              const dayInfo = getDayStatus(day, dow);
              const isSelected = selectedDay === day;
              const isToday = currentYear === 2026 && currentMonth === 10 && day === 3;

              let tileBg = 'bg-[#101624] border-slate-800';
              let badgeColor = 'bg-slate-700';

              if (dayInfo.status === 'Present') {
                tileBg = 'bg-emerald-950/20 border-emerald-900/40 hover:bg-emerald-950/40';
                badgeColor = 'bg-emerald-500';
              } else if (dayInfo.status === 'Late') {
                tileBg = 'bg-amber-950/20 border-amber-900/40 hover:bg-amber-950/40';
                badgeColor = 'bg-amber-500';
              } else if (dayInfo.status === 'Absent') {
                tileBg = 'bg-rose-950/20 border-rose-900/40 hover:bg-rose-950/40';
                badgeColor = 'bg-rose-500';
              } else if (dayInfo.status === 'Holiday') {
                tileBg = 'bg-slate-900/40 border-slate-800 text-slate-600';
                badgeColor = 'bg-slate-700';
              }

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`h-14 sm:h-20 p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${tileBg} ${
                    isSelected ? 'ring-2 ring-blue-500 scale-[1.02]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-mono font-bold ${isToday ? 'text-blue-400' : 'text-slate-200'}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="hidden sm:inline-block text-[9px] bg-blue-600 text-white px-1 rounded font-bold">
                        TODAY
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${badgeColor}`} />
                    <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                      {dayInfo.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details Panel (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-2">Month Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 bg-[#101624] border border-slate-800 rounded-xl">
                <div className="text-emerald-400 font-bold text-lg">{presentCount}</div>
                <div className="text-[10px] text-slate-400">Present Days</div>
              </div>
              <div className="p-3 bg-[#101624] border border-slate-800 rounded-xl">
                <div className="text-amber-400 font-bold text-lg">{lateCount}</div>
                <div className="text-[10px] text-slate-400">Late Days</div>
              </div>
              <div className="p-3 bg-[#101624] border border-slate-800 rounded-xl">
                <div className="text-rose-400 font-bold text-lg">{absentCount}</div>
                <div className="text-[10px] text-slate-400">Absent Days</div>
              </div>
              <div className="p-3 bg-[#101624] border border-slate-800 rounded-xl">
                <div className="text-slate-400 font-bold text-lg">{holidayCount}</div>
                <div className="text-[10px] text-slate-400">Holidays / Off</div>
              </div>
            </div>
          </div>

          {/* Selected Date Detail Inspection */}
          <div className="bg-[#151C2B] border border-slate-800 rounded-2xl p-5 shadow-xl">
            {selectedDay ? (
              <div className="space-y-3">
                <div className="pb-2 border-b border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Selected Date</div>
                  <h4 className="text-base font-bold text-white">
                    {monthNames[currentMonth]} {selectedDay}, {currentYear}
                  </h4>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedDayStatus?.status === 'Present'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : selectedDayStatus?.status === 'Late'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : selectedDayStatus?.status === 'Absent'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {selectedDayStatus?.status} · {selectedDayStatus?.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {recordsForDay(selectedDay).length === 0 && (
                    <div className="text-[11px] text-slate-500">No attendance recorded for this day.</div>
                  )}
                  {recordsForDay(selectedDay).map(r => (
                    <div key={r.id} className="p-2.5 bg-[#101624] border border-slate-800 rounded-lg">
                      <div className="text-slate-200 font-medium">{r.subjectName}</div>
                      <div className="text-[11px] text-slate-400">{r.className} {r.sectionName}</div>
                      <div className="text-[10px] text-emerald-400 mt-1 font-mono">
                        {r.status} · Detected: {r.timeDetected}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-500 italic mt-2">
                  Students cannot modify attendance marks. Contact department head for inquiries.
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500">
                Click any calendar tile to view detailed period verifications.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
