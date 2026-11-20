import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { provisionMemberLogin, removeMember, writeAuditLog } from '@/lib/accounts.functions';
import { pct, todayISO } from '@/lib/attendanceStats';
import { normalizeFaceSamples, MAX_FACE_SAMPLES } from '@/lib/face';
import {
  User,
  UserRole,
  AcademicYear,
  Department,
  Course,
  ClassItem,
  SectionItem,
  SubjectItem,
  Teacher,
  Student,
  AttendanceRecord,
  TeacherAssignment,
  AIInsight,
  NotificationItem,
  AuditLog,
  InstituteSettings,
} from '../types';

export const MEDIA_BUCKET = 'faceattend-media';

type MediaFolder = 'institute' | 'teachers' | 'students' | 'profiles';
type Toast = { message: string; type: 'success' | 'error' | 'info' } | null;
type RoleRow = { role: UserRole; institute_id: string };
type Profile = Tables<'profiles'>;

export interface InstituteRegistration {
  instituteName: string;
  instituteCode: string;
  campusAddress: string;
  contactEmail: string;
  contactPhone: string;
  hodName: string;
  logo: Blob;
  campusPhoto: Blob;
}

type NewTeacher = Omit<Teacher, 'id' | 'assignments'> & { password?: string; photo?: Blob | null };
type NewStudent = Omit<
  Student,
  'id' | 'presentDays' | 'absentDays' | 'lateDays' | 'totalClasses' | 'attendanceRate'
> & { password?: string; photo?: Blob | null };

interface AppContextType {
  authReady: boolean;
  dataLoading: boolean;
  isSignedIn: boolean;
  authEmail: string | null;
  needsInstituteSetup: boolean;
  currentUser: User | null;
  currentRole: UserRole | null;
  signIn: (email: string, password: string) => Promise<{ error?: string; role: UserRole | null }>;
  logout: () => Promise<void>;
  registerInstitute: (data: InstituteRegistration) => Promise<boolean>;
  refresh: () => Promise<void>;
  toast: Toast;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  profilePreferences: { email_alerts: boolean; sms_alerts: boolean };
  updateMyProfile: (updates: { phone?: string; fullName?: string; preferences?: Record<string, boolean> }) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;

  settings: InstituteSettings;
  updateSettings: (newSettings: Partial<InstituteSettings>, media?: { logo?: Blob | null; campusPhoto?: Blob | null }) => Promise<boolean>;

  academicYears: AcademicYear[];
  addAcademicYear: (year: Omit<AcademicYear, 'id'>) => Promise<boolean>;
  setCurrentAcademicYear: (id: string) => Promise<void>;

  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id' | 'totalTeachers' | 'totalStudents'> & Partial<Department>) => Promise<boolean>;

  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => Promise<boolean>;

  classes: ClassItem[];
  addClassItem: (cls: Omit<ClassItem, 'id'>) => Promise<boolean>;

  sections: SectionItem[];
  addSection: (sec: Omit<SectionItem, 'id' | 'studentCount'> & Partial<SectionItem>) => Promise<boolean>;
  toggleSectionStatus: (id: string) => Promise<void>;

  subjects: SubjectItem[];
  addSubject: (subj: Omit<SubjectItem, 'id' | 'studentCount'> & Partial<SubjectItem>) => Promise<boolean>;

  teachers: Teacher[];
  addTeacher: (teacher: NewTeacher) => Promise<boolean>;
  updateTeacher: (id: string, updates: Partial<Teacher>, photo?: Blob | null) => Promise<boolean>;
  deleteTeacher: (id: string) => Promise<boolean>;
  assignTeacher: (assignment: Omit<TeacherAssignment, 'id'>) => Promise<boolean>;
  removeAssignment: (id: string) => Promise<void>;

  students: Student[];
  addStudent: (student: NewStudent) => Promise<boolean>;
  importStudents: (rows: Omit<NewStudent, 'password' | 'photo'>[]) => Promise<{ inserted: number; failed: string[] }>;
  updateStudent: (id: string, updates: Partial<Student>, photo?: Blob | null) => Promise<boolean>;
  deleteStudent: (id: string) => Promise<boolean>;
  updateFaceEnrollment: (
    studentId: string,
    status: Student['faceStatus'],
    consent: boolean,
    enrollment?: { descriptors: number[][]; snapshot?: Blob | null }
  ) => Promise<boolean>;
  setMemberPassword: (kind: 'teacher' | 'student', recordId: string, password: string) => Promise<boolean>;

  attendanceRecords: AttendanceRecord[];
  markLiveAttendance: (records: AttendanceRecord[]) => Promise<boolean>;

