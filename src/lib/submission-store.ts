"use client";

import { MOCK_SUBMISSIONS, MockSubmissionWithDetails } from "@/lib/mock-data";
import { getStoredSubjects } from "@/lib/academic-store";

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  assignment_title: string;
  course_name: string;
  grade?: string;
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

const SUBMISSIONS_STORAGE_KEY = "madrasti_submissions_directory";

export const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: "sub-1001",
    assignment_id: "c1000000-0000-0000-0000-000000000001",
    assignment_title: "تكليف 2 — تطبيق عملي DHCP وتوزيع العناوين",
    course_name: "إدارة الشبكات",
    grade: "الثالث الثانوي",
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
    graded_at: null,
    grader_name: null,
  },
  {
    id: "sub-1002",
    assignment_id: "c1000000-0000-0000-0000-000000000001",
    assignment_title: "تكليف 2 — تطبيق عملي DHCP وتوزيع العناوين",
    course_name: "إدارة الشبكات",
    grade: "الثالث الثانوي",
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
    score: 10,
    feedback_notes: "إجابة نموذجية وتهيئة متقنة لكافة معلمات الـ Scope والـ Reservation. أحسنتِ!",
    graded_at: "2026/11/21 10:00 AM",
    grader_name: "م. بلال الشميري",
  },
  {
    id: "sub-1003",
    assignment_id: "c1000000-0000-0000-0000-000000000003",
    assignment_title: "واجب 1 — خوارزميات التشفير المتناظر AES",
    course_name: "أمنية النظم والشبكات",
    grade: "الثالث الثانوي",
    student_id: "cc000000-0000-0000-0000-000000000001",
    student_name: "عمر أحمد بافضل",
    student_username: "student1",
    attempt_number: 1,
    answer_text: "قمت بكتابة كود بايثون بسيط لتشفير وفك تشفير النصوص باستخدام مكتبة cryptography ونمط CBC.",
    status: "graded",
    submitted_at: "2026/11/18 04:45 PM",
    files: [
      {
        name: "aes_crypto_assignment_omar.py",
        size: 45000,
        url: "#",
      },
    ],
    max_score: 10,
    score: 9.5,
    feedback_notes: "تطبيق متكامل وتوثيق ممتاز للأكواد. درجاتك ممتازة يا عمر.",
    graded_at: "2026/11/19 02:00 PM",
    grader_name: "أ. فاطمة العولقي",
  },
];

/**
 * Retrieves all stored submissions from localStorage or initializes default
 */
export function getStoredSubmissions(): AssignmentSubmission[] {
  if (typeof window === "undefined") return INITIAL_SUBMISSIONS;
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SUBMISSIONS;
  } catch {
    return INITIAL_SUBMISSIONS;
  }
}

/**
 * Saves or updates a submission permanently
 */
export function saveStoredSubmission(sub: AssignmentSubmission): void {
  if (typeof window === "undefined") return;
  const current = getStoredSubmissions();
  const index = current.findIndex((s) => s.id === sub.id);
  let updated: AssignmentSubmission[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...sub };
  } else {
    updated = [sub, ...current];
  }
  localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Grades a submission, updates its score, notes, and changes status to 'graded'
 */
export function gradeSubmission(
  submissionId: string,
  score: number,
  feedbackNotes: string,
  graderName: string
): boolean {
  if (typeof window === "undefined") return false;
  const current = getStoredSubmissions();
  const index = current.findIndex((s) => s.id === submissionId);
  if (index === -1) return false;

  const nowFormatted = new Date().toLocaleString("ar-YE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const updatedSub: AssignmentSubmission = {
    ...current[index],
    score,
    feedback_notes: feedbackNotes.trim(),
    status: "graded",
    grader_name: graderName,
    graded_at: nowFormatted,
  };

  current[index] = updatedSub;
  localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(current));
  return true;
}

/**
 * Retrieves submissions strictly belonging to courses assigned to the specified teacher
 */
export function getSubmissionsForTeacher(
  teacherFullName: string,
  teacherUsername?: string
): AssignmentSubmission[] {
  const allSubs = getStoredSubmissions();
  const allSubjects = getStoredSubjects();

  const cleanName = teacherFullName ? teacherFullName.trim().toLowerCase() : "";
  const cleanUser = teacherUsername ? teacherUsername.trim().toLowerCase() : "";

  // Find all subjects assigned to this teacher
  const assignedSubjectNames = allSubjects
    .filter((s) => {
      const sTeacher = s.teacherName.trim().toLowerCase();
      if (cleanName && (sTeacher.includes(cleanName) || cleanName.includes(sTeacher))) return true;
      if (cleanUser && sTeacher.includes(cleanUser)) return true;
      return false;
    })
    .map((s) => s.name.trim().toLowerCase());

  // Strict subject matching
  return allSubs.filter((sub) => {
    const subCourse = sub.course_name.trim().toLowerCase();
    if (assignedSubjectNames.length > 0) {
      return assignedSubjectNames.some(
        (asName) => asName.includes(subCourse) || subCourse.includes(asName)
      );
    }

    // Fallback defaults for legacy mock teachers
    if (cleanUser === "teacher1" || cleanName.includes("بلال")) {
      return subCourse.includes("شبكات") || subCourse.includes("برمجة") || subCourse.includes("حاسوب");
    }
    if (cleanUser === "teacher2" || cleanName.includes("فاطمة")) {
      return subCourse.includes("رياضيات") || subCourse.includes("أمنية") || subCourse.includes("كيمياء") || subCourse.includes("عربية");
    }

    return false;
  });
}

/**
 * Retrieves submissions strictly belonging to the specified student
 */
export function getSubmissionsForStudent(
  studentId: string,
  studentUsername: string
): AssignmentSubmission[] {
  const allSubs = getStoredSubmissions();
  const cleanId = studentId ? studentId.trim() : "";
  const cleanUser = studentUsername ? studentUsername.trim().toLowerCase() : "";

  return allSubs.filter((s) => {
    if (cleanId && s.student_id === cleanId) return true;
    if (cleanUser && s.student_username.toLowerCase() === cleanUser) return true;
    return false;
  });
}
