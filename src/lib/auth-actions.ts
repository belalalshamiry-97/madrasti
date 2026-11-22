"use server";

import { cookies } from "next/headers";
import { UserRole } from "@/types/database.types";

const SESSION_COOKIE = "madrasti_session_role";

export async function setSessionRole(role: UserRole) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, role, {
    path: "/",
    httpOnly: false, // Accessible for client-side convenience in demo mode
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}