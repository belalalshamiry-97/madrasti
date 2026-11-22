-- ============================================================================
-- MADRASTI LMS — SEED.SQL
-- Realistic seed data matching school curriculum and reference designs
-- ============================================================================

-- 1. School Settings
INSERT INTO school_settings (id, school_name, contact_phone, contact_email, address, timezone)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'ثانوية مدرستي النموذجية المتميزة',
    '+967 770 000 000',
    'info@madrasti.school',
    'اليمن — حضرموت / صنعاء / عدن',
    'Asia/Aden'
) ON CONFLICT (id) DO NOTHING;

-- 2. Academic Years & Semesters
INSERT INTO academic_years (id, name, start_date, end_date, is_current)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    '2026-2027',
    '2026-09-01',
    '2027-06-30',
    true
) ON CONFLICT (name) DO NOTHING;

INSERT INTO semesters (id, academic_year_id, name, code, start_date, end_date, is_active)
VALUES (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'الفصل الدراسي الأول',
    '20261',
    '2026-09-01',
    '2027-01-31',
    true
) ON CONFLICT (academic_year_id, code) DO NOTHING;

-- 3. Grade Levels & Tracks
INSERT INTO grade_levels (id, name, level_order) VALUES
('30000000-0000-0000-0000-000000000001', 'الأول الثانوي', 1),
('30000000-0000-0000-0000-000000000002', 'الثاني الثانوي', 2),
('30000000-0000-0000-0000-000000000003', 'الثالث الثانوي', 3)
ON CONFLICT (name) DO NOTHING;

INSERT INTO academic_tracks (id, name, code, description) VALUES
('40000000-0000-0000-0000-000000000001', 'المسار العام', 'GENERAL', 'المسار المشترك للصف الأول الثانوي'),
('40000000-0000-0000-0000-000000000002', 'المسار العلمي', 'SCIENCE', 'مسار العلوم الطبيعية والحاسوبية'),
('40000000-0000-0000-0000-000000000003', 'المسار الأدبي', 'LITERARY', 'مسار الدراسات الإنسانية والأدبية')
ON CONFLICT (name) DO NOTHING;

-- 4. Sections
INSERT INTO sections (id, name, grade_level_id, academic_track_id, capacity) VALUES
('50000000-0000-0000-0000-000000000001', 'الشعبة (أ)', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', 30),
('50000000-0000-0000-0000-000000000002', 'الشعبة (ب)', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', 30)
ON CONFLICT DO NOTHING;

-- 5. Subjects
INSERT INTO subjects (id, name, code, description, icon_name, subject_type) VALUES
('60000000-0000-0000-0000-000000000001', 'إدارة الشبكات', 'NET-301', 'مقرر إدارة وصيانة الخوادم والشبكات المتقدمة', 'Network', 'theory'),
('60000000-0000-0000-0000-000000000002', 'أمنية النظم والشبكات', 'SEC-302', 'مقرر حماية البيانات والتشفير وأمن المعلومات', 'ShieldCheck', 'practical'),
('60000000-0000-0000-0000-000000000003', 'برمجة التطبيقات المتقدمة', 'DEV-303', 'تطوير تطبيقات الويب والهواتف الذكية الحديثة', 'Code2', 'practical'),
('60000000-0000-0000-0000-000000000004', 'الرياضيات التطبيقية', 'MATH-304', 'التفاضل والتكامل والجبر الخطي المتقدم', 'Calculator', 'theory')
ON CONFLICT (code) DO NOTHING;

-- 6. Profiles (Admin, Teachers, Student)
INSERT INTO profiles (id, role, full_name, username, phone, is_active) VALUES
('aa000000-0000-0000-0000-000000000001', 'ADMIN', 'د. عبد الرحمن باحميد', 'admin', '777111222', true),
('bb000000-0000-0000-0000-000000000001', 'TEACHER', 'م. بلال الشميري', 'teacher1', '777333444', true),
('bb000000-0000-0000-0000-000000000002', 'TEACHER', 'أ. فاطمة العولقي', 'teacher2', '777555666', true),
('cc000000-0000-0000-0000-000000000001', 'STUDENT', 'عمر أحمد بافضل', 'student1', '777888999', true),
('cc000000-0000-0000-0000-000000000002', 'STUDENT', 'سارة خالد الكثيري', 'student2', '777000111', true)
ON CONFLICT (username) DO NOTHING;

-- 7. Enrollments
INSERT INTO enrollments (id, student_id, section_id, semester_id, status) VALUES
('70000000-0000-0000-0000-000000000001', 'cc000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'active'),
('70000000-0000-0000-0000-000000000002', 'cc000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'active')
ON CONFLICT DO NOTHING;

-- 8. Class Subjects
INSERT INTO class_subjects (id, section_id, subject_id, teacher_id, semester_id) VALUES
('80000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001'),
('80000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001'),
('80000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- 9. Lessons (matching reference image 4 timeline)
INSERT INTO lessons (id, class_subject_id, lesson_number, title, description, objectives, content_html, status, published_at) VALUES
('90000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 1, 'Lecture 1 : Introduction & Protocol Stack', 'مقدمة معمارية الشبكات ونموذج OSI و TCP/IP', 'فهم طبقات الاتصال والوظيفة الأساسية لكل بروتوكول', '<p>شرح تفصيلي لنموذج TCP/IP وطبقات الشبكة</p>', 'published', '2026-10-31 09:00:00+03'),
('90000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', 2, 'Lecture 2 : DHCP', 'بروتوكول التهيئة الآلية للعناوين وإعدادات النطاق', 'إتقان إعداد خادم DHCP وإدارة نطاقات العناوين (Scopes)', '<p>شرح عملي لإعداد DHCP Server والتعامل مع طلبات DORA</p>', 'published', '2026-11-07 10:00:00+03'),
('90000000-0000-0000-0000-000000000003', '80000000-0000-0000-0000-000000000001', 3, 'Lecture 3 : DNS', 'نظام أسماء النطاقات والتحليل العكسي', 'فهم طريقة عمل DNS وتكوين مناطق Forward and Reverse Lookup Zones', '<p>شرح هيكلية نظام DNS العالمي وإعداد السجلات</p>', 'published', '2026-11-14 12:00:00+03'),
('90000000-0000-0000-0000-000000000004', '80000000-0000-0000-0000-000000000001', 4, 'Lecture 4 : NLB', 'موازنة أعباء الشبكة Network Load Balancing', 'إعداد خوادم متزامنة لتوزيع حركة البيانات وضمان الاستمرارية High Availability', '<p>شرح تكوين عناوين افتراضية Cluster IP وتوزيع الحمولات</p>', 'published', '2026-11-21 10:00:00+03')
ON CONFLICT DO NOTHING;

-- 10. Lesson Materials (matching reference image 5)
INSERT INTO lesson_materials (id, lesson_id, title, material_type, file_path, file_size_bytes, external_url) VALUES
('a1000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000002', 'Network_Administration_Lecture_2_DHCP_.pdf', 'pdf', 'courses/net-admin/lecture-2-dhcp.pdf', 1048576, NULL),
('a1000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000002', 'ملف تسجيل المحاضرة', 'video_link', NULL, NULL, 'https://youtube.com/watch?v=sample-dhcp')
ON CONFLICT DO NOTHING;

-- 11. Class Sessions (matching reference image 1 & 5)
INSERT INTO class_sessions (id, lesson_id, class_subject_id, title, session_date, start_time, end_time, location_or_room, meeting_url, status, teacher_notes) VALUES
('b1000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', 'جلسة تعويضية', '2026-11-07', '10:00:00', '12:00:00', 'القاعة: 403', 'https://meet.google.com/madrasti-net-403', 'scheduled', 'يرجى إحضار أجهزة الحاسوب المحمول لمتابعة التطبيق العملي')
ON CONFLICT DO NOTHING;

-- 12. Assignments (matching reference image 1)
INSERT INTO assignments (id, class_subject_id, lesson_id, title, instructions, assignment_type, max_score, open_date, due_date, max_attempts, allow_late_submissions, allow_resubmissions) VALUES
('c1000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000002', 'تكليف 2 — تطبيق عملي DHCP', 'قم بتهيئة نطاق عناوين 192.168.1.0/24 وتخصيص استثناءات للأجهزة الثابتة ورفع تقرير مصور بالحل.', 'assignment', 10.00, '2026-11-07 12:00:00+03', '2026-11-21 11:55:00+03', 2, true, true)
ON CONFLICT DO NOTHING;

-- 13. Announcements
INSERT INTO announcements (id, title, content, target_audience, created_by) VALUES
('d1000000-0000-0000-0000-000000000001', 'أهلاً بكم في العام الدراسي الجديد 2026-2027', 'ترحب إدارة ثانوية مدرستي بجميع المعلمين والطلاب في بوابتنا التعليمية الإلكترونية الجديدة.', 'all', 'aa000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- 14. Notifications
INSERT INTO notifications (id, user_id, title, message, link_url, type, is_read) VALUES
('e1000000-0000-0000-0000-000000000001', 'cc000000-0000-0000-0000-000000000001', 'تكليف جديد متاح', 'تمت إضافة تكليف 2 في مادة إدارة الشبكات بموعد تسليم 21 نوفمبر', '/student/assignments', 'assignment', false),
('e1000000-0000-0000-0000-000000000002', 'cc000000-0000-0000-0000-000000000001', 'جلسة تعويضية مجدولة', 'لديك جلسة تعويضية في القاعة 403 لمادة إدارة الشبكات', '/student/courses/80000000-0000-0000-0000-000000000001', 'session', false)
ON CONFLICT DO NOTHING;
