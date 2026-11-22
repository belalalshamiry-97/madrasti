import {
  Profile,
  SchoolSettings,
  ClassSubject,
  Lesson,
  ClassSession,
  Assignment,
  Announcement,
  Notification,
  Quiz,
  QuizQuestion,
  AttendanceRecord,
} from "@/types/database.types";

export const MOCK_SCHOOL_SETTINGS: SchoolSettings = {
  id: "00000000-0000-0000-0000-000000000001",
  school_name: "ثانوية مدرستي النموذجية",
  school_logo_url: null,
  contact_phone: "+967-5-123456",
  contact_email: "info@madrasti.school",
  address: "حضرموت — المكلا — شارع المعلمين",
  timezone: "Asia/Aden",
  max_file_size_mb: 25,
  allowed_file_types: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
  messaging_enabled: true,
  quizzes_enabled: true,
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
};

export const MOCK_USERS: Record<string, Profile> = {
  admin: {
    id: "aa000000-0000-0000-0000-000000000001",
    role: "ADMIN",
    full_name: "د. عبد الرحمن باحميد",
    username: "admin",
    phone: "777111222",
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  },
  teacher1: {
    id: "bb000000-0000-0000-0000-000000000001",
    role: "TEACHER",
    full_name: "م. بلال الشميري",
    username: "teacher1",
    phone: "777333444",
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  },
  teacher2: {
    id: "bb000000-0000-0000-0000-000000000002",
    role: "TEACHER",
    full_name: "أ. فاطمة العولقي",
    username: "teacher2",
    phone: "777555666",
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  },
  student1: {
    id: "cc000000-0000-0000-0000-000000000001",
    role: "STUDENT",
    full_name: "عمر أحمد بافضل",
    username: "student1",
    phone: "777888999",
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  },
  student2: {
    id: "cc000000-0000-0000-0000-000000000002",
    role: "STUDENT",
    full_name: "سارة خالد الكثيري",
    username: "student2",
    phone: "777999000",
    is_active: true,
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  },
};

export const MOCK_COURSES: (ClassSubject & {
  lessons_count: number;
  assignments_count: number;
  progress_percentage: number;
})[] = [
  {
    id: "80000000-0000-0000-0000-000000000001",
    section_id: "50000000-0000-0000-0000-000000000001",
    subject_id: "60000000-0000-0000-0000-000000000001",
    teacher_id: "bb000000-0000-0000-0000-000000000001",
    semester_id: "20000000-0000-0000-0000-000000000001",
    subject: {
      id: "60000000-0000-0000-0000-000000000001",
      name: "إدارة الشبكات",
      code: "NET-301",
      subject_type: "theory",
      icon_name: "Network",
    },
    teacher: MOCK_USERS.teacher1,
    lessons_count: 4,
    assignments_count: 4,
    progress_percentage: 75,
  },
  {
    id: "80000000-0000-0000-0000-000000000002",
    section_id: "50000000-0000-0000-0000-000000000001",
    subject_id: "60000000-0000-0000-0000-000000000002",
    teacher_id: "bb000000-0000-0000-0000-000000000002",
    semester_id: "20000000-0000-0000-0000-000000000001",
    subject: {
      id: "60000000-0000-0000-0000-000000000002",
      name: "أمنية النظم والشبكات",
      code: "SEC-302",
      subject_type: "practical",
      icon_name: "ShieldCheck",
    },
    teacher: MOCK_USERS.teacher2,
    lessons_count: 3,
    assignments_count: 2,
    progress_percentage: 50,
  },
  {
    id: "80000000-0000-0000-0000-000000000003",
    section_id: "50000000-0000-0000-0000-000000000001",
    subject_id: "60000000-0000-0000-0000-000000000003",
    teacher_id: "bb000000-0000-0000-0000-000000000001",
    semester_id: "20000000-0000-0000-0000-000000000001",
    subject: {
      id: "60000000-0000-0000-0000-000000000003",
      name: "برمجة التطبيقات المتقدمة",
      code: "DEV-303",
      subject_type: "practical",
      icon_name: "Code2",
    },
    teacher: MOCK_USERS.teacher1,
    lessons_count: 5,
    assignments_count: 3,
    progress_percentage: 60,
  },
  {
    id: "80000000-0000-0000-0000-000000000004",
    section_id: "50000000-0000-0000-0000-000000000001",
    subject_id: "60000000-0000-0000-0000-000000000004",
    teacher_id: "bb000000-0000-0000-0000-000000000001",
    semester_id: "20000000-0000-0000-0000-000000000001",
    subject: {
      id: "60000000-0000-0000-0000-000000000004",
      name: "إدارة الشبكات (عملي)",
      code: "NET-301L",
      subject_type: "practical",
      icon_name: "Network",
    },
    teacher: MOCK_USERS.teacher1,
    lessons_count: 4,
    assignments_count: 3,
    progress_percentage: 80,
  },
];

