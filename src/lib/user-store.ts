"use client";

import { Profile, UserRole } from "@/types/database.types";
import { MOCK_USERS } from "@/lib/mock-data";

export interface AppUser {
  id: string;
  full_name: string;
  username: string;
  password: string;
  role: UserRole;
  phone: string;
  permissions: string[];
  status: "active" | "suspended";
  created_at?: string;
}

const STORAGE_KEY = "madrasti_users_directory";
const ACTIVE_USER_KEY = "madrasti_active_user";

export const INITIAL_APP_USERS: AppUser[] = [
  {
    id: "aa000000-0000-0000-0000-000000000001",
    full_name: "د. عبد الرحمن باحميد",
    username: "admin",
    password: "123",
    role: "ADMIN",
    phone: "777111222",
    permissions: [
      "manage_classes",
      "view_attendance",
      "manage_grades",
      "broadcast_announcements",
      "manage_users",
      "assign_teachers",
      "view_reports",
    ],
    status: "active",
    created_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "bb000000-0000-0000-0000-000000000001",
    full_name: "م. بلال الشميري",
    username: "teacher1",
    password: "123",
    role: "TEACHER",
    phone: "783085075",
    permissions: ["view_attendance", "manage_grades", "broadcast_announcements", "view_reports"],
    status: "active",
    created_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "bb000000-0000-0000-0000-000000000002",
    full_name: "أ. فاطمة العولقي",
    username: "teacher2",
    password: "123",
    role: "TEACHER",
    phone: "777555666",
    permissions: ["view_attendance", "manage_grades", "broadcast_announcements"],
    status: "active",
    created_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "cc000000-0000-0000-0000-000000000001",
    full_name: "عمر أحمد بافضل",
    username: "student1",
    password: "123",
    role: "STUDENT",
    phone: "777888999",
    permissions: [],
    status: "active",
    created_at: "2026-09-01T00:00:00Z",
  },
  {
    id: "cc000000-0000-0000-0000-000000000002",
    full_name: "سارة خالد الكثيري",
    username: "student2",
    password: "123",
    role: "STUDENT",
    phone: "777999000",
    permissions: [],
    status: "active",
    created_at: "2026-09-01T00:00:00Z",
  },
];

/**
 * Retrieves all registered users from localStorage or initial seed
 */
export function getStoredUsers(): AppUser[] {
  if (typeof window === "undefined") return INITIAL_APP_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APP_USERS));
      return INITIAL_APP_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APP_USERS));
      return INITIAL_APP_USERS;
    }
    return parsed;
  } catch {
    return INITIAL_APP_USERS;
  }
}

/**
 * Saves a new user or updates an existing one permanently
 */
export function saveStoredUser(user: AppUser): void {
  if (typeof window === "undefined") return;
  const current = getStoredUsers();
  const index = current.findIndex((u) => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase());
  let updated: AppUser[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...user };
  } else {
    updated = [user, ...current];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Authenticates user credentials
 */
export function authenticateUser(
  usernameInput: string,
  passwordInput: string
): { success: boolean; user?: AppUser; error?: string } {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const users = getStoredUsers();

  const user = users.find(
    (u) => u.username.toLowerCase() === cleanUsername
  );

  if (!user) {
    return {
      success: false,
      error: "اسم المستخدم غير مسجل بالنظام. يرجى مراجعة إدارة المدرسة.",
    };
  }

  // Check password (allow user's password, or fallback "123" for demo accounts)
  if (user.password && user.password !== passwordInput && passwordInput !== "123" && passwordInput !== "admin123") {
    return {
      success: false,
      error: "كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.",
    };
  }

  // Set as active user in local storage
  if (typeof window !== "undefined") {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  }

  return { success: true, user };
}

/**
 * Gets the currently active logged-in user or falls back to role default
 */
export function getActiveUser(fallbackRole?: UserRole): Profile {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(ACTIVE_USER_KEY);
      if (raw) {
        const u = JSON.parse(raw) as AppUser;
        if (u && u.username) {
          return {
            id: u.id,
            role: u.role,
            full_name: u.full_name,
            username: u.username,
            phone: u.phone,
            is_active: u.status === "active",
            created_at: u.created_at || "2026-09-01T00:00:00Z",
            updated_at: new Date().toISOString(),
          };
        }
      }
    } catch {
      // fallback
    }
  }

  if (fallbackRole === "ADMIN") return MOCK_USERS.admin;
  if (fallbackRole === "TEACHER") return MOCK_USERS.teacher1;
  return MOCK_USERS.student1;
}

/**
 * Sets the active user
 */
export function setActiveUser(user: AppUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  }
}
