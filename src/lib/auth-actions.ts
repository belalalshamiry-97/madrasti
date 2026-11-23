"use server";

import { cookies } from "next/headers";
import { UserRole } from "@/types/database.types";

const ROLE_COOKIE = "madrasti_session_role";
const USER_COOKIE = "madrasti_session_username";
const NAME_COOKIE = "madrasti_session_name";

export async function setSessionRole(
  role: UserRole,
  username?: string,
  fullName?: string
) {
  const cookieStore = await cookies();
  const options = {
    path: "/",
    httpOnly: false,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  };

  cookieStore.set(ROLE_COOKIE, role, options);
  if (username) cookieStore.set(USER_COOKIE, username, options);
  if (fullName) cookieStore.set(NAME_COOKIE, encodeURIComponent(fullName), options);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ROLE_COOKIE);
  cookieStore.delete(USER_COOKIE);
  cookieStore.delete(NAME_COOKIE);
}