export const MOCK_LESSONS: Lesson[] = [
  {
    id: "90000000-0000-0000-0000-000000000004",
    class_subject_id: "80000000-0000-0000-0000-000000000001",
    lesson_number: 4,
    title: "المحاضرة 4 : موازنة أعباء الشبكة (NLB)",
    description: "موازنة أعباء الشبكة Network Load Balancing وتوزيع حركة البيانات وضمان الاستمرارية",
    objectives: "إعداد خوادم متزامنة لتوزيع حركة البيانات وضمان استمرارية الخدمة العالية High Availability",
    status: "published",
    published_at: "21 نوفمبر • 10:00 ص - 12:00 م",
    created_at: "2026-11-21T07:00:00Z",
    sessions_count: 1,
    questions_count: 0,
    assignments_count: 1,
    materials_count: 0,
    is_completed: false,
  },
  {
    id: "90000000-0000-0000-0000-000000000003",
    class_subject_id: "80000000-0000-0000-0000-000000000001",
    lesson_number: 3,
    title: "المحاضرة 3 : نظام أسماء النطاقات (DNS)",
    description: "نظام أسماء النطاقات والتحليل العكسي وإعداد سجلات المضيف A و CNAME و PTR",
    objectives: "إتقان إعداد خادم DNS المحلي وفهم آلية حل الأسماء التكرارية والاستعلامية",
    status: "published",
    published_at: "14 نوفمبر • 10:00 ص - 12:00 م",
    created_at: "2026-11-14T07:00:00Z",
    sessions_count: 1,
    questions_count: 1,
    assignments_count: 1,
    materials_count: 1,
    is_completed: true,
  },
  {
    id: "90000000-0000-0000-0000-000000000002",
    class_subject_id: "80000000-0000-0000-0000-000000000001",
    lesson_number: 2,
    title: "المحاضرة 2 : بروتوكول التهيئة الآلية (DHCP)",
    description: "بروتوكول التهيئة الآلية للعناوين وإعدادات النطاق وحجز العناوين المستقرة",
    objectives: "إتقان إعداد خادم DHCP وإدارة نطاقات العناوين (Scopes) وحجز العناوين للأجهزة الثابتة",
    status: "published",
    published_at: "7 نوفمبر • 10:00 ص - 12:00 م",
    created_at: "2026-11-07T07:00:00Z",
    sessions_count: 1,
    questions_count: 1,
    assignments_count: 1,
    materials_count: 2,
    is_completed: true,
  },
  {
    id: "90000000-0000-0000-0000-000000000001",
    class_subject_id: "80000000-0000-0000-0000-000000000001",
    lesson_number: 1,
    title: "المحاضرة 1 : مقدمة ومعمارية بروتوكولات الشبكات",
    description: "مقدمة معمارية الشبكات ونموذج OSI و TCP/IP",
    objectives: "التعرف على الطبقات السبع ومسار تدفق البيانات وحزم الترويسات",
    status: "published",
    published_at: "31 أكتوبر • 09:00 ص - 11:00 ص",
    created_at: "2026-10-31T07:00:00Z",
    sessions_count: 1,
    questions_count: 2,
    assignments_count: 1,
    materials_count: 1,
    is_completed: true,
  },
];

export const MOCK_SESSIONS: ClassSession[] = [
  {
    id: "b1000000-0000-0000-0000-000000000001",
    lesson_id: "90000000-0000-0000-0000-000000000002",
    class_subject_id: "80000000-0000-0000-0000-000000000001",
    title: "جلسة تعويضية",
    session_date: "2026/11/07",
    start_time: "10:00 AM",
    end_time: "12:00 PM",
    location_or_room: "القاعة: 403",
    meeting_url: "https://meet.google.com/sample-session",
    status: "scheduled",
    teacher_notes: "يرجى الحضور بالوقت المحدد ومراجعة الدرس الأول",
  },
];

