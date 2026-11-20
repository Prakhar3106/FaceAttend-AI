
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- ============ TABLES ============
CREATE TABLE public.institutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL DEFAULT '',
  campus_address text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  hod_name text NOT NULL DEFAULT '',
  logo_path text,
  campus_photo_path text,
  minimum_attendance_threshold integer NOT NULL DEFAULT 75,
  attendance_window_minutes integer NOT NULL DEFAULT 15,
  allow_teacher_custom_sections boolean NOT NULL DEFAULT true,
  require_face_consent_notice boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  avatar_path text,
  preferences jsonb NOT NULL DEFAULT '{"email_alerts": true, "sms_alerts": false}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_current boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  hod_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institute_id, code)
);

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  code text NOT NULL,
  name text NOT NULL,
  duration_years integer NOT NULL DEFAULT 4,
  total_semesters integer NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  code text NOT NULL,
  name text NOT NULL,
  semester_number integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  name text NOT NULL,
  max_capacity integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  user_id uuid UNIQUE,
  employee_id text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  designation text NOT NULL DEFAULT '',
  username text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  avatar_path text,
  joined_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institute_id, employee_id),
  UNIQUE (institute_id, email)
);

CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  section_id uuid REFERENCES public.sections(id) ON DELETE SET NULL,
  assigned_teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  code text NOT NULL,
  name text NOT NULL,
  semester_number integer NOT NULL DEFAULT 1,
  credits integer NOT NULL DEFAULT 4,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  semester_number integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, section_id, subject_id)
);

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  user_id uuid UNIQUE,
  enrollment_no text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  dob date,
  department text NOT NULL DEFAULT '',
  course text NOT NULL DEFAULT '',
  academic_year text NOT NULL DEFAULT '',
  semester integer NOT NULL DEFAULT 1,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  section_id uuid REFERENCES public.sections(id) ON DELETE SET NULL,
  username text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  avatar_path text,
  face_status text NOT NULL DEFAULT 'Not Enrolled',
  face_descriptor jsonb,
  enrollment_date date,
  consent_given boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institute_id, enrollment_no),
  UNIQUE (institute_id, email)
);

CREATE TABLE public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  section_id uuid REFERENCES public.sections(id) ON DELETE SET NULL,
  academic_year text NOT NULL DEFAULT '',
  date date NOT NULL,
  status text NOT NULL,
  time_detected text NOT NULL DEFAULT '—',
  confidence_score numeric,
  verified boolean NOT NULL DEFAULT false,
  marked_by uuid,
  marked_by_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, subject_id, date)
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  category text NOT NULL DEFAULT 'system',
  target_role text NOT NULL DEFAULT 'all',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  actor_id uuid,
  actor_name text NOT NULL DEFAULT '',
  actor_role text NOT NULL DEFAULT '',
  action text NOT NULL,
  details text NOT NULL DEFAULT '',
  ip_address text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.user_roles (institute_id);
CREATE INDEX ON public.students (institute_id, section_id);
CREATE INDEX ON public.teacher_assignments (teacher_id);
CREATE INDEX ON public.attendance_records (institute_id, date);
CREATE INDEX ON public.attendance_records (section_id);
CREATE INDEX ON public.notifications (user_id, created_at DESC);
CREATE INDEX ON public.audit_logs (institute_id, created_at DESC);

-- ============ GRANTS ============
GRANT SELECT, UPDATE ON public.institutes TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_years, public.departments, public.courses, public.classes, public.sections, public.subjects, public.teachers, public.teacher_assignments, public.students, public.attendance_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.institutes, public.user_roles, public.profiles, public.academic_years, public.departments, public.courses, public.classes, public.sections, public.subjects, public.teachers, public.teacher_assignments, public.students, public.attendance_records, public.notifications, public.audit_logs TO service_role;

