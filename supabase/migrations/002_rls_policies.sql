-- ============================================================================
-- MADRASTI LMS — 002_RLS_POLICIES.SQL
-- Row-Level Security policies, helper functions, and data isolation
-- ============================================================================

-- Helper functions
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'TEACHER'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_student()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'STUDENT'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. SCHOOL SETTINGS POLICIES
CREATE POLICY "Anyone authenticated can view school settings"
ON school_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can update school settings"
ON school_settings FOR UPDATE
TO authenticated
USING (is_admin());

-- 2. PROFILES POLICIES
CREATE POLICY "Users can view active profiles"
ON profiles FOR SELECT
TO authenticated
USING (is_active = true OR is_admin());

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid() OR is_admin());

CREATE POLICY "Admin can insert profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- 3. ACADEMIC STRUCTURE (Years, Semesters, Grades, Tracks, Sections, Subjects)
CREATE POLICY "Authenticated can view academic years" ON academic_years FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage academic years" ON academic_years FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Authenticated can view semesters" ON semesters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage semesters" ON semesters FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Authenticated can view grade levels" ON grade_levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage grade levels" ON grade_levels FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Authenticated can view academic tracks" ON academic_tracks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage academic tracks" ON academic_tracks FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Authenticated can view sections" ON sections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage sections" ON sections FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Authenticated can view subjects" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage subjects" ON subjects FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "Authenticated can view class subjects" ON class_subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage class subjects" ON class_subjects FOR ALL TO authenticated USING (is_admin());

-- 4. ENROLLMENTS POLICIES
CREATE POLICY "Students can view their own enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (student_id = auth.uid() OR is_admin() OR is_teacher());

CREATE POLICY "Admin can manage enrollments"
ON enrollments FOR ALL
TO authenticated
USING (is_admin());

-- 5. LESSONS POLICIES
CREATE POLICY "Teachers can view lessons in their classes"
ON lessons FOR SELECT
TO authenticated
USING (
    is_admin() OR
    EXISTS (SELECT 1 FROM class_subjects WHERE id = lessons.class_subject_id AND teacher_id = auth.uid()) OR
    (status = 'published' AND EXISTS (
        SELECT 1 FROM enrollments e
        JOIN class_subjects cs ON cs.section_id = e.section_id AND cs.semester_id = e.semester_id
        WHERE cs.id = lessons.class_subject_id AND e.student_id = auth.uid()
    ))
);

CREATE POLICY "Teachers can insert lessons to their classes"
ON lessons FOR INSERT
TO authenticated
WITH CHECK (
    is_admin() OR
    EXISTS (SELECT 1 FROM class_subjects WHERE id = class_subject_id AND teacher_id = auth.uid())
);

CREATE POLICY "Teachers can update lessons in their classes"
ON lessons FOR UPDATE
TO authenticated
USING (
    is_admin() OR
    EXISTS (SELECT 1 FROM class_subjects WHERE id = lessons.class_subject_id AND teacher_id = auth.uid())
);

-- 6. LESSON MATERIALS & PROGRESS
CREATE POLICY "Users can view materials of accessible lessons"
ON lesson_materials FOR SELECT
TO authenticated
USING (
    is_admin() OR
    EXISTS (SELECT 1 FROM lessons WHERE id = lesson_materials.lesson_id)
);

CREATE POLICY "Teachers can manage lesson materials"
ON lesson_materials FOR ALL
TO authenticated
USING (
    is_admin() OR
    EXISTS (
        SELECT 1 FROM lessons l
        JOIN class_subjects cs ON cs.id = l.class_subject_id
        WHERE l.id = lesson_materials.lesson_id AND cs.teacher_id = auth.uid()
    )
);

CREATE POLICY "Students manage their own progress"
ON lesson_progress FOR ALL
TO authenticated
USING (student_id = auth.uid() OR is_admin() OR is_teacher());