export const MOCK_ASSIGNMENTS: (Assignment & {
  course_name: string;
})[] = [
  {
    id: "c1000000-0000-0000-0000-000000000001",
    class_subject_id: "80000000-0000-0000-0000-000000000001",
    lesson_id: "90000000-0000-0000-0000-000000000002",
    title: "تكليف 2 — تطبيق عملي DHCP",
    instructions: "قم بتهيئة نطاق عناوين 192.168.1.0/24 ورفع ملف الحل مصوراً بصيغة PDF أو التقاط صور حل الدفتر مباشرة بالكاميرا.",
    assignment_type: "assignment",
    max_score: 10,
    open_date: "2026/11/07",
    due_date: "2026/11/21 11:55 AM",
    max_attempts: 2,
    allow_late_submissions: true,
    allow_resubmissions: true,
    status: "late",
    course_name: "إدارة الشبكات",
  },
  {
    id: "c1000000-0000-0000-0000-000000000002",
    class_subject_id: "80000000-0000-0000-0000-000000000002",
    title: "نشاط تحليلي — خوارزميات التشفير RSA",
    instructions: "شرح آلية توليد المفاتيح العامة والخاصة وتطبيق مثال حسابي بالأرقام.",
    assignment_type: "activity",
    max_score: 5,
    open_date: "2026/11/15",
    due_date: "2026/11/28 08:00 PM",
    max_attempts: 1,
    allow_late_submissions: false,
    allow_resubmissions: false,
    status: "pending",
    course_name: "أمنية النظم والشبكات",
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "d1000000-0000-0000-0000-000000000001",
    title: "أهلاً بكم في العام الدراسي 2026-2027",
    content: "ترحب إدارة ثانوية مدرستي بجميع المعلمين والطلاب في بوابتنا التعليمية الإلكترونية المتكاملة.",
    target_audience: "all",
    created_by: "د. عبد الرحمن باحميد",
    created_at: "2026-11-20T08:00:00Z",
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "e1000000-0000-0000-0000-000000000001",
    user_id: "cc000000-0000-0000-0000-000000000001",
    title: "تكليف متأخر",
    message: "يرجى تسليم تكليف 2 في مادة إدارة الشبكات في أقرب وقت.",
    link_url: "/student/assignments",
    type: "assignment",
    is_read: false,
    created_at: "2026-11-21T11:55:00Z",
  },
  {
    id: "e1000000-0000-0000-0000-000000000002",
    user_id: "cc000000-0000-0000-0000-000000000001",
    title: "جلسة تعويضية مجدولة",
    message: "جلسة تعويضية لمادة إدارة الشبكات في القاعة 403.",
    link_url: "/student/courses/80000000-0000-0000-0000-000000000001",
    type: "session",
    is_read: false,
    created_at: "2026-11-20T09:00:00Z",
  },
];

export interface MockSubmissionWithDetails {
  id: string;
  assignment_id: string;
  assignment_title: string;
  course_name: string;
  student_id: string;
  student_name: string;
  student_username: string;
  attempt_number: number;
  answer_text: string;
  status: "draft" | "submitted" | "late" | "grading" | "graded" | "revision_requested";
  submitted_at: string;
  files: { name: string; size: number; url: string }[];
  max_score: number;
  score?: number | null;
  feedback_notes?: string | null;
  graded_at?: string | null;
  grader_name?: string | null;
}

