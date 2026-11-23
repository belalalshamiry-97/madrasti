export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface SchoolSettings {
  id: string;
  school_name: string;
  school_logo_url?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  address?: string | null;
  timezone: string;
  max_file_size_mb: number;
  allowed_file_types: string[];
  messaging_enabled: boolean;
  quizzes_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  username: string;
  phone?: string | null;
  avatar_url?: string | null;
  grade?: string;
  section?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
}

export interface Semester {
  id: string;
  academic_year_id: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface GradeLevel {
  id: string;
  name: string;
  level_order: number;
}

export interface AcademicTrack {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

export interface Section {
  id: string;
  name: string;
  grade_level_id: string;
  academic_track_id?: string | null;
  capacity: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  icon_name?: string | null;
  subject_type: "theory" | "practical" | "both";
}

export interface ClassSubject {
  id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  semester_id: string;
  subject?: Subject;
  teacher?: Profile;
  section?: Section;
  semester?: Semester;
}

export interface Lesson {
  id: string;
  class_subject_id: string;
  lesson_number: number;
  title: string;
  description?: string | null;
  objectives?: string | null;
  content_html?: string | null;
  status: "draft" | "published" | "archived";
  published_at?: string | null;
  created_at: string;
  materials_count?: number;
  assignments_count?: number;
  sessions_count?: number;
  questions_count?: number;
  is_completed?: boolean;
}

export interface LessonMaterial {
  id: string;
  lesson_id: string;
  title: string;
  material_type: "pdf" | "doc" | "ppt" | "image" | "video_link" | "url";
  file_path?: string | null;
  file_size_bytes?: number | null;
  external_url?: string | null;
}

export interface ClassSession {
  id: string;
  lesson_id?: string | null;
  class_subject_id: string;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  location_or_room?: string | null;
  meeting_url?: string | null;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  teacher_notes?: string | null;
}

export interface Assignment {
  id: string;
  class_subject_id: string;
  lesson_id?: string | null;
  title: string;
  instructions: string;
  assignment_type: "assignment" | "activity";
  max_score: number;
  open_date: string;
  due_date: string;
  max_attempts: number;
  allow_late_submissions: boolean;
  allow_resubmissions: boolean;
  status?: "pending" | "late" | "submitted" | "graded";
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  attempt_number: number;
  answer_text?: string | null;
  status: "draft" | "submitted" | "late" | "grading" | "graded" | "revision_requested";
  submitted_at?: string | null;
  score?: number | null;
  feedback_notes?: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target_audience: "all" | "teachers" | "students" | "section";
  created_by: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link_url?: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface Quiz {
  id: string;
  class_subject_id: string;
  course_name?: string;
  title: string;
  description?: string | null;
  duration_minutes: number;
  total_score: number;
  passing_score: number;
  start_time: string;
  end_time: string;
  status: "draft" | "published" | "closed";
  questions_count?: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "mcq" | "true_false" | "short_answer";
  points: number;
  options: { id: string; text: string }[];
  correct_answer: string;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  student_name?: string;
  score: number;
  max_score: number;
  status: "in_progress" | "submitted" | "graded";
  started_at: string;
  completed_at?: string;
  answers: Record<string, string>;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_number: string;
  section_id: string;
  attendance_date: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
}
