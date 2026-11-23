"use client";

export interface SchoolInfo {
  school_name: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  academic_year: string;
  current_term: string;
}

export const DEFAULT_SCHOOL_INFO: SchoolInfo = {
  school_name: "ثانوية مدرستي النموذجية",
  address: "حضرموت — المكلا — شارع المعلمين",
  contact_phone: "+967-5-123456",
  contact_email: "info@madrasti.school",
  academic_year: "2026-2027",
  current_term: "الفصل الدراسي الأول",
};

const STORAGE_KEY = "madrasti_school_settings";
const EVENT_NAME = "madrasti_school_updated";

export function getSchoolInfo(): SchoolInfo {
  if (typeof window === "undefined") return DEFAULT_SCHOOL_INFO;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SCHOOL_INFO));
      return DEFAULT_SCHOOL_INFO;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SCHOOL_INFO, ...parsed };
  } catch {
    return DEFAULT_SCHOOL_INFO;
  }
}

export function saveSchoolInfo(info: Partial<SchoolInfo>): SchoolInfo {
  if (typeof window === "undefined") return DEFAULT_SCHOOL_INFO;
  const current = getSchoolInfo();
  const updated: SchoolInfo = {
    ...current,
    ...info,
    school_name: (info.school_name || current.school_name).trim(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Dispatch custom event for real-time reactivity in headers and sidebars
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
  return updated;
}