-- ============ HELPER FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.current_institute_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT institute_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_institute_admin(_institute_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND institute_id = _institute_id AND role = 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_institute_teacher(_institute_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND institute_id = _institute_id AND role = 'teacher')
$$;

CREATE OR REPLACE FUNCTION public.current_teacher_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.teachers WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.current_student_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.students WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.teacher_can_access_section(_section_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _section_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.teacher_assignments ta
    JOIN public.teachers t ON t.id = ta.teacher_id
    WHERE t.user_id = auth.uid() AND ta.section_id = _section_id
  )
$$;

GRANT EXECUTE ON FUNCTION public.current_institute_id(), public.current_app_role(), public.has_role(uuid, public.app_role), public.is_institute_admin(uuid), public.is_institute_teacher(uuid), public.current_teacher_id(), public.current_student_id(), public.teacher_can_access_section(uuid) TO authenticated;

-- ============ REGISTRATION RPC ============
CREATE OR REPLACE FUNCTION public.register_institute(
  _name text, _code text, _campus_address text, _contact_email text, _contact_phone text, _hod_name text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _inst uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid) THEN
    RAISE EXCEPTION 'This account already belongs to an institute';
  END IF;
  IF coalesce(trim(_name), '') = '' THEN RAISE EXCEPTION 'Institute name is required'; END IF;
  INSERT INTO public.institutes (name, code, campus_address, contact_email, contact_phone, hod_name, created_by)
  VALUES (trim(_name), coalesce(trim(_code), ''), coalesce(trim(_campus_address), ''), coalesce(trim(_contact_email), ''), coalesce(trim(_contact_phone), ''), coalesce(trim(_hod_name), ''), _uid)
  RETURNING id INTO _inst;
  INSERT INTO public.user_roles (user_id, institute_id, role) VALUES (_uid, _inst, 'admin');
  INSERT INTO public.audit_logs (institute_id, actor_id, actor_name, actor_role, action, details)
  SELECT _inst, _uid, coalesce(p.full_name, ''), 'admin', 'Institute Registered', 'Registered institute ' || trim(_name)
  FROM (SELECT full_name FROM public.profiles WHERE id = _uid UNION ALL SELECT '' LIMIT 1) p;
  RETURN _inst;
END;
$$;
REVOKE ALL ON FUNCTION public.register_institute(text, text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_institute(text, text, text, text, text, text) TO authenticated;

-- ============ PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, coalesce(NEW.raw_user_meta_data->>'full_name', ''), coalesce(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RLS ============
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view own institute" ON public.institutes FOR SELECT TO authenticated USING (id = public.current_institute_id());
CREATE POLICY "Admin updates own institute" ON public.institutes FOR UPDATE TO authenticated USING (public.is_institute_admin(id)) WITH CHECK (public.is_institute_admin(id));

CREATE POLICY "View own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_institute_admin(institute_id));

CREATE POLICY "View own or same-institute profile" ON public.profiles FOR SELECT TO authenticated USING (
  id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = profiles.id AND r.institute_id = public.current_institute_id())
);
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Academic structure: members read, admin writes
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['academic_years','departments','courses','classes','sections','subjects','teachers','teacher_assignments'] LOOP
    EXECUTE format('CREATE POLICY "Members view %1$s" ON public.%1$I FOR SELECT TO authenticated USING (institute_id = public.current_institute_id())', t);
    EXECUTE format('CREATE POLICY "Admin inserts %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (public.is_institute_admin(institute_id))', t);
    EXECUTE format('CREATE POLICY "Admin updates %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (public.is_institute_admin(institute_id)) WITH CHECK (public.is_institute_admin(institute_id))', t);
    EXECUTE format('CREATE POLICY "Admin deletes %1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.is_institute_admin(institute_id))', t);
  END LOOP;
END $$;

-- Teachers may add sections when the institute allows it
CREATE POLICY "Teacher inserts sections when allowed" ON public.sections FOR INSERT TO authenticated WITH CHECK (
  public.is_institute_teacher(institute_id)
  AND EXISTS (SELECT 1 FROM public.institutes i WHERE i.id = institute_id AND i.allow_teacher_custom_sections)
);

-- Students
CREATE POLICY "Admin manages students" ON public.students FOR ALL TO authenticated
  USING (public.is_institute_admin(institute_id)) WITH CHECK (public.is_institute_admin(institute_id));
CREATE POLICY "Teacher views students" ON public.students FOR SELECT TO authenticated USING (
  public.is_institute_teacher(institute_id) AND (public.teacher_can_access_section(section_id) OR created_by = auth.uid())
);
CREATE POLICY "Teacher adds students" ON public.students FOR INSERT TO authenticated WITH CHECK (
  public.is_institute_teacher(institute_id) AND created_by = auth.uid() AND public.teacher_can_access_section(section_id)
);
CREATE POLICY "Teacher updates students" ON public.students FOR UPDATE TO authenticated USING (
  public.is_institute_teacher(institute_id) AND (public.teacher_can_access_section(section_id) OR created_by = auth.uid())
) WITH CHECK (
  public.is_institute_teacher(institute_id) AND public.teacher_can_access_section(section_id)
);
CREATE POLICY "Teacher deletes students" ON public.students FOR DELETE TO authenticated USING (
  public.is_institute_teacher(institute_id) AND (public.teacher_can_access_section(section_id) OR created_by = auth.uid())
);
CREATE POLICY "Student views self" ON public.students FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Attendance
CREATE POLICY "Admin manages attendance" ON public.attendance_records FOR ALL TO authenticated
  USING (public.is_institute_admin(institute_id)) WITH CHECK (public.is_institute_admin(institute_id));
CREATE POLICY "Teacher views attendance" ON public.attendance_records FOR SELECT TO authenticated USING (
  public.is_institute_teacher(institute_id) AND (public.teacher_can_access_section(section_id) OR teacher_id = public.current_teacher_id())
);
CREATE POLICY "Teacher marks attendance" ON public.attendance_records FOR INSERT TO authenticated WITH CHECK (
  public.is_institute_teacher(institute_id) AND teacher_id = public.current_teacher_id() AND public.teacher_can_access_section(section_id)
);
CREATE POLICY "Teacher updates attendance" ON public.attendance_records FOR UPDATE TO authenticated USING (
  public.is_institute_teacher(institute_id) AND public.teacher_can_access_section(section_id)
) WITH CHECK (
  public.is_institute_teacher(institute_id) AND teacher_id = public.current_teacher_id() AND public.teacher_can_access_section(section_id)
);
CREATE POLICY "Student views own attendance" ON public.attendance_records FOR SELECT TO authenticated USING (student_id = public.current_student_id());

-- Notifications
CREATE POLICY "Own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Staff send notifications in institute" ON public.notifications FOR INSERT TO authenticated WITH CHECK (
  institute_id = public.current_institute_id()
  AND (public.is_institute_admin(institute_id) OR public.is_institute_teacher(institute_id))
  AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = notifications.user_id AND r.institute_id = notifications.institute_id)
);

-- Audit
CREATE POLICY "Admin reads audit" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_institute_admin(institute_id));
CREATE POLICY "Members write own audit" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (
  institute_id = public.current_institute_id() AND actor_id = auth.uid()
);

