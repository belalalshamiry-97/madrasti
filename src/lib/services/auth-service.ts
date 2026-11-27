"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Profile, UserRole } from "@/types/database.types";
import { setSessionRole, clearSession } from "@/lib/auth-actions";

export interface LoginResult {
  success: boolean;
  user?: Profile;
  role?: UserRole;
  error?: string;
}

/**
 * Authenticate user with Supabase Auth GoTrue and fetch role from public.profiles
 */
export async function loginWithSupabase(loginIdentifier: string, password: string): Promise<LoginResult> {
  try {
    const rawInput = loginIdentifier.trim().toLowerCase();
    if (!rawInput || !password) {
      return { success: false, error: "يرجى إدخال اسم المستخدم وكلمة المرور." };
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    // 1. Resolve email from username or email input
    let email = rawInput;
    let targetProfile = null;

    const isSchoolDomain = rawInput.endsWith("@madrasti.school");
    const possibleUsername = isSchoolDomain ? rawInput.replace(/@madrasti\.school$/i, "") : rawInput;

    if (!rawInput.includes("@") || isSchoolDomain) {
      // 1. Try exact username match in public.profiles
      let { data: profile } = await admin
        .from("profiles")
        .select("*")
        .eq("username", possibleUsername)
        .maybeSingle();

      // 2. Fallback to case-insensitive ilike match
      if (!profile) {
        const { data: ilikeProfile } = await admin
          .from("profiles")
          .select("*")
          .ilike("username", possibleUsername)
          .maybeSingle();
        profile = ilikeProfile;
      }

      if (profile) {
        targetProfile = profile;
        const { data: authUser } = await admin.auth.admin.getUserById(profile.id);
        if (authUser?.user?.email) {
          email = authUser.user.email;
        } else {
          email = `${profile.username}@madrasti.school`;
        }
      } else {
        if (!rawInput.includes("@")) {
          return {
            success: false,
            error: `اسم المستخدم "${rawInput}" غير مسجل في النظام. يرجى التأكد من كتابة اسم المستخدم الصحيح.`,
          };
        }
      }
    }

    // 2. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.warn("Supabase Auth login password failed for:", email, authError?.message);
      return {
        success: false,
        error: "كلمة المرور غير صحيحة. يرجى التأكد من إدخال كلمة المرور الصحيحة.",
      };
    }

    const authUserId = authData.user.id;

    // 3. Fetch user profile from public.profiles using admin client (bypasses RLS)
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", authUserId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Profile not found for authenticated auth user:", authUserId);
      await supabase.auth.signOut();
      return {
        success: false,
        error: "تم التحقق من بيانات الدخول ولكن لم يتم العثور على الملف الشخصي المقترن بالحساب. يرجى التواصل مع إدارة المدرسة.",
      };
    }

    // 4. Verify account active status
    if (profile.is_active === false) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "هذا الحساب معطل حالياً من قبل إدارة المدرسة. يرجى مراجعة المسؤول.",
      };
    }

    // 5. Set session cookies for fast route guarding
    await setSessionRole(profile.role, profile.username, profile.full_name);

    return {
      success: true,
      user: profile as Profile,
      role: profile.role,
    };
  } catch (err: any) {
    console.error("Exception in loginWithSupabase:", err);
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء الاتصال بنظام تسجيل الدخول.",
    };
  }
}

/**
 * Sign out user from Supabase and clear session cookies
 */
export async function logoutWithSupabase(): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    await clearSession();
    return { success: true };
  } catch (err) {
    console.error("Error signing out:", err);
    await clearSession();
    return { success: true };
  }
}

/**
 * Get the currently logged-in profile from Supabase
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData?.user) return null;

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    return (profile as Profile) || null;
  } catch {
    return null;
  }
}