  aiInsights: AIInsight[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  auditLogs: AuditLog[];
  logAction: (action: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const EMPTY_SETTINGS: InstituteSettings = {
  instituteName: '',
  instituteCode: '',
  campusAddress: '',
  contactEmail: '',
  contactPhone: '',
  hodName: '',
  logoUrl: undefined,
  campusPhotoUrl: undefined,
  isConfigured: false,
  minimumAttendanceThreshold: 75,
  attendanceWindowMinutes: 15,
  allowTeacherCustomSections: true,
  requireFaceConsentNotice: true,
};

const fmtTimestamp = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const extOf = (blob: Blob) => {
  const t = blob.type || 'image/jpeg';
  if (t.includes('png')) return 'png';
  if (t.includes('webp')) return 'webp';
  if (t.includes('svg')) return 'svg';
  if (t.includes('gif')) return 'gif';
  return 'jpg';
};

const friendly = (msg?: string | null) => {
  if (!msg) return 'Something went wrong. Please try again.';
  if (msg.includes('duplicate key')) {
    if (msg.includes('employee_id')) return 'This Employee ID already exists in your institute.';
    if (msg.includes('enrollment_no')) return 'This Enrollment number already exists in your institute.';
    if (msg.includes('email')) return 'This email is already used in your institute.';
    if (msg.includes('code')) return 'This code already exists.';
    return 'This record already exists.';
  }
  if (msg.includes('row-level security')) return 'You are not allowed to perform this action.';
  return msg;
};

async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>) {
  const page = 1000;
  const out: T[] = [];
  for (let from = 0; from < 50000; from += page) {
    const { data, error } = await build(from, from + page - 1);
    if (error || !data) break;
    out.push(...data);
    if (data.length < page) break;
  }
  return out;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const provisionFn = useServerFn(provisionMemberLogin);
  const removeFn = useServerFn(removeMember);
  const auditFn = useServerFn(writeAuditLog);

  const [authReady, setAuthReady] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [roleRow, setRoleRow] = useState<RoleRow | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [toast, setToast] = useState<Toast>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Raw rows
  const [institute, setInstitute] = useState<Tables<'institutes'> | null>(null);
  const [yearRows, setYearRows] = useState<Tables<'academic_years'>[]>([]);
  const [deptRows, setDeptRows] = useState<Tables<'departments'>[]>([]);
  const [courseRows, setCourseRows] = useState<Tables<'courses'>[]>([]);
  const [classRows, setClassRows] = useState<Tables<'classes'>[]>([]);
  const [sectionRows, setSectionRows] = useState<Tables<'sections'>[]>([]);
  const [subjectRows, setSubjectRows] = useState<Tables<'subjects'>[]>([]);
  const [teacherRows, setTeacherRows] = useState<Tables<'teachers'>[]>([]);
  const [assignmentRows, setAssignmentRows] = useState<Tables<'teacher_assignments'>[]>([]);
  const [studentRows, setStudentRows] = useState<Tables<'students'>[]>([]);
  const [attendanceRows, setAttendanceRows] = useState<Tables<'attendance_records'>[]>([]);
  const [notificationRows, setNotificationRows] = useState<Tables<'notifications'>[]>([]);
  const [auditRows, setAuditRows] = useState<Tables<'audit_logs'>[]>([]);
  const [signed, setSigned] = useState<Record<string, string>>({});

  const signPaths = useCallback(async (paths: (string | null | undefined)[]) => {
    const wanted = Array.from(new Set(paths.filter((p): p is string => !!p)));
    if (wanted.length === 0) return;
    const { data } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrls(wanted, 60 * 60 * 6);
    if (!data) return;
    setSigned(prev => {
      const next = { ...prev };
      data.forEach(d => {
        if (d.path && d.signedUrl) next[d.path] = d.signedUrl;
      });
      return next;
    });
  }, []);

  const clearData = useCallback(() => {
    setInstitute(null);
    setYearRows([]);
    setDeptRows([]);
    setCourseRows([]);
    setClassRows([]);
    setSectionRows([]);
    setSubjectRows([]);
    setTeacherRows([]);
    setAssignmentRows([]);
    setStudentRows([]);
    setAttendanceRows([]);
    setNotificationRows([]);
    setAuditRows([]);
    setSigned({});
  }, []);

  // ---------- Loaders ----------
  const loaders = useMemo(
    () => ({
      institute: async (instId: string) => {
        const { data } = await supabase.from('institutes').select('*').eq('id', instId).maybeSingle();
        setInstitute(data);
        return [data?.logo_path, data?.campus_photo_path];
      },
      years: async () => {
        const { data } = await supabase.from('academic_years').select('*').order('start_date', { ascending: true });
        setYearRows(data || []);
        return [];
      },
      departments: async () => {
        const { data } = await supabase.from('departments').select('*').order('created_at');
        setDeptRows(data || []);
        return [];
      },
      courses: async () => {
        const { data } = await supabase.from('courses').select('*').order('created_at');
        setCourseRows(data || []);
        return [];
      },
      classes: async () => {
        const { data } = await supabase.from('classes').select('*').order('created_at');
        setClassRows(data || []);
        return [];
      },
      sections: async () => {
        const { data } = await supabase.from('sections').select('*').order('name');
        setSectionRows(data || []);
        return [];
      },
      subjects: async () => {
        const { data } = await supabase.from('subjects').select('*').order('code');
        setSubjectRows(data || []);
        return [];
      },
      teachers: async () => {
        const { data } = await supabase.from('teachers').select('*').order('name');
        setTeacherRows(data || []);
        return (data || []).map(t => t.avatar_path);
      },
      assignments: async () => {
        const { data } = await supabase.from('teacher_assignments').select('*').order('created_at');
        setAssignmentRows(data || []);
        return [];
      },
      students: async () => {
        const rows = await fetchAll<Tables<'students'>>((from, to) =>
          supabase.from('students').select('*').order('enrollment_no').range(from, to)
        );
        setStudentRows(rows);
        return rows.map(s => s.avatar_path);
      },
      attendance: async () => {
        const rows = await fetchAll<Tables<'attendance_records'>>((from, to) =>
          supabase.from('attendance_records').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }).range(from, to)
        );
        setAttendanceRows(rows);
        return [];
      },
      notifications: async () => {
        const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(200);
        setNotificationRows(data || []);
        return [];
      },
      audit: async () => {
        const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(500);
        setAuditRows(data || []);
        return [];
      },
    }),
    []
  );

  type LoaderKey = keyof typeof loaders;
  const roleRef = useRef<RoleRow | null>(null);
  roleRef.current = roleRow;

  const reload = useCallback(
    async (keys: LoaderKey[]) => {
      const r = roleRef.current;
      if (!r) return;
      const results = await Promise.all(
        keys.map(k => {
          if (k === 'institute') return loaders.institute(r.institute_id);
          if (k === 'audit' && r.role !== 'admin') return Promise.resolve([] as (string | null | undefined)[]);
          return (loaders[k] as () => Promise<(string | null | undefined)[]>)();
        })
      );
      await signPaths(results.flat());
    },
    [loaders, signPaths]
  );