export const MOCK_SUBMISSIONS: MockSubmissionWithDetails[] = [
  {
    id: "sub-1001",
    assignment_id: "c1000000-0000-0000-0000-000000000001",
    assignment_title: "تكليف 2 — تطبيق عملي DHCP",
    course_name: "إدارة الشبكات",
    student_id: "cc000000-0000-0000-0000-000000000001",
    student_name: "عمر أحمد بافضل",
    student_username: "student1",
    attempt_number: 1,
    answer_text: "تم إعداد سيرفر DHCP بنجاح على Windows Server 2022 وتعيين Scope من 192.168.1.50 إلى 192.168.1.150، مع حجز العنوان 192.168.1.10 لطابعة الشبكة. مرفق صور الشاشات وتقرير خطوات العمل.",
    status: "submitted",
    submitted_at: "2026/11/21 11:30 AM",
    files: [
      {
        name: "dhcp_configuration_report_omar.pdf",
        size: 1540000,
        url: "#",
      },
      {
        name: "server_dhcp_scope_screenshot.png",
        size: 620000,
        url: "#",
      },
    ],
    max_score: 10,
    score: null,
    feedback_notes: null,
  },
  {
    id: "sub-1002",
    assignment_id: "c1000000-0000-0000-0000-000000000001",
    assignment_title: "تكليف 2 — تطبيق عملي DHCP",
    course_name: "إدارة الشبكات",
    student_id: "cc000000-0000-0000-0000-000000000002",
    student_name: "سارة خالد الكثيري",
    student_username: "student2",
    attempt_number: 1,
    answer_text: "قمت بتهيئة الخادم وتفعيل الـ Relay Agent وتجربة توزيع العناوين بنجاح على شبكتين فرعيتين.",
    status: "graded",
    submitted_at: "2026/11/20 09:15 PM",
    files: [
      {
        name: "dhcp_solution_sarah.pdf",
        size: 2100000,
        url: "#",
      },
    ],
    max_score: 10,
    score: 9.5,
    feedback_notes: "عمل ممتاز وتوثيق احترافي لخطوات DORA والتحقق من الـ Leases. أحسنتِ!",
    graded_at: "2026/11/21 04:00 PM",
    grader_name: "م. بلال الشميري",
  },
  {
    id: "sub-1003",
    assignment_id: "c1000000-0000-0000-0000-000000000002",
    assignment_title: "نشاط تحليلي — خوارزميات التشفير RSA",
    course_name: "أمنية النظم والشبكات",
    student_id: "cc000000-0000-0000-0000-000000000001",
    student_name: "عمر أحمد بافضل",
    student_username: "student1",
    attempt_number: 1,
    answer_text: "شرح تفصيلي لدالة أويلر واختيار الأعداد الأولية p و q وحساب المفتاح العام والخاص مع مثال رقمي كامل.",
    status: "graded",
    submitted_at: "2026/11/18 06:20 PM",
    files: [
      {
        name: "rsa_algorithm_handwritten_notes.jpg",
        size: 890000,
        url: "#",
      },
    ],
    max_score: 5,
    score: 5.0,
    feedback_notes: "حل نموذجي وشرح رياضي دقيق. ممتاز يا عمر.",
    graded_at: "2026/11/19 10:15 AM",
    grader_name: "أ. فاطمة العولقي",
  },
];

export interface MockMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: "TEACHER" | "STUDENT";
  body: string;
  created_at: string;
  is_read: boolean;
}

export interface MockConversation {
  id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
  student_id: string;
  student_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface MockLessonQuestion {
  id: string;
  lesson_id: string;
  student_name: string;
  question_text: string;
  created_at: string;
  answers: {
    id: string;
    responder_name: string;
    responder_role: string;
    answer_text: string;
    created_at: string;
  }[];
}

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: "conv-1",
    subject_name: "إدارة الشبكات",
    teacher_id: "bb000000-0000-0000-0000-000000000001",
    teacher_name: "م. بلال الشميري",
    student_id: "cc000000-0000-0000-0000-000000000001",
    student_name: "عمر أحمد بافضل",
    last_message: "أهلاً عمر، تم الاطلاع على تقريرك وهو ممتاز جداً، استمر!",
    last_message_time: "اليوم 04:30 م",
    unread_count: 0,
  },
  {
    id: "conv-2",
    subject_name: "أمنية النظم والشبكات",
    teacher_id: "bb000000-0000-0000-0000-000000000002",
    teacher_name: "أ. فاطمة العولقي",
    student_id: "cc000000-0000-0000-0000-000000000001",
    student_name: "عمر أحمد بافضل",
    last_message: "يرجى مراجعة خوارزمية Diffie-Hellman قبل اختبار الأسبوع القادم.",
    last_message_time: "أمس 08:15 م",
    unread_count: 1,
  },
];

