import { AttendanceRecord } from '../types';

/** All figures here are derived only from real attendance records. Empty input => zeros / empty arrays. */

const isAttended = (r: AttendanceRecord) => r.status === 'Present' || r.status === 'Late';

export const pct = (part: number, total: number): number =>
  total > 0 ? Number(((part / total) * 100).toFixed(1)) : 0;

export const attendanceRate = (records: AttendanceRecord[]): number =>
  pct(records.filter(isAttended).length, records.length);

export const localISODate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Today's date in the user's local time zone (YYYY-MM-DD). */
export const todayISO = (): string => localISODate(new Date());

const dayOf = (iso: string) => new Date(`${iso}T00:00:00`).getDay();

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Percent present / absent / late per weekday (Mon–Fri plus any weekend days that have records). */
export const weeklyBreakdown = (records: AttendanceRecord[]) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  records.forEach(r => {
    const d = WEEKDAYS[dayOf(r.date)];
    if (d && !days.includes(d)) days.push(d);
  });
  return days.map(day => {
    const rs = records.filter(r => WEEKDAYS[dayOf(r.date)] === day);
    return {
      day,
      present: pct(rs.filter(r => r.status === 'Present').length, rs.length),
      absent: pct(rs.filter(r => r.status === 'Absent').length, rs.length),
      late: pct(rs.filter(r => r.status === 'Late').length, rs.length),
    };
  });
};

/** Attendance % per month for months that actually have records, oldest first. */
export const monthlyTrend = (records: AttendanceRecord[]) => {
  const keys = Array.from(new Set(records.map(r => r.date.slice(0, 7)))).sort();
  return keys.map(k => {
    const rs = records.filter(r => r.date.startsWith(k));
    return { month: MONTHS[Number(k.slice(5, 7)) - 1] || k, attendance: attendanceRate(rs) };
  });
};

/** Per-subject attendance for the given records. */
export const subjectBreakdown = (records: AttendanceRecord[]) => {
  const ids = Array.from(new Set(records.map(r => r.subjectId)));
  return ids.map(id => {
    const rs = records.filter(r => r.subjectId === id);
    const present = rs.filter(isAttended).length;
    return {
      subjectId: id,
      subject: rs[0]?.subjectName || '',
      code: '',
      classes: rs.length,
      present,
      attendance: pct(present, rs.length),
    };
  });
};