  const loadSession = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setAuthUserId(null);
      setAuthEmail(null);
      setRoleRow(null);
      setProfile(null);
      clearData();
      setAuthReady(true);
      return;
    }
    setAuthUserId(user.id);
    setAuthEmail(user.email ?? null);
    setDataLoading(true);
    const [{ data: role }, { data: prof }] = await Promise.all([
      supabase.from('user_roles').select('role, institute_id').eq('user_id', user.id).maybeSingle(),
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    ]);
    setProfile(prof);
    const r = role ? ({ role: role.role as UserRole, institute_id: role.institute_id } as RoleRow) : null;
    setRoleRow(r);
    roleRef.current = r;
    if (r) {
      await reload([
        'institute',
        'years',
        'departments',
        'courses',
        'classes',
        'sections',
        'subjects',
        'teachers',
        'assignments',
        'students',
        'attendance',
        'notifications',
        'audit',
      ]);
      if (prof?.avatar_path) await signPaths([prof.avatar_path]);
    } else {
      clearData();
    }
    setDataLoading(false);
    setAuthReady(true);
  }, [clearData, reload, signPaths]);

  useEffect(() => {
    // "Remember me" unchecked: end the session when the browser was closed
    if (localStorage.getItem('fa_no_remember') === '1' && !sessionStorage.getItem('fa_session_alive')) {
      localStorage.removeItem('fa_no_remember');
      void supabase.auth.signOut();
    }
    const { data: sub } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        setTimeout(() => {
          void loadSession();
        }, 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadSession]);

  // Live notifications refresh every minute while signed in
  useEffect(() => {
    if (!roleRow) return;
    const t = setInterval(() => void reload(['notifications']), 60000);
    return () => clearInterval(t);
  }, [roleRow, reload]);

  const uploadMedia = useCallback(
    async (folder: MediaFolder, blob: Blob, instituteIdOverride?: string): Promise<string | null> => {
      const inst = instituteIdOverride || roleRef.current?.institute_id;
      if (!inst) return null;
      const prefix = folder === 'profiles' ? `${inst}/profiles/${authUserId}` : `${inst}/${folder}`;
      const path = `${prefix}/${crypto.randomUUID()}.${extOf(blob)}`;
      const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
      if (error) {
        showToast(`Photo upload failed: ${error.message}`, 'error');
        return null;
      }
      return path;
    },
    [authUserId, showToast]
  );

  const logAction = useCallback(
    (action: string, details: string) => {
      if (!roleRef.current) return;
      void auditFn({ data: { action, details } })
        .then(() => {
          if (roleRef.current?.role === 'admin') void reload(['audit']);
        })
        .catch(() => undefined);
    },
    [auditFn, reload]
  );

  // ---------- Derived, UI-shaped data ----------
  const url = useCallback((path?: string | null) => (path ? signed[path] || '' : ''), [signed]);

  const settings: InstituteSettings = useMemo(() => {
    if (!institute) return EMPTY_SETTINGS;
    return {
      id: institute.id,
      instituteName: institute.name,
      instituteCode: institute.code,
      campusAddress: institute.campus_address,
      contactEmail: institute.contact_email,
      contactPhone: institute.contact_phone,
      hodName: institute.hod_name,
      logoUrl: url(institute.logo_path) || undefined,
      campusPhotoUrl: url(institute.campus_photo_path) || undefined,
      isConfigured: true,
      minimumAttendanceThreshold: institute.minimum_attendance_threshold,
      attendanceWindowMinutes: institute.attendance_window_minutes,
      allowTeacherCustomSections: institute.allow_teacher_custom_sections,
      requireFaceConsentNotice: institute.require_face_consent_notice,
    };
  }, [institute, url]);

  const academicYears: AcademicYear[] = useMemo(
    () =>
      yearRows.map(y => ({
        id: y.id,
        name: y.name,
        isCurrent: y.is_current,
        status: (y.status as AcademicYear['status']) || 'active',
        startDate: y.start_date || '',
        endDate: y.end_date || '',
      })),
    [yearRows]
  );

  const classMap = useMemo(() => new Map(classRows.map(c => [c.id, c])), [classRows]);
  const sectionMap = useMemo(() => new Map(sectionRows.map(s => [s.id, s])), [sectionRows]);
  const subjectMap = useMemo(() => new Map(subjectRows.map(s => [s.id, s])), [subjectRows]);
  const courseMap = useMemo(() => new Map(courseRows.map(c => [c.id, c])), [courseRows]);
  const teacherMap = useMemo(() => new Map(teacherRows.map(t => [t.id, t])), [teacherRows]);
  const yearMap = useMemo(() => new Map(yearRows.map(y => [y.id, y])), [yearRows]);
  const studentMap = useMemo(() => new Map(studentRows.map(s => [s.id, s])), [studentRows]);

  const attendanceRecords: AttendanceRecord[] = useMemo(
    () =>
      attendanceRows.map(r => {
        const st = studentMap.get(r.student_id);
        const t = r.teacher_id ? teacherMap.get(r.teacher_id) : undefined;
        return {
          id: r.id,
          studentId: r.student_id,
          studentName: st?.name || (roleRow?.role === 'student' ? profile?.full_name || '' : ''),
          studentEnrollment: st?.enrollment_no || '',
          studentPhoto: url(st?.avatar_path),
          teacherId: r.teacher_id || '',
          teacherName: t?.name || r.marked_by_name || '',
          subjectId: r.subject_id,
          subjectName: subjectMap.get(r.subject_id)?.name || '',
          classId: r.class_id || '',
          className: (r.class_id && classMap.get(r.class_id)?.name) || '',
          sectionId: r.section_id || '',
          sectionName: (r.section_id && sectionMap.get(r.section_id)?.name) || '',
          academicYear: r.academic_year,
          date: r.date,
          status: r.status as AttendanceRecord['status'],
          timeDetected: r.time_detected,
          confidenceScore: r.confidence_score == null ? undefined : Number(r.confidence_score),
          verified: r.verified,
        };
      }),
    [attendanceRows, studentMap, teacherMap, subjectMap, classMap, sectionMap, url, roleRow, profile]
  );

  const teachers: Teacher[] = useMemo(
    () =>
      teacherRows.map(t => ({
        id: t.id,
        employeeId: t.employee_id,
        name: t.name,
        email: t.email,
        phone: t.phone,
        department: t.department,
        designation: t.designation,
        username: t.username,
        status: (t.status as Teacher['status']) || 'active',
        avatar: url(t.avatar_path),
        avatarPath: t.avatar_path,
        joinedDate: t.joined_date,
        hasLogin: !!t.user_id,
        assignments: assignmentRows
          .filter(a => a.teacher_id === t.id)
          .map(a => ({
            id: a.id,
            teacherId: a.teacher_id,
            teacherName: t.name,
            academicYearId: a.academic_year_id || '',
            academicYearName: (a.academic_year_id && yearMap.get(a.academic_year_id)?.name) || '',
            courseId: a.course_id || '',
            courseName: (a.course_id && courseMap.get(a.course_id)?.name) || '',
            classId: a.class_id,
            className: classMap.get(a.class_id)?.name || '',
            semesterNumber: a.semester_number,
            sectionId: a.section_id,
            sectionName: sectionMap.get(a.section_id)?.name || '',
            subjectId: a.subject_id,
            subjectName: subjectMap.get(a.subject_id)?.name || '',
          })),
      })),
    [teacherRows, assignmentRows, url, yearMap, courseMap, classMap, sectionMap, subjectMap]
  );

  const students: Student[] = useMemo(() => {
    const byStudent = new Map<string, Tables<'attendance_records'>[]>();
    attendanceRows.forEach(r => {
      const list = byStudent.get(r.student_id);
      if (list) list.push(r);
      else byStudent.set(r.student_id, [r]);
    });
    return studentRows.map(s => {
      const recs = byStudent.get(s.id) || [];
      const present = recs.filter(r => r.status === 'Present').length;
      const late = recs.filter(r => r.status === 'Late').length;
      const absent = recs.filter(r => r.status === 'Absent').length;
      const faceSamples = normalizeFaceSamples(s.face_descriptor);
      return {
        id: s.id,
        enrollmentNo: s.enrollment_no,
        name: s.name,
        email: s.email,
        phone: s.phone,
        dob: s.dob || '',
        department: s.department,
        course: s.course,
        academicYear: s.academic_year,
        semester: s.semester,
        classId: s.class_id || '',
        className: (s.class_id && classMap.get(s.class_id)?.name) || '',
        sectionId: s.section_id || '',
        sectionName: (s.section_id && sectionMap.get(s.section_id)?.name) || '',
        username: s.username,
        status: (s.status as Student['status']) || 'active',
        avatar: url(s.avatar_path),
        avatarPath: s.avatar_path,
        faceStatus: s.face_status as Student['faceStatus'],
        faceDescriptors: faceSamples,
        enrollmentDate: s.enrollment_date || undefined,
        consentGiven: s.consent_given,
        hasLogin: !!s.user_id,
        presentDays: present,
        lateDays: late,
        absentDays: absent,
        totalClasses: recs.length,
        attendanceRate: pct(present + late, recs.length),
      };
    });
  }, [studentRows, attendanceRows, classMap, sectionMap, url]);

  const departments: Department[] = useMemo(
    () =>
      deptRows.map(d => ({
        id: d.id,
        code: d.code,
        name: d.name,
        hodName: d.hod_name,
        totalTeachers: teacherRows.filter(t => t.department === d.name).length,
        totalStudents: studentRows.filter(s => s.department === d.name).length,
      })),
    [deptRows, teacherRows, studentRows]
  );

  const courses: Course[] = useMemo(
    () =>
      courseRows.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        departmentId: c.department_id || '',
        durationYears: c.duration_years,
        totalSemesters: c.total_semesters,
      })),
    [courseRows]
  );

  const classes: ClassItem[] = useMemo(
    () =>
      classRows.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        courseId: c.course_id || '',
        semesterNumber: c.semester_number,
        academicYearId: c.academic_year_id || '',
      })),
    [classRows]
  );

  const sections: SectionItem[] = useMemo(
    () =>
      sectionRows.map(s => ({
        id: s.id,
        classId: s.class_id,
        name: s.name,
        maxCapacity: s.max_capacity,
        studentCount: studentRows.filter(st => st.section_id === s.id).length,
        status: (s.status as SectionItem['status']) || 'active',
      })),
    [sectionRows, studentRows]
  );

  const subjects: SubjectItem[] = useMemo(
    () =>
      subjectRows.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        courseId: s.course_id || '',
        semesterNumber: s.semester_number,
        classId: s.class_id || '',
        sectionId: s.section_id || undefined,
        assignedTeacherId: s.assigned_teacher_id || undefined,
        assignedTeacherName: (s.assigned_teacher_id && teacherMap.get(s.assigned_teacher_id)?.name) || undefined,
        credits: s.credits,
        studentCount: studentRows.filter(
          st => st.class_id === s.class_id && (!s.section_id || st.section_id === s.section_id)
        ).length,
      })),
    [subjectRows, teacherMap, studentRows]
  );

  const notifications: NotificationItem[] = useMemo(
    () =>
      notificationRows.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        category: n.category as NotificationItem['category'],
        timestamp: fmtTimestamp(n.created_at),
        read: n.read,
        targetRole: n.target_role as NotificationItem['targetRole'],
      })),
    [notificationRows]
  );

  const auditLogs: AuditLog[] = useMemo(
    () =>
      auditRows.map(a => ({
        id: a.id,
        action: a.action,
        actorName: a.actor_name,
        actorRole: (a.actor_role as UserRole) || 'admin',
        timestamp: fmtTimestamp(a.created_at),
        details: a.details,
        ipAddress: a.ip_address || '—',
      })),
    [auditRows]
  );

  const aiInsights: AIInsight[] = useMemo(() => {
    const out: AIInsight[] = [];
    const today = todayISO();
    const threshold = settings.minimumAttendanceThreshold;
    if (attendanceRows.length > 0) {
      const bySection = new Map<string, Tables<'attendance_records'>[]>();
      attendanceRows.forEach(r => {
        if (!r.section_id) return;
        const l = bySection.get(r.section_id);
        if (l) l.push(r);
        else bySection.set(r.section_id, [r]);
      });
      Array.from(bySection.entries())
        .map(([sid, rs]) => ({ sid, rs, rate: pct(rs.filter(r => r.status !== 'Absent').length, rs.length) }))
        .filter(x => x.rate < threshold)
        .sort((a, b) => a.rate - b.rate)
        .slice(0, 3)
        .forEach(x => {
          const sec = sectionMap.get(x.sid);
          const cls = sec ? classMap.get(sec.class_id) : undefined;
          out.push({
            id: `section-${x.sid}`,
            title: `Low attendance in ${cls?.name || 'class'} · ${sec?.name || 'section'}`,
            description: `Recorded attendance for this section is ${x.rate}% across ${x.rs.length} entries, below the institute threshold of ${threshold}%.`,
            relatedEntity: `${cls?.code || cls?.name || ''} ${sec?.name || ''}`.trim(),
            severity: x.rate < threshold - 15 ? 'critical' : 'high',
            category: 'risk',
            date: today,
            metricImpact: `${x.rate}%`,
          });
        });
      const late = attendanceRows.filter(r => r.status === 'Late').length;
      const lateShare = pct(late, attendanceRows.length);
      if (late > 0 && lateShare >= 10) {
        out.push({
          id: 'late-pattern',
          title: 'Frequent late arrivals',
          description: `${lateShare}% of all recorded attendance entries are late arrivals (${late} of ${attendanceRows.length}).`,
          relatedEntity: settings.instituteName || 'Institute',
          severity: 'medium',
          category: 'pattern',
          date: today,
          metricImpact: `${lateShare}% late`,
        });
      }
    }
    const atRisk = students.filter(s => s.totalClasses > 0 && s.attendanceRate < threshold);
    if (atRisk.length > 0) {
      out.push({
        id: 'at-risk',
        title: `${atRisk.length} student${atRisk.length > 1 ? 's' : ''} below ${threshold}%`,
        description: `These students are below the minimum attendance requirement and may need counselling before examinations.`,
        relatedEntity: 'Retention watchlist',
        severity: atRisk.length >= 5 ? 'critical' : 'high',
        category: 'risk',
        date: today,
        metricImpact: `${atRisk.length} flagged`,
      });
    }
    const notEnrolled = students.filter(s => s.faceStatus !== 'Enrolled').length;
    if (notEnrolled > 0) {
      out.push({
        id: 'face-pending',
        title: 'Face enrollment incomplete',
        description: `${notEnrolled} of ${students.length} students do not have an enrolled face yet. They can only be marked manually during live attendance.`,
        relatedEntity: 'Face Enrollment',
        severity: 'medium',
        category: 'suggestion',
        date: today,
        metricImpact: `${notEnrolled} pending`,
      });
    }
    return out;
  }, [attendanceRows, students, settings, sectionMap, classMap]);

  // ---------- Current user ----------
  const currentUser: User | null = useMemo(() => {
    if (!authUserId || !roleRow) return null;
    const role = roleRow.role;
    if (role === 'teacher') {
      const t = teacherRows.find(x => x.user_id === authUserId);
      return {
        id: t?.id || authUserId,
        authUserId,
        name: t?.name || profile?.full_name || authEmail || '',
        role,
        email: t?.email || authEmail || '',
        avatar: url(t?.avatar_path) || url(profile?.avatar_path),
        employeeId: t?.employee_id,
        department: t?.department,
        designation: t?.designation,
      };
    }
    if (role === 'student') {
      const s = studentRows.find(x => x.user_id === authUserId);
      const classTeacher = s?.section_id
        ? teacherRows.find(t => assignmentRows.some(a => a.teacher_id === t.id && a.section_id === s.section_id))?.name
        : undefined;
      return {
        id: s?.id || authUserId,
        authUserId,
        name: s?.name || profile?.full_name || authEmail || '',
        role,
        email: s?.email || authEmail || '',
        avatar: url(s?.avatar_path) || url(profile?.avatar_path),
        enrollmentNo: s?.enrollment_no,
        department: s?.department,
        course: s?.course,
        semester: s ? `Semester ${s.semester}` : undefined,
        classId: s?.class_id || undefined,
        className: (s?.class_id && classMap.get(s.class_id)?.name) || undefined,
        sectionId: s?.section_id || undefined,
        sectionName: (s?.section_id && sectionMap.get(s.section_id)?.name) || undefined,
        classTeacher,
      };
    }
    return {
      id: authUserId,
      authUserId,
      name: profile?.full_name || authEmail || '',
      role,
      email: authEmail || '',
      avatar: url(profile?.avatar_path),
      designation: institute?.hod_name || 'Main Admin',
    };
  }, [authUserId, authEmail, roleRow, teacherRows, studentRows, assignmentRows, profile, url, classMap, sectionMap, institute]);

  // ---------- Auth ----------
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      const msg = error?.message || 'Sign in failed';
      if (msg.toLowerCase().includes('email not confirmed')) {
        return { error: 'Please confirm your email address first — check your inbox for the confirmation link.', role: null };
      }
      if (msg.toLowerCase().includes('invalid login')) return { error: 'Incorrect email or password.', role: null };
      return { error: msg, role: null };
    }
    const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', data.user.id).maybeSingle();
    return { role: (role?.role as UserRole) ?? null };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthUserId(null);
    setRoleRow(null);
    setProfile(null);
    clearData();
    showToast('Logged out of FaceAttend AI session', 'info');
  }, [clearData, showToast]);

  const registerInstitute = useCallback(
    async (d: InstituteRegistration) => {
      const { data: instId, error } = await supabase.rpc('register_institute', {
        _name: d.instituteName,
        _code: d.instituteCode,
        _campus_address: d.campusAddress,
        _contact_email: d.contactEmail,
        _contact_phone: d.contactPhone,
        _hod_name: d.hodName,
      });
      if (error || !instId) {
        showToast(friendly(error?.message), 'error');
        return false;
      }
      // role now exists — upload branding into this institute's private folder
      const r: RoleRow = { role: 'admin', institute_id: instId };
      setRoleRow(r);
      roleRef.current = r;
      const [logoPath, photoPath] = await Promise.all([
        uploadMedia('institute', d.logo, instId),
        uploadMedia('institute', d.campusPhoto, instId),
      ]);
      await supabase.from('institutes').update({ logo_path: logoPath, campus_photo_path: photoPath }).eq('id', instId);
      await loadSession();
      showToast('Institute registered. You are now its Main Admin.');
      return true;
    },
    [loadSession, showToast, uploadMedia]
  );

  const updateMyProfile = useCallback(
    async (updates: { phone?: string; fullName?: string; preferences?: Record<string, boolean> }) => {
      if (!authUserId) return false;
      const patch: Partial<Profile> = {};
      if (updates.phone !== undefined) patch.phone = updates.phone;
      if (updates.fullName !== undefined) patch.full_name = updates.fullName;
      if (updates.preferences) patch.preferences = { ...((profile?.preferences as object) || {}), ...updates.preferences };
      const { data, error } = await supabase.from('profiles').update(patch).eq('id', authUserId).select('*').maybeSingle();
      if (error) {
        showToast(friendly(error.message), 'error');
        return false;
      }
      setProfile(data);
      return true;
    },
    [authUserId, profile, showToast]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (newPassword.length < 8) {
        showToast('New password must be at least 8 characters', 'error');
        return false;
      }
      if (!authEmail) return false;
      const { error } = await supabase.auth.updateUser({ password: newPassword, current_password: currentPassword });
      if (error) {
        const m = error.message.toLowerCase();
        showToast(m.includes('current') || m.includes('invalid') ? 'Current password is incorrect' : friendly(error.message), 'error');
        return false;
      }
      showToast('Password updated successfully');
      logAction('Password Changed', 'User changed their sign-in password');
      return true;
    },
    [authEmail, showToast, logAction]
  );

  // ---------- Institute ----------
  const updateSettings = useCallback(
    async (s: Partial<InstituteSettings>, media?: { logo?: Blob | null; campusPhoto?: Blob | null }) => {
      if (!institute) return false;
      const patch: Partial<Tables<'institutes'>> = {};
      if (s.instituteName !== undefined) patch.name = s.instituteName;
      if (s.instituteCode !== undefined) patch.code = s.instituteCode;
      if (s.campusAddress !== undefined) patch.campus_address = s.campusAddress;
      if (s.contactEmail !== undefined) patch.contact_email = s.contactEmail;
      if (s.contactPhone !== undefined) patch.contact_phone = s.contactPhone;
      if (s.hodName !== undefined) patch.hod_name = s.hodName;
      if (s.minimumAttendanceThreshold !== undefined) patch.minimum_attendance_threshold = s.minimumAttendanceThreshold;
      if (s.attendanceWindowMinutes !== undefined) patch.attendance_window_minutes = s.attendanceWindowMinutes;
      if (s.allowTeacherCustomSections !== undefined) patch.allow_teacher_custom_sections = s.allowTeacherCustomSections;
      if (s.requireFaceConsentNotice !== undefined) patch.require_face_consent_notice = s.requireFaceConsentNotice;
      if (media?.logo === null) patch.logo_path = null;
      if (media?.campusPhoto === null) patch.campus_photo_path = null;
      if (media?.logo) {
        const p = await uploadMedia('institute', media.logo);
        if (!p) return false;
        patch.logo_path = p;
      }
      if (media?.campusPhoto) {
        const p = await uploadMedia('institute', media.campusPhoto);
        if (!p) return false;
        patch.campus_photo_path = p;
      }
      const { error } = await supabase.from('institutes').update(patch).eq('id', institute.id);
      if (error) {
        showToast(friendly(error.message), 'error');
        return false;
      }
      await reload(['institute']);
      showToast('Institute settings updated successfully');
      logAction('Settings Updated', 'Modified institute profile or attendance parameters');
      return true;
    },
    [institute, uploadMedia, reload, showToast, logAction]
  );

  const instId = roleRow?.institute_id || '';

  // ---------- Academic structure ----------
  const addAcademicYear = useCallback(
    async (year: Omit<AcademicYear, 'id'>) => {
      const { error } = await supabase.from('academic_years').insert({
        institute_id: instId,
        name: year.name,
        is_current: yearRows.length === 0 ? true : year.isCurrent,
        status: year.status,
        start_date: year.startDate || null,
        end_date: year.endDate || null,
      });
      if (error) {
        showToast(friendly(error.message), 'error');
        return false;
      }
      await reload(['years']);
      showToast(`Academic Year ${year.name} added`);
      logAction('Academic Year Added', `Registered academic year ${year.name}`);
      return true;
    },
    [instId, yearRows.length, reload, showToast, logAction]
  );

  const setCurrentAcademicYear = useCallback(
    async (id: string) => {
      await supabase.from('academic_years').update({ is_current: false }).eq('institute_id', instId).neq('id', id);
      const { error } = await supabase.from('academic_years').update({ is_current: true }).eq('id', id);
      if (error) showToast(friendly(error.message), 'error');
      else showToast('Current academic year updated');
      await reload(['years']);
    },
    [instId, reload, showToast]
  );

  const addDepartment = useCallback(
    async (dept: { name: string; code: string; hodName: string }) => {
      const { error } = await supabase
        .from('departments')
        .insert({ institute_id: instId, name: dept.name, code: dept.code, hod_name: dept.hodName });
      if (error) {
        showToast(friendly(error.message), 'error');
        return false;
      }
      await reload(['departments']);
      showToast(`Department ${dept.name} added`);
      logAction('Department Created', `Added department ${dept.code}`);
      return true;
    },
    [instId, reload, showToast, logAction]
  );

  const addCourse = useCallback(
    async (c: Omit<Course, 'id'>) => {
      const { error } = await supabase.from('courses').insert({
        institute_id: instId,
        name: c.name,
        code: c.code,
        department_id: c.departmentId || null,
        duration_years: c.durationYears,
        total_semesters: c.totalSemesters,
      });
      if (error) {
        showToast(friendly(error.message), 'error');
        return false;
      }
      await reload(['courses']);
      showToast(`Course ${c.name} added`);
      logAction('Course Created', `Added course ${c.code}`);
      return true;
    },
    [instId, reload, showToast, logAction]
  );

  const addClassItem = useCallback(
    async (c: Omit<ClassItem, 'id'>) => {
      const currentYear = yearRows.find(y => y.is_current);
      const { data, error } = await supabase
        .from('classes')
        .insert({
          institute_id: instId,
          name: c.name,
          code: c.code,
          course_id: c.courseId || null,
          semester_number: c.semesterNumber,
          academic_year_id: c.academicYearId || currentYear?.id || null,
        })
        .select('id')
        .single();
      if (error || !data) {
        showToast(friendly(error?.message), 'error');
        return false;
      }
      await supabase.from('sections').insert({ institute_id: instId, class_id: data.id, name: 'Section A', max_capacity: 60 });
      await reload(['classes', 'sections']);
      showToast(`Class ${c.name} added with default Section A`);
      logAction('Class Created', `Added class ${c.code}`);
      return true;
    },
    [instId, yearRows, reload, showToast, logAction]
  );

  const addSection = useCallback(
    async (sec: { name: string; classId: string; maxCapacity: number; status?: SectionItem['status'] }) => {
      if (!sec.classId) {
        showToast('Please create a class first', 'error');
        return false;
      }
      const { error } = await supabase.from('sections').insert({
        institute_id: instId,
        class_id: sec.classId,
        name: sec.name,
        max_capacity: sec.maxCapacity,
        status: sec.status || 'active',
      });
      if (error) {
        showToast(friendly(error.message), 'error');
        return false;
      }
      await reload(['sections']);
      showToast(`${sec.name} created successfully`);
      logAction('Dynamic Section Created', `Created ${sec.name} for class ${classMap.get(sec.classId)?.name || ''}`);
      return true;
    },
    [instId, reload, showToast, logAction, classMap]
  );

  const toggleSectionStatus = useCallback(
    async (id: string) => {
      const s = sectionMap.get(id);
      if (!s) return;
      const { error } = await supabase
        .from('sections')
        .update({ status: s.status === 'active' ? 'inactive' : 'active' })
        .eq('id', id);
      if (error) showToast(friendly(error.message), 'error');
      else showToast('Section status updated');
      await reload(['sections']);
    },
    [sectionMap, reload, showToast]
  );

  const addSubject = useCallback(
    async (s: { name: string; code: string; courseId: string; semesterNumber: number; classId: string; sectionId?: string; assignedTeacherId?: string; credits: number }) => {
      const { error } = await supabase.from('subjects').insert({
        institute_id: instId,
        name: s.name,
        code: s.code,
        course_id: s.courseId || null,
        semester_number: s.semesterNumber,
        class_id: s.classId || null,
        section_id: s.sectionId || null,
        assigned_teacher_id: s.assignedTeacherId || null,
        credits: s.credits,
      });
      if (error) {
        showToast(friendly(error.message), 'error');
        return false;
      }
      await reload(['subjects']);
      showToast(`Subject ${s.name} added`);
      logAction('Subject Added', `Created subject ${s.code} - ${s.name}`);
      return true;
    },
    [instId, reload, showToast, logAction]
  );

  // ---------- Teachers ----------
  const setMemberPassword = useCallback(
    async (kind: 'teacher' | 'student', recordId: string, password: string) => {
      try {
        const res = await provisionFn({ data: { kind, recordId, password } });
        if (!res.ok) {
          showToast(res.error, 'error');
          return false;
        }
        await reload(kind === 'teacher' ? ['teachers'] : ['students']);
        showToast(res.created ? 'Login account created' : 'Password updated');
        logAction(res.created ? 'Login Created' : 'Password Reset', `${kind} record ${recordId}`);
        return true;
      } catch (e) {
        showToast(friendly(e instanceof Error ? e.message : null), 'error');
        return false;
      }
    },
    [provisionFn, reload, showToast, logAction]
  );

  const addTeacher = useCallback(
    async (t: NewTeacher) => {
      const avatarPath = t.photo ? await uploadMedia('teachers', t.photo) : null;
      const { data, error } = await supabase
        .from('teachers')
        .insert({
          institute_id: instId,
          name: t.name,
          employee_id: t.employeeId,
          email: t.email.trim().toLowerCase(),
          phone: t.phone,
          department: t.department,
          designation: t.designation,
          username: t.username,
          status: t.status,
          avatar_path: avatarPath,
          joined_date: t.joinedDate || todayISO(),
        })
        .select('id')
        .single();
      if (error || !data) {
        showToast(friendly(error?.message), 'error');
        return false;
      }
      if (t.password) {
        const res = await provisionFn({ data: { kind: 'teacher', recordId: data.id, password: t.password } }).catch(
          e => ({ ok: false as const, error: e instanceof Error ? e.message : 'Login creation failed' })
        );
        if (!res.ok) showToast(`Teacher saved, but login was not created: ${res.error}`, 'error');
      }
      await reload(['teachers']);
      showToast(`Faculty member ${t.name} registered`);
      logAction('Teacher Enrolled', `Created faculty account ${t.employeeId}`);
      return true;
    },
    [instId, uploadMedia, provisionFn, reload, showToast, logAction]
  );

  const updateTeacher = useCallback(
    async (id: string, u: Partial<Teacher>, photo?: Blob | null) => {
      const patch: Partial<Tables<'teachers'>> = {};
      if (u.name !== undefined) patch.name = u.name;
      if (u.employeeId !== undefined) patch.employee_id = u.employeeId;
      if (u.email !== undefined) patch.email = u.email.trim().toLowerCase();
      if (u.phone !== undefined) patch.phone = u.phone;
      if (u.department !== undefined) patch.department = u.department;
      if (u.designation !== undefined) patch.designation = u.designation;
      if (u.username !== undefined) patch.username = u.username;
      if (u.status !== undefined) patch.status = u.status;
      if (photo) {
        const p = await uploadMedia('teachers', photo);
        if (!p) return false;
        patch.avatar_path = p;
      } else if (photo === null) patch.avatar_path = null;
      const { error } = await supabase.from('teachers').update(patch).eq('id', id);
      if (error) {
        showToast(friendly(error.message), 'error');
        return false;
      }
      await reload(['teachers']);
      showToast('Faculty profile updated');
      logAction('Teacher Profile Updated', `Updated ${teacherMap.get(id)?.name || id}`);
      return true;
    },
    [uploadMedia, reload, showToast, logAction, teacherMap]
  );

  const deleteTeacher = useCallback(
    async (id: string) => {
      const name = teacherMap.get(id)?.name || id;
      const res = await removeFn({ data: { kind: 'teacher', recordId: id } }).catch(e => ({
        ok: false as const,
        error: e instanceof Error ? e.message : 'Delete failed',
      }));
      if (!res.ok) {
        showToast(res.error, 'error');
        return false;
      }
      await reload(['teachers', 'assignments', 'subjects']);
      showToast('Faculty member removed', 'info');
      logAction('Teacher Deleted', `Removed faculty ${name}`);
      return true;
    },
    [removeFn, reload, showToast, logAction, teacherMap]
  );

  const assignTeacher = useCallback(
    async (a: Omit<TeacherAssignment, 'id'>) => {
      if (!a.classId || !a.sectionId || !a.subjectId) {
        showToast('Select a class, section and subject', 'error');
        return false;
      }
      const { error } = await supabase.from('teacher_assignments').insert({
        institute_id: instId,
        teacher_id: a.teacherId,
        academic_year_id: a.academicYearId || null,
        course_id: a.courseId || null,
        class_id: a.classId,
        section_id: a.sectionId,
        subject_id: a.subjectId,
        semester_number: a.semesterNumber,
      });
      if (error) {
        showToast(error.message.includes('duplicate') ? 'This assignment already exists' : friendly(error.message), 'error');
        return false;
      }
      const subj = subjectMap.get(a.subjectId);
      if (subj && !subj.assigned_teacher_id) {
        await supabase.from('subjects').update({ assigned_teacher_id: a.teacherId }).eq('id', a.subjectId);
      }
      await reload(['assignments', 'subjects']);
      const t = teacherMap.get(a.teacherId);
      const sec = sectionMap.get(a.sectionId);
      showToast(`Assigned ${t?.name || 'teacher'} to ${subj?.name || 'subject'} (${sec?.name || ''})`);
      logAction('Faculty Assigned', `Assigned ${t?.name || ''} to ${classMap.get(a.classId)?.name || ''} - ${sec?.name || ''}`);
      return true;
    },
    [instId, reload, showToast, logAction, subjectMap, teacherMap, sectionMap, classMap]
  );

  const removeAssignment = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('teacher_assignments').delete().eq('id', id);
      if (error) showToast(friendly(error.message), 'error');
      else showToast('Assignment removed', 'info');
      await reload(['assignments']);
    },
    [reload, showToast]
  );

  // ---------- Students ----------
  const studentInsertRow = useCallback(
    (s: Omit<NewStudent, 'password' | 'photo'>, avatarPath: string | null) => {
      const cls = s.classId ? classMap.get(s.classId) : undefined;
      const course = cls?.course_id ? courseMap.get(cls.course_id) : undefined;
      const dept = course?.department_id ? deptRows.find(d => d.id === course.department_id) : undefined;
      const year = cls?.academic_year_id ? yearMap.get(cls.academic_year_id) : yearRows.find(y => y.is_current);
      return {
        institute_id: instId,
        name: s.name.trim(),
        enrollment_no: s.enrollmentNo.trim(),
        email: s.email.trim().toLowerCase(),
        phone: s.phone || '',
        dob: s.dob || null,
        department: s.department || dept?.name || '',
        course: s.course || course?.name || '',
        academic_year: s.academicYear || year?.name || '',
        semester: cls?.semester_number || s.semester || 1,
        class_id: s.classId || null,
        section_id: s.sectionId || null,
        username: s.username || s.enrollmentNo.trim().toLowerCase(),
        status: s.status || 'active',
        avatar_path: avatarPath,
        face_status: 'Not Enrolled',
        consent_given: false,
        created_by: authUserId,
      };
    },
    [classMap, courseMap, deptRows, yearMap, yearRows, instId, authUserId]
  );

  const addStudent = useCallback(
    async (s: NewStudent) => {
      if (!s.sectionId) {
        showToast('Please select a class and section', 'error');
        return false;
      }
      const avatarPath = s.photo ? await uploadMedia('students', s.photo) : null;
      const { data, error } = await supabase.from('students').insert(studentInsertRow(s, avatarPath)).select('id').single();
      if (error || !data) {
        showToast(friendly(error?.message), 'error');
        return false;
      }
      if (s.password) {
        const res = await provisionFn({ data: { kind: 'student', recordId: data.id, password: s.password } }).catch(
          e => ({ ok: false as const, error: e instanceof Error ? e.message : 'Login creation failed' })
        );
        if (!res.ok) showToast(`Student saved, but login was not created: ${res.error}`, 'error');
      }
      await reload(['students']);
      showToast(`Student ${s.name} enrolled successfully`);
      logAction('Student Registered', `Enrolled ${s.enrollmentNo} - ${s.name}`);
      return true;
    },
    [uploadMedia, studentInsertRow, provisionFn, reload, showToast, logAction]
  );

  const importStudents = useCallback(
    async (rows: Omit<NewStudent, 'password' | 'photo'>[]) => {
      const failed: string[] = [];
      let inserted = 0;
      for (const r of rows) {
        const { error } = await supabase.from('students').insert(studentInsertRow(r, null));
        if (error) failed.push(`${r.enrollmentNo || r.name}: ${friendly(error.message)}`);
        else inserted++;
      }
      await reload(['students']);
      if (inserted > 0) logAction('Bulk Student Import', `Imported ${inserted} student records from CSV`);
      return { inserted, failed };
    },
    [studentInsertRow, reload, logAction]
  );

  const updateStudent = useCallback(
    async (id: string, u: Partial<Student>, photo?: Blob | null) => {
      const patch: Partial<Tables<'students'>> = {};
      if (u.name !== undefined) patch.name = u.name;
      if (u.enrollmentNo !== undefined) patch.enrollment_no = u.enrollmentNo;
      if (u.email !== undefined) patch.email = u.email.trim().toLowerCase();
      if (u.phone !== undefined) patch.phone = u.phone;
      if (u.dob !== undefined) patch.dob = u.dob || null;
      if (u.status !== undefined) patch.status = u.status;
      if (u.classId !== undefined) patch.class_id = u.classId || null;
      if (u.sectionId !== undefined) patch.section_id = u.sectionId || null;
      if (u.department !== undefined) patch.department = u.department;
      if (u.course !== undefined) patch.course = u.course;
      if (u.semester !== undefined) patch.semester = u.semester;
      if (photo) {
        const p = await uploadMedia('students', photo);
        if (!p) return false;
        patch.avatar_path = p;
      } else if (photo === null) patch.avatar_path = null;
      const { error } = await supabase.from('students').update(patch).eq('id', id);
      if (error) {
        showToast(friendly(error.message), 'error');
        return false;
      }
      await reload(['students']);
      showToast('Student record updated');
      logAction('Student Updated', `Updated ${studentMap.get(id)?.name || id}`);
      return true;
    },
    [uploadMedia, reload, showToast, logAction, studentMap]
  );

  const deleteStudent = useCallback(
    async (id: string) => {
      const name = studentMap.get(id)?.name || id;
      const res = await removeFn({ data: { kind: 'student', recordId: id } }).catch(e => ({
        ok: false as const,
        error: e instanceof Error ? e.message : 'Delete failed',
      }));
      if (!res.ok) {
        showToast(res.error, 'error');
        return false;
      }
      await reload(['students', 'attendance']);
      showToast('Student record removed', 'info');
      logAction('Student Deleted', `Removed student ${name}`);
      return true;
    },
    [removeFn, reload, showToast, logAction, studentMap]
  );

  const updateFaceEnrollment = useCallback(
    async (
      studentId: string,
      status: Student['faceStatus'],
      consent: boolean,
      enrollment?: { descriptors: number[][]; snapshot?: Blob | null }
    ) => {
      const patch: Partial<Tables<'students'>> = { face_status: status, consent_given: consent };
      if (enrollment) {
        if (enrollment.descriptors.length === 0) {
          showToast('Capture at least one face sample first', 'error');
          return false;
        }
        patch.face_descriptor = enrollment.descriptors.slice(0, MAX_FACE_SAMPLES);
        patch.enrollment_date = todayISO();
        const st = studentMap.get(studentId);
        if (enrollment.snapshot && !st?.avatar_path) {
          const p = await uploadMedia('students', enrollment.snapshot);
          if (p) patch.avatar_path = p;
        }
      }
      if (status === 'Revoked' || status === 'Not Enrolled') {
        patch.face_descriptor = null;
      }
      if (status === 'Enrolled' && !enrollment && normalizeFaceSamples(studentMap.get(studentId)?.face_descriptor).length === 0) {
        showToast('Capture the student’s face first — no face signature is stored yet', 'error');
        return false;
      }
      const { error } = await supabase.from('students').update(patch).eq('id', studentId);
      if (error) {
        showToast(friendly(error.message), 'error');
        return false;
      }
      await reload(['students']);
      showToast(`Face enrollment status updated to ${status}`);
      logAction('Face Biometric Enrollment', `Set biometric status of ${studentMap.get(studentId)?.name || studentId} to ${status}`);
      return true;
    },
    [studentMap, uploadMedia, reload, showToast, logAction]
  );

  // ---------- Attendance ----------
  const markLiveAttendance = useCallback(
    async (records: AttendanceRecord[]) => {
      if (records.length === 0) {
        showToast('No students in this roster', 'error');
        return false;
      }
      const myTeacher = roleRow?.role === 'teacher' ? teacherRows.find(t => t.user_id === authUserId) : undefined;
      const rows = records
        .filter(r => r.status === 'Present' || r.status === 'Late' || r.status === 'Absent')
        .map(r => ({
          institute_id: instId,
          student_id: r.studentId,
          teacher_id: myTeacher?.id || null,
          subject_id: r.subjectId,
          class_id: r.classId || null,
          section_id: r.sectionId || null,
          academic_year: r.academicYear,
          date: r.date,
          status: r.status,
          time_detected: r.timeDetected,
          confidence_score: r.confidenceScore ?? null,
          verified: r.verified,
          marked_by: authUserId,
          marked_by_name: myTeacher?.name || profile?.full_name || '',
        }));
      const { error } = await supabase.from('attendance_records').upsert(rows, { onConflict: 'student_id,subject_id,date' });
      if (error) {
        showToast(friendly(error.message), 'error');
        return false;
      }
      await reload(['attendance', 'notifications']);
      showToast(`Marked attendance for ${rows.length} students`);
      logAction('Live Attendance Recorded', `Saved ${rows.length} attendance entries for ${records[0]?.subjectName || ''} on ${records[0]?.date || ''}`);
      return true;
    },
    [roleRow, teacherRows, authUserId, instId, profile, reload, showToast, logAction]
  );

  // ---------- Notifications ----------
  const markNotificationRead = useCallback(
    async (id: string) => {
      setNotificationRows(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    },
    []
  );
  const markAllNotificationsRead = useCallback(async () => {
    if (!authUserId) return;
    setNotificationRows(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from('notifications').update({ read: true }).eq('user_id', authUserId).eq('read', false);
    showToast('All notifications marked as read');
  }, [authUserId, showToast]);
  const deleteNotification = useCallback(async (id: string) => {
    setNotificationRows(prev => prev.filter(n => n.id !== id));
    await supabase.from('notifications').delete().eq('id', id);
  }, []);

  const refresh = useCallback(() => loadSession(), [loadSession]);

  const prefs = (profile?.preferences as { email_alerts?: boolean; sms_alerts?: boolean } | null) || {};

  const value: AppContextType = {
    authReady,
    dataLoading,
    isSignedIn: !!authUserId,
    authEmail,
    needsInstituteSetup: authReady && !!authUserId && !roleRow && !dataLoading,
    currentUser,
    currentRole: roleRow?.role ?? null,
    signIn,
    logout,
    registerInstitute,
    refresh,
    toast,
    showToast,
    profilePreferences: { email_alerts: prefs.email_alerts ?? true, sms_alerts: prefs.sms_alerts ?? false },
    updateMyProfile,
    changePassword,
    settings,
    updateSettings,
    academicYears,
    addAcademicYear,
    setCurrentAcademicYear,
    departments,
    addDepartment,
    courses,
    addCourse,
    classes,
    addClassItem,
    sections,
    addSection,
    toggleSectionStatus,
    subjects,
    addSubject,
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    assignTeacher,
    removeAssignment,
    students,
    addStudent,
    importStudents,
    updateStudent,
    deleteStudent,
    updateFaceEnrollment,
    setMemberPassword,
    attendanceRecords,
    markLiveAttendance,
    aiInsights,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    auditLogs,
    logAction,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
