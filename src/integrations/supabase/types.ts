export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          institute_id: string
          is_current: boolean
          name: string
          start_date: string | null
          status: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          institute_id: string
          is_current?: boolean
          name: string
          start_date?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          institute_id?: string
          is_current?: boolean
          name?: string
          start_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          academic_year: string
          class_id: string | null
          confidence_score: number | null
          created_at: string
          date: string
          id: string
          institute_id: string
          marked_by: string | null
          marked_by_name: string
          section_id: string | null
          status: string
          student_id: string
          subject_id: string
          teacher_id: string | null
          time_detected: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          academic_year?: string
          class_id?: string | null
          confidence_score?: number | null
          created_at?: string
          date: string
          id?: string
          institute_id: string
          marked_by?: string | null
          marked_by_name?: string
          section_id?: string | null
          status: string
          student_id: string
          subject_id: string
          teacher_id?: string | null
          time_detected?: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          academic_year?: string
          class_id?: string | null
          confidence_score?: number | null
          created_at?: string
          date?: string
          id?: string
          institute_id?: string
          marked_by?: string | null
          marked_by_name?: string
          section_id?: string | null
          status?: string
          student_id?: string
          subject_id?: string
          teacher_id?: string | null
          time_detected?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string
          actor_role: string
          created_at: string
          details: string
          id: string
          institute_id: string
          ip_address: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string
          actor_role?: string
          created_at?: string
          details?: string
          id?: string
          institute_id: string
          ip_address?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string
          actor_role?: string
          created_at?: string
          details?: string
          id?: string
          institute_id?: string
          ip_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year_id: string | null
          code: string
          course_id: string | null
          created_at: string
          id: string
          institute_id: string
          name: string
          semester_number: number
        }
        Insert: {
          academic_year_id?: string | null
          code: string
          course_id?: string | null
          created_at?: string
          id?: string
          institute_id: string
          name: string
          semester_number?: number
        }
        Update: {
          academic_year_id?: string | null
          code?: string
          course_id?: string | null
          created_at?: string
          id?: string
          institute_id?: string
          name?: string
          semester_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "classes_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          department_id: string | null
          duration_years: number
          id: string
          institute_id: string
          name: string
          total_semesters: number
        }
        Insert: {
          code: string
          created_at?: string
          department_id?: string | null
          duration_years?: number
          id?: string
          institute_id: string
          name: string
          total_semesters?: number
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string | null
          duration_years?: number
          id?: string
          institute_id?: string
          name?: string
          total_semesters?: number
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          hod_name: string
          id: string
          institute_id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          hod_name?: string
          id?: string
          institute_id: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          hod_name?: string
          id?: string
          institute_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      institutes: {
        Row: {
          allow_teacher_custom_sections: boolean
          attendance_window_minutes: number
          campus_address: string
          campus_photo_path: string | null
          code: string
          contact_email: string
          contact_phone: string
          created_at: string
          created_by: string
          hod_name: string
          id: string
          logo_path: string | null
          minimum_attendance_threshold: number
          name: string
          require_face_consent_notice: boolean
          updated_at: string
        }
        Insert: {
          allow_teacher_custom_sections?: boolean
          attendance_window_minutes?: number
          campus_address?: string
          campus_photo_path?: string | null
          code?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string
          created_by: string
          hod_name?: string
          id?: string
          logo_path?: string | null
          minimum_attendance_threshold?: number
          name: string
          require_face_consent_notice?: boolean
          updated_at?: string
        }
        Update: {
          allow_teacher_custom_sections?: boolean
          attendance_window_minutes?: number
          campus_address?: string
          campus_photo_path?: string | null
          code?: string
          contact_email?: string
          contact_phone?: string
          created_at?: string
          created_by?: string
          hod_name?: string
          id?: string
          logo_path?: string | null
          minimum_attendance_threshold?: number
          name?: string
          require_face_consent_notice?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          category: string
          created_at: string
          id: string
          institute_id: string
          message: string
          read: boolean
          target_role: string
          title: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          institute_id: string
          message: string
          read?: boolean
          target_role?: string
          title: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          institute_id?: string
          message?: string
          read?: boolean
          target_role?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          preferences: Json
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id: string
          phone?: string
          preferences?: Json
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      sections: {
        Row: {
          class_id: string
          created_at: string
          id: string
          institute_id: string
          max_capacity: number
          name: string
          status: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          institute_id: string
          max_capacity?: number
          name: string
          status?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          institute_id?: string
          max_capacity?: number
          name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_year: string
          avatar_path: string | null
          class_id: string | null
          consent_given: boolean
          course: string
          created_at: string
          created_by: string | null
          department: string
          dob: string | null
          email: string
          enrollment_date: string | null
          enrollment_no: string
          face_descriptor: Json | null
          face_status: string
          id: string
          institute_id: string
          name: string
          phone: string
          section_id: string | null
          semester: number
          status: string
          user_id: string | null
          username: string
        }
        Insert: {
          academic_year?: string
          avatar_path?: string | null
          class_id?: string | null
          consent_given?: boolean
          course?: string
          created_at?: string
          created_by?: string | null
          department?: string
          dob?: string | null
          email: string
          enrollment_date?: string | null
          enrollment_no: string
          face_descriptor?: Json | null
          face_status?: string
          id?: string
          institute_id: string
          name: string
          phone?: string
          section_id?: string | null
          semester?: number
          status?: string
          user_id?: string | null
          username?: string
        }
        Update: {
          academic_year?: string
          avatar_path?: string | null
          class_id?: string | null
          consent_given?: boolean
          course?: string
          created_at?: string
          created_by?: string | null
          department?: string
          dob?: string | null
          email?: string
          enrollment_date?: string | null
          enrollment_no?: string
          face_descriptor?: Json | null
          face_status?: string
          id?: string
          institute_id?: string
          name?: string
          phone?: string
          section_id?: string | null
          semester?: number
          status?: string
          user_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          assigned_teacher_id: string | null
          class_id: string | null
          code: string
          course_id: string | null
          created_at: string
          credits: number
          id: string
          institute_id: string
          name: string
          section_id: string | null
          semester_number: number
        }
        Insert: {
          assigned_teacher_id?: string | null
          class_id?: string | null
          code: string
          course_id?: string | null
          created_at?: string
          credits?: number
          id?: string
          institute_id: string
          name: string
          section_id?: string | null
          semester_number?: number
        }
        Update: {
          assigned_teacher_id?: string | null
          class_id?: string | null
          code?: string
          course_id?: string | null
          created_at?: string
          credits?: number
          id?: string
          institute_id?: string
          name?: string
          section_id?: string | null
          semester_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "subjects_assigned_teacher_id_fkey"
            columns: ["assigned_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_assignments: {
        Row: {
          academic_year_id: string | null
          class_id: string
          course_id: string | null
          created_at: string
          id: string
          institute_id: string
          section_id: string
          semester_number: number
          subject_id: string
          teacher_id: string
        }
        Insert: {
          academic_year_id?: string | null
          class_id: string
          course_id?: string | null
          created_at?: string
          id?: string
          institute_id: string
          section_id: string
          semester_number?: number
          subject_id: string
          teacher_id: string
        }
        Update: {
          academic_year_id?: string | null
          class_id?: string
          course_id?: string | null
          created_at?: string
          id?: string
          institute_id?: string
          section_id?: string
          semester_number?: number
          subject_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          avatar_path: string | null
          created_at: string
          department: string
          designation: string
          email: string
          employee_id: string
          id: string
          institute_id: string
          joined_date: string
          name: string
          phone: string
          status: string
          user_id: string | null
          username: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          department?: string
          designation?: string
          email: string
          employee_id: string
          id?: string
          institute_id: string
          joined_date?: string
          name: string
          phone?: string
          status?: string
          user_id?: string | null
          username?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          department?: string
          designation?: string
          email?: string
          employee_id?: string
          id?: string
          institute_id?: string
          joined_date?: string
          name?: string
          phone?: string
          status?: string
          user_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          institute_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          institute_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          institute_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institutes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_app_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      current_institute_id: { Args: never; Returns: string }
      current_student_id: { Args: never; Returns: string }
      current_teacher_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_institute_admin: { Args: { _institute_id: string }; Returns: boolean }
      is_institute_teacher: {
        Args: { _institute_id: string }
        Returns: boolean
      }
      register_institute: {
        Args: {
          _campus_address: string
          _code: string
          _contact_email: string
          _contact_phone: string
          _hod_name: string
          _name: string
        }
        Returns: string
      }
      teacher_can_access_section: {
        Args: { _section_id: string }
        Returns: boolean
      }
      update_my_student_contact: {
        Args: { _phone: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "teacher", "student"],
    },
  },
} as const