-- ============ NOTIFICATION TRIGGERS ============
CREATE OR REPLACE FUNCTION public.notify_attendance_marked()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid; _subject text;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = OLD.status THEN RETURN NEW; END IF;
  SELECT user_id INTO _uid FROM public.students WHERE id = NEW.student_id;
  IF _uid IS NULL THEN RETURN NEW; END IF;
  SELECT name INTO _subject FROM public.subjects WHERE id = NEW.subject_id;
  INSERT INTO public.notifications (institute_id, user_id, title, message, category, target_role)
  VALUES (
    NEW.institute_id, _uid,
    CASE WHEN NEW.status = 'Absent' THEN 'Marked Absent' WHEN NEW.status = 'Late' THEN 'Marked Late' ELSE 'Attendance Recorded' END,
    'Your attendance for ' || coalesce(_subject, 'a class') || ' on ' || to_char(NEW.date, 'DD Mon YYYY') || ' was recorded as ' || NEW.status || '.',
    CASE WHEN NEW.status = 'Absent' THEN 'alert' ELSE 'attendance' END,
    'student'
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER attendance_notify AFTER INSERT OR UPDATE OF status ON public.attendance_records
FOR EACH ROW EXECUTE FUNCTION public.notify_attendance_marked();

CREATE OR REPLACE FUNCTION public.notify_teacher_assigned()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid; _subject text; _class text; _section text;
BEGIN
  SELECT user_id INTO _uid FROM public.teachers WHERE id = NEW.teacher_id;
  IF _uid IS NULL THEN RETURN NEW; END IF;
  SELECT name INTO _subject FROM public.subjects WHERE id = NEW.subject_id;
  SELECT name INTO _class FROM public.classes WHERE id = NEW.class_id;
  SELECT name INTO _section FROM public.sections WHERE id = NEW.section_id;
  INSERT INTO public.notifications (institute_id, user_id, title, message, category, target_role)
  VALUES (NEW.institute_id, _uid, 'New Teaching Assignment',
    'You have been assigned ' || coalesce(_subject, 'a subject') || ' for ' || coalesce(_class, 'a class') || ' · ' || coalesce(_section, 'a section') || '.',
    'academic', 'teacher');
  RETURN NEW;
END;
$$;
CREATE TRIGGER assignment_notify AFTER INSERT ON public.teacher_assignments
FOR EACH ROW EXECUTE FUNCTION public.notify_teacher_assigned();

-- updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER institutes_touch BEFORE UPDATE ON public.institutes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER attendance_touch BEFORE UPDATE ON public.attendance_records FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
