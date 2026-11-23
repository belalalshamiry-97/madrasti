"use client";

import { getSchoolSettingsFromDB, updateSchoolSettingsInDB } from "@/lib/services/settings-service";

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
  contact_phone: "+967-783085075",
  contact_email: "info@madrasti.school",
  academic_year: "2026-2027",
  current_term: "الفصل الدراسي الأول",
};

const STORAGE_KEY = "madrasti_school_settings";
export const EVENT_NAME = "madrasti_school_updated";

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
  
  // Asynchronously trigger DB update without blocking synchronous return
  updateSchoolSettingsInDB(updated).catch((err) =>
    console.warn("Background updateSchoolSettingsInDB sync failed:", err)
  );

  return updated;
}

/**
 * Fetch authoritative school info from Supabase and synchronize localStorage and UI
 */
export async function syncSchoolInfoFromDB(): Promise<SchoolInfo> {
  try {
    const dbSettings = await getSchoolSettingsFromDB();
    const updated: SchoolInfo = {
      school_name: dbSettings.school_name || DEFAULT_SCHOOL_INFO.school_name,
      address: dbSettings.address || DEFAULT_SCHOOL_INFO.address,
      contact_phone: dbSettings.contact_phone || DEFAULT_SCHOOL_INFO.contact_phone,
      contact_email: dbSettings.contact_email || DEFAULT_SCHOOL_INFO.contact_email,
      academic_year: dbSettings.academic_year || DEFAULT_SCHOOL_INFO.academic_year,
      current_term: dbSettings.current_term || DEFAULT_SCHOOL_INFO.current_term,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    }
    return updated;
  } catch {
    return getSchoolInfo();
  }
}

/**
 * Save school info to both Supabase and localStorage
 */
export async function saveSchoolInfoAsync(info: Partial<SchoolInfo>): Promise<{ success: boolean; info: SchoolInfo; error?: string }> {
  const local = saveSchoolInfo(info);
  try {
    const res = await updateSchoolSettingsInDB({
      school_name: local.school_name,
      address: local.address,
      contact_phone: local.contact_phone,
      contact_email: local.contact_email,
      academic_year: local.academic_year,
      current_term: local.current_term,
    });
    return { success: res.success, info: local, error: res.error };
  } catch (err: any) {
    return { success: false, info: local, error: err.message };
  }
}