export const MOCK_MESSAGES_CONV1: MockMessage[] = [
  {
    id: "msg-1",
    conversation_id: "conv-1",
    sender_id: "cc000000-0000-0000-0000-000000000001",
    sender_name: "عمر أحمد بافضل",
    sender_role: "STUDENT",
    body: "السلام عليكم أستاذ بلال، هل تم تحديد موعد الجلسة التعويضية القادمة لمادة الشبكات؟",
    created_at: "أمس 10:30 ص",
    is_read: true,
  },
  {
    id: "msg-2",
    conversation_id: "conv-1",
    sender_id: "bb000000-0000-0000-0000-000000000001",
    sender_name: "م. بلال الشميري",
    sender_role: "TEACHER",
    body: "وعليكم السلام ورحمة الله، نعم يا عمر، تم جدولتها يوم السبت القادم في القاعة 403 معمل الحاسوب، وستجد التفاصيل كاملة في صفحة الدرس.",
    created_at: "أمس 11:00 ص",
    is_read: true,
  },
  {
    id: "msg-3",
    conversation_id: "conv-1",
    sender_id: "cc000000-0000-0000-0000-000000000001",
    sender_name: "عمر أحمد بافضل",
    sender_role: "STUDENT",
    body: "شكراً جزيلاً أستاذ، قمت برفع ملف تكليف الـ DHCP أيضاً.",
    created_at: "اليوم 11:35 ص",
    is_read: true,
  },
  {
    id: "msg-4",
    conversation_id: "conv-1",
    sender_id: "bb000000-0000-0000-0000-000000000001",
    sender_name: "م. بلال الشميري",
    sender_role: "TEACHER",
    body: "أهلاً عمر، تم الاطلاع على تقريرك وهو ممتاز جداً، استمر!",
    created_at: "اليوم 04:30 م",
    is_read: true,
  },
];

export const MOCK_LESSON_QUESTIONS: MockLessonQuestion[] = [
  {
    id: "q-1",
    lesson_id: "90000000-0000-0000-0000-000000000002",
    student_name: "عمر أحمد بافضل",
    question_text: "ما هو الفرق الأساسي بين مدة حجز العنوان (Lease Time) في الشبكات السلكية مقارنة بشبكات الـ Wi-Fi العامة؟",
    created_at: "منذ يومين",
    answers: [
      {
        id: "ans-1",
        responder_name: "م. بلال الشميري",
        responder_role: "معلم المادة",
        answer_text: "سؤال ممتاز يا عمر؛ في الشبكات العامة (كالجامعات والمطارات) يُفضل تقصير مدة الـ Lease لعدة ساعات لتفادي نفاد نطاق العناوين (Pool Exhaustion)، بينما في الشركات السلكية الثابتة تُضبط لعدة أيام.",
        created_at: "منذ يوم",
      },
    ],
  },
];

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: "quiz-101",
    class_subject_id: "80000000-0000-0000-0000-000000000001",
    course_name: "إدارة الشبكات",
    title: "اختبار دوري 1 — مفاهيم وبروتوكولات الشبكات (OSI & DHCP)",
    description: "اختبار قصير موقوت يشمل معمارية الشبكات، حزمة بروتوكولات TCP/IP، وآلية توزيع العناوين التلقائية DHCP.",
    duration_minutes: 15,
    total_score: 10,
    passing_score: 5,
    start_time: "2026-11-20T08:00:00Z",
    end_time: "2026-11-25T23:59:00Z",
    status: "published",
    questions_count: 4,
  },
  {
    id: "quiz-102",
    class_subject_id: "80000000-0000-0000-0000-000000000002",
    course_name: "أمنية النظم والشبكات",
    title: "اختبار مفاهيم التشفير بالمفتاح العام RSA",
    description: "اختبار تقييمي لقياس فهم الطلاب لمراحل توليد المفاتيح والتشفير وحساب دالة أويلر.",
    duration_minutes: 20,
    total_score: 15,
    passing_score: 8,
    start_time: "2026-11-26T09:00:00Z",
    end_time: "2026-11-28T23:59:00Z",
    status: "draft",
    questions_count: 5,
  },
];

