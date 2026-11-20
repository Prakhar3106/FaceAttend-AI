import { describe, expect, it } from 'vitest';
import { bestMatch, MATCH_THRESHOLD } from '@/lib/face';
import { attendanceRate } from '@/lib/attendanceStats';
import type { AttendanceRecord } from '@/types';

const vec = (v: number) => Array.from({ length: 128 }, () => v);

describe('face matching', () => {
  it('matches a student whose face signature is close enough', () => {
    const m = bestMatch(vec(0.1), [{ id: 's1', descriptor: vec(0.1) }, { id: 's2', descriptor: vec(0.5) }]);
    expect(m?.candidate.id).toBe('s1');
  });

  it('does not mark anyone when no enrolled face is within the threshold', () => {
    // distance = sqrt(128 * 0.1^2) ≈ 1.13, above the 0.5 threshold
    expect(MATCH_THRESHOLD).toBe(0.5);
    expect(bestMatch(vec(0.2), [{ id: 's1', descriptor: vec(0.1) }])).toBeNull();
  });
});

describe('attendance rate', () => {
  const rec = (status: AttendanceRecord['status']) => ({ status }) as AttendanceRecord;
  it('counts present and late as attended', () => {
    expect(attendanceRate([rec('Present'), rec('Late'), rec('Absent'), rec('Absent')])).toBe(50);
  });
  it('is 0 with no records', () => {
    expect(attendanceRate([])).toBe(0);
  });
});