-- 7. CLASS SESSIONS
CREATE POLICY "Users view class sessions of their courses"
ON class_sessions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Teachers manage class sessions"
ON class_sessions FOR ALL
TO authenticated
USING (
    is_admin() OR
    EXISTS (SELECT 1 FROM class_subjects WHERE id = class_sessions.class_subject_id AND teacher_id = auth.uid())
);

-- 8. ASSIGNMENTS & ATTACHMENTS
CREATE POLICY "View assignments for enrolled or teaching"
ON assignments FOR SELECT
TO authenticated
USING (
    is_admin() OR
    EXISTS (SELECT 1 FROM class_subjects WHERE id = assignments.class_subject_id AND teacher_id = auth.uid()) OR
    EXISTS (
        SELECT 1 FROM enrollments e
        JOIN class_subjects cs ON cs.section_id = e.section_id AND cs.semester_id = e.semester_id
        WHERE cs.id = assignments.class_subject_id AND e.student_id = auth.uid()
    )
);

CREATE POLICY "Teachers manage assignments"
ON assignments FOR ALL
TO authenticated
USING (
    is_admin() OR
    EXISTS (SELECT 1 FROM class_subjects WHERE id = assignments.class_subject_id AND teacher_id = auth.uid())
);

CREATE POLICY "View assignment attachments"
ON assignment_attachments FOR SELECT
TO authenticated
USING (true);

-- 9. SUBMISSIONS & FEEDBACK
CREATE POLICY "Students manage their own submissions"
ON submissions FOR ALL
TO authenticated
USING (
    student_id = auth.uid() OR
    is_admin() OR
    EXISTS (
        SELECT 1 FROM assignments a
        JOIN class_subjects cs ON cs.id = a.class_subject_id
        WHERE a.id = submissions.assignment_id AND cs.teacher_id = auth.uid()
    )
);

CREATE POLICY "Submissions files policy"
ON submission_files FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM submissions s
        WHERE s.id = submission_files.submission_id AND (
            s.student_id = auth.uid() OR is_admin() OR
            EXISTS (
                SELECT 1 FROM assignments a
                JOIN class_subjects cs ON cs.id = a.class_subject_id
                WHERE a.id = s.assignment_id AND cs.teacher_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Submission feedback access"
ON submission_feedback FOR SELECT
TO authenticated
USING (
    is_admin() OR
    grader_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM submissions s WHERE s.id = submission_feedback.submission_id AND s.student_id = auth.uid()
    )
);

CREATE POLICY "Teachers can insert/update feedback"
ON submission_feedback FOR ALL
TO authenticated
USING (
    is_admin() OR grader_id = auth.uid()
);

-- 10. NOTIFICATIONS
CREATE POLICY "Users manage their notifications"
ON notifications FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- 11. ANNOUNCEMENTS
CREATE POLICY "View announcements"
ON announcements FOR SELECT
TO authenticated
USING (
    target_audience = 'all' OR
    (target_audience = 'teachers' AND is_teacher()) OR
    (target_audience = 'students' AND is_student()) OR
    is_admin()
);

CREATE POLICY "Admin and Teachers can create announcements"
ON announcements FOR INSERT
TO authenticated
WITH CHECK (is_admin() OR is_teacher());

-- 12. ATTENDANCE RECORDS
CREATE POLICY "Students view their own attendance"
ON attendance_records FOR SELECT
TO authenticated
USING (
    student_id = auth.uid() OR
    is_admin() OR
    recorded_by = auth.uid() OR
    EXISTS (SELECT 1 FROM class_subjects WHERE id = attendance_records.class_subject_id AND teacher_id = auth.uid())
);

CREATE POLICY "Teachers record attendance"
ON attendance_records FOR INSERT
TO authenticated
WITH CHECK (
    is_admin() OR
    EXISTS (SELECT 1 FROM class_subjects WHERE id = class_subject_id AND teacher_id = auth.uid())
);

-- 13. AUDIT LOGS
CREATE POLICY "Admin only can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (is_admin());
