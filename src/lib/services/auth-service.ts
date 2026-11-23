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

    // 1. Resolve email
    let email = rawInput;
    if (!rawInput.includes("@")) {
      // Check if username exists in profiles to get user
      const admin = createAdminClient();
      const { data: profileByUsername } = await admin
        .from("profiles")
        .select("id, username")
        .eq("username", rawInput)
        .maybeSingle();

      if (profileByUsername) {
        // Construct the standard school email for auth
        email = `${rawInput}@madrasti.school`;
      } else {
        // Fallback email attempt
        email = `${rawInput}@madrasti.school`;
      }
    }

    // 2. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.warn("Supabase Auth login failed for:", email, authError?.message);
      return {
        success: false,
        error: "بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم وكلمة المرور.",
      };
    }

    const authUserId = authData.user.id;

    // 3. Fetch user profile from public.profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUserId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Profile not found for authenticated auth user:", authUserId);
      await supabase.auth.signOut();
      return {
        success: false,
        error: "لم يتم العثور على الملف الشخصي المقترن بهذا الحساب في المنصة.",
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    return (profile as Profile) || null;
  } catch {
    return null;
  }
}
