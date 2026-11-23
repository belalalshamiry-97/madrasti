"use client";

export interface AcademicGrade {
  id: string;
  name: string;
  stage: string;
  description: string;
  tracks: string[];
}

export interface AcademicSection {
  id: string;
  grade: string;
  name: string;
  track: string;
  capacity: number;
  enrolled: number;
}

export interface SubjectAssignment {
  id: string;
  name: string;
  code: string;
  type: "theory" | "practical";
  grade: string;
  section: string;
  teacherName: string;
}

const GRADES_STORAGE_KEY = "madrasti_grades_directory";
const SECTIONS_STORAGE_KEY = "madrasti_sections_directory";
const SUBJECTS_STORAGE_KEY = "madrasti_subjects_directory";

export const INITIAL_GRADES: AcademicGrade[] = [
  {
    id: "grade-1",
    name: "الأول الثانوي",
    stage: "المرحلة الأولى",
    description: "المسار العام المشترك",
    tracks: ["عام"],
  },
  {
    id: "grade-2",
    name: "الثاني الثانوي",
    stage: "المرحلة الثانية",
    description: "التخصص في المسار العلمي والأدبي",
    tracks: ["علمي", "أدبي"],
  },
  {
    id: "grade-3",
    name: "الثالث الثانوي",
    stage: "المرحلة الثالثة",
    description: "الشهادة الثانوية العامة والمشاريع",
    tracks: ["علمي", "أدبي"],
  },
];

export const INITIAL_SECTIONS: AcademicSection[] = [
  { id: "sec-1", grade: "الثالث الثانوي", name: "الشعبة (أ)", track: "علمي", capacity: 30, enrolled: 28 },
  { id: "sec-2", grade: "الثالث الثانوي", name: "الشعبة (ب)", track: "علمي", capacity: 30, enrolled: 26 },
  { id: "sec-3", grade: "الثاني الثانوي", name: "الشعبة (أ)", track: "علمي", capacity: 32, enrolled: 30 },
  { id: "sec-4", grade: "الثاني الثانوي", name: "الشعبة (ب)", track: "أدبي", capacity: 25, enrolled: 22 },
  { id: "sec-5", grade: "الأول الثانوي", name: "الشعبة (أ)", track: "عام", capacity: 35, enrolled: 34 },
  { id: "sec-6", grade: "الأول الثانوي", name: "الشعبة (ب)", track: "عام", capacity: 35, enrolled: 32 },
];

export const INITIAL_SUBJECTS: SubjectAssignment[] = [
  {
    id: "sub-1",
    name: "إدارة الشبكات",
    code: "NET-301",
    type: "theory",
    grade: "الثالث الثانوي",
    section: "الشعبة (أ) و (ب)",
    teacherName: "م. بلال الشميري",
  },
  {
    id: "sub-2",
    name: "أمنية النظم والشبكات",
    code: "SEC-302",
    type: "practical",
    grade: "الثالث الثانوي",
    section: "الشعبة (أ)",
    teacherName: "أ. فاطمة العولقي",
  },
  {
    id: "sub-3",
    name: "برمجة التطبيقات المتقدمة",
    code: "DEV-303",
    type: "practical",
    grade: "الثالث الثانوي",
    section: "الشعبة (أ)",
    teacherName: "م. بلال الشميري",
  },
  {
    id: "sub-4",
    name: "الرياضيات التطبيقية",
    code: "MATH-304",
    type: "theory",
    grade: "الثالث الثانوي",
    section: "الشعبة (أ) و (ب)",
    teacherName: "أ. فاطمة العولقي",
  },
];

// --- Grades Store Functions ---
export function getStoredGrades(): AcademicGrade[] {
  if (typeof window === "undefined") return INITIAL_GRADES;
  try {
    const raw = localStorage.getItem(GRADES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(INITIAL_GRADES));
      return INITIAL_GRADES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_GRADES;
  } catch {
    return INITIAL_GRADES;
  }
}

export function saveStoredGrade(grade: AcademicGrade): void {
  if (typeof window === "undefined") return;
  const current = getStoredGrades();
  const index = current.findIndex((g) => g.id === grade.id || g.name === grade.name);
  let updated: AcademicGrade[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...grade };
  } else {
    updated = [...current, grade];
  }
  localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(updated));
}

export function deleteStoredGrade(id: string): void {
  if (typeof window === "undefined") return;
  const current = getStoredGrades();
  const updated = current.filter((g) => g.id !== id);
  localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(updated));
}

// --- Sections Store Functions ---
export function getStoredSections(): AcademicSection[] {
  if (typeof window === "undefined") return INITIAL_SECTIONS;
  try {
    const raw = localStorage.getItem(SECTIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SECTIONS_STORAGE_KEY, JSON.stringify(INITIAL_SECTIONS));
      return INITIAL_SECTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SECTIONS;
  } catch {
    return INITIAL_SECTIONS;
  }
}

export function saveStoredSection(section: AcademicSection): void {
  if (typeof window === "undefined") return;
  const current = getStoredSections();
  const updated = [section, ...current];
  localStorage.setItem(SECTIONS_STORAGE_KEY, JSON.stringify(updated));
}

export function deleteStoredSection(id: string): void {
  if (typeof window === "undefined") return;
  const current = getStoredSections();
  const updated = current.filter((s) => s.id !== id);
  localStorage.setItem(SECTIONS_STORAGE_KEY, JSON.stringify(updated));
}

// --- Subjects Store Functions ---
export function getStoredSubjects(): SubjectAssignment[] {
  if (typeof window === "undefined") return INITIAL_SUBJECTS;
  try {
    const raw = localStorage.getItem(SUBJECTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(INITIAL_SUBJECTS));
      return INITIAL_SUBJECTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SUBJECTS;
  } catch {
    return INITIAL_SUBJECTS;
  }
}

export function saveStoredSubject(subject: SubjectAssignment): void {
  if (typeof window === "undefined") return;
  const current = getStoredSubjects();
  const index = current.findIndex((s) => s.id === subject.id);
  let updated: SubjectAssignment[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...subject };
  } else {
    updated = [subject, ...current];
  }
  localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(updated));
}

export function deleteStoredSubject(id: string): void {
  if (typeof window === "undefined") return;
  const current = getStoredSubjects();
  const updated = current.filter((s) => s.id !== id);
  localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(updated));
}
