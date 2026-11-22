import { cookies } from "next/headers";
import { Profile } from "@/types/database.types";
import { MOCK_USERS } from "@/lib/mock-data";

const SESSION_COOKIE = "madrasti_session_role";

export async function getCurrentUser(): Promise<Profile | null> {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get(SESSION_COOKIE)?.value;

  if (!roleCookie) {
    return MOCK_USERS.student1;
  }

  if (roleCookie === "ADMIN") return MOCK_USERS.admin;
  if (roleCookie === "TEACHER") return MOCK_USERS.teacher1;
  return MOCK_USERS.student1;
}