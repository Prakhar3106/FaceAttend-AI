export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string; // teacher/student record id for faculty & students; auth user id for admins
  authUserId: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  employeeId?: string;
  enrollmentNo?: string;
  department?: string;
  designation?: string;
  course?: string;
  semester?: string;
  classId?: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  classTeacher?: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026–2027"
  isCurrent: boolean;
  status: 'active' | 'archived';
  startDate: string;
  endDate: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  hodName: string;
  totalTeachers: number;
  totalStudents: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  durationYears: number;
  totalSemesters: number;
}

export interface ClassItem {
  id: string;
  code: string;
  name: string;
  courseId: string;
  semesterNumber: number;
  academicYearId: string;
}

export interface SectionItem {
  id: string;
  classId: string;
  name: string; // Dynamic! Section A, B, C, D, E, F, G, etc.
  maxCapacity: number;
  studentCount: number;
  status: 'active' | 'inactive';
}

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
  courseId: string;
  semesterNumber: number;
  classId: string;
  sectionId?: string;
  assignedTeacherId?: string;
  assignedTeacherName?: string;
  credits: number;
  studentCount: number;
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  academicYearId: string;
  academicYearName: string;
  courseId: string;
  courseName: string;
  classId: string;
  className: string;
  semesterNumber: number;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
}

export interface Teacher {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  username: string;
  status: 'active' | 'inactive';
  avatar: string;
  avatarPath?: string | null;
  joinedDate: string;
  assignments: TeacherAssignment[];
  hasLogin?: boolean;
}

export type FaceEnrollmentStatus = 'Enrolled' | 'Pending' | 'Not Enrolled' | 'Needs Review' | 'Revoked';

export interface Student {
  id: string;
  enrollmentNo: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  department: string;
  course: string;
  academicYear: string;
  semester: number;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  username: string;
  status: 'active' | 'inactive';
  avatar: string;
  faceStatus: FaceEnrollmentStatus;
  enrollmentDate?: string;
  consentGiven: boolean;
  avatarPath?: string | null;
  /** Stored face samples (128-number signatures), up to 5 per student. */
  faceDescriptors: number[][];
  hasLogin?: boolean;
  attendanceRate: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalClasses: number;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Unknown Face' | 'Pending Verification';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEnrollment: string;
  studentPhoto: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  academicYear: string;
  date: string;
  status: AttendanceStatus;
  timeDetected: string;
  confidenceScore?: number;
  verified: boolean;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  relatedEntity: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'trend' | 'risk' | 'pattern' | 'suggestion';
  date: string;
  metricImpact?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'attendance' | 'alert' | 'announcement' | 'academic' | 'system';
  timestamp: string;
  read: boolean;
  targetRole: 'all' | 'admin' | 'teacher' | 'student';
}

export interface AuditLog {
  id: string;
  action: string;
  actorName: string;
  actorRole: UserRole;
  timestamp: string;
  details: string;
  ipAddress: string;
}

export interface InstituteSettings {
  id?: string;
  instituteName: string;
  instituteCode: string;
  campusAddress: string;
  contactEmail: string;
  contactPhone: string;
  hodName: string;
  logoUrl?: string; // Uploaded original institute logo
  campusPhotoUrl?: string; // Uploaded real campus/institute photograph
  isConfigured?: boolean; // Setup completion flag
  minimumAttendanceThreshold: number; // e.g. 75%
  attendanceWindowMinutes: number; // e.g. 15
  allowTeacherCustomSections: boolean;
  requireFaceConsentNotice: boolean;
}