export const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q-1",
    quiz_id: "quiz-101",
    question_text: "أي طبقة في نموذج OSI مسؤولة عن التوجيه المنطقي (Routing) وعناوين IP؟",
    question_type: "mcq",
    points: 2.5,
    options: [
      { id: "opt-1", text: "طبقة التطبيقات (Application Layer)" },
      { id: "opt-2", text: "طبقة الشبكة (Network Layer)" },
      { id: "opt-3", text: "طبقة ربط البيانات (Data Link Layer)" },
      { id: "opt-4", text: "طبقة النقل (Transport Layer)" },
    ],
    correct_answer: "opt-2",
    explanation: "طبقة الشبكة (Layer 3) هي المسؤولة عن العنونة المنطقية والتوجيه عبر الموجهات (Routers).",
  },
  {
    id: "q-2",
    quiz_id: "quiz-101",
    question_text: "ما هو رقم المنفذ الافتراضي (UDP Port) الذي يستمع عليه خادم DHCP لطلبات العملاء؟",
    question_type: "mcq",
    points: 2.5,
    options: [
      { id: "opt-1", text: "Port 67" },
      { id: "opt-2", text: "Port 68" },
      { id: "opt-3", text: "Port 80" },
      { id: "opt-4", text: "Port 53" },
    ],
    correct_answer: "opt-1",
    explanation: "خادم DHCP يستمع على المنفذ UDP 67، بينما يستقبل عميل DHCP الردود على المنفذ UDP 68.",
  },
  {
    id: "q-3",
    quiz_id: "quiz-101",
    question_text: "يعتمد بروتوكول DHCP على حزمة بروتوكول النقل UDP بدلاً من TCP لتسريع تبادل حزم الاستكشاف والتأجير.",
    question_type: "true_false",
    points: 2.5,
    options: [
      { id: "opt-t", text: "صحيح (True)" },
      { id: "opt-f", text: "خطأ (False)" },
    ],
    correct_answer: "opt-t",
    explanation: "صحيح؛ نظراً لأن العميل لا يمتلك عنوان IP في البداية، فإنه يبث رسائل برودكاست عبر UDP دون الحاجة لمصافحة TCP.",
  },
  {
    id: "q-4",
    quiz_id: "quiz-101",
    question_text: "ما هي الرسالة الأولى في دورة عمل بروتوكول DHCP المكونة من 4 خطوات (DORA)؟",
    question_type: "mcq",
    points: 2.5,
    options: [
      { id: "opt-1", text: "DHCP Discover" },
      { id: "opt-2", text: "DHCP Offer" },
      { id: "opt-3", text: "DHCP Request" },
      { id: "opt-4", text: "DHCP Acknowledgment" },
    ],
    correct_answer: "opt-1",
    explanation: "تبدأ العملية برسالة DHCP Discover التي يبثها الجهاز للبحث عن خادم DHCP في الشبكة المحلية.",
  },
];

export const MOCK_ATTENDANCE_STUDENTS: AttendanceRecord[] = [
  {
    id: "att-1",
    student_id: "cc000000-0000-0000-0000-000000000001",
    student_name: "عمر أحمد بافضل",
    student_number: "2026-0101",
    section_id: "sec-301",
    attendance_date: "2026-11-22",
    status: "present",
  },
  {
    id: "att-2",
    student_id: "cc000000-0000-0000-0000-000000000002",
    student_name: "سارة خالد الكثيري",
    student_number: "2026-0102",
    section_id: "sec-301",
    attendance_date: "2026-11-22",
    status: "present",
  },
  {
    id: "att-3",
    student_id: "cc000000-0000-0000-0000-000000000003",
    student_name: "عبد الله محمد بن يحيى",
    student_number: "2026-0103",
    section_id: "sec-301",
    attendance_date: "2026-11-22",
    status: "present",
  },
  {
    id: "att-4",
    student_id: "cc000000-0000-0000-0000-000000000004",
    student_name: "فاطمة صالح باوزير",
    student_number: "2026-0104",
    section_id: "sec-301",
    attendance_date: "2026-11-22",
    status: "late",
    notes: "تأخر 15 دقيقة بعذر مروري",
  },
  {
    id: "att-5",
    student_id: "cc000000-0000-0000-0000-000000000005",
    student_name: "أحمد سالم بن محفوظ",
    student_number: "2026-0105",
    section_id: "sec-301",
    attendance_date: "2026-11-22",
    status: "absent",
    notes: "لم يتم تقديم عذر مسبق",
  },
  {
    id: "att-6",
    student_id: "cc000000-0000-0000-0000-000000000006",
    student_name: "ريم علي العمودي",
    student_number: "2026-0106",
    section_id: "sec-301",
    attendance_date: "2026-11-22",
    status: "excused",
    notes: "إشعار مسبق من ولي الأمر",
  },
  {
    id: "att-7",
    student_id: "cc000000-0000-0000-0000-000000000007",
    student_name: "محمد خالد العامري",
    student_number: "2026-0107",
    section_id: "sec-301",
    attendance_date: "2026-11-22",
    status: "present",
  },
  {
    id: "att-8",
    student_id: "cc000000-0000-0000-0000-000000000008",
    student_name: "نور عبد الله باحارثة",
    student_number: "2026-0108",
    section_id: "sec-301",
    attendance_date: "2026-11-22",
    status: "present",
  },
];
