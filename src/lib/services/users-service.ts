"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Profile, UserRole } from "@/types/database.types";
import { revalidatePath } from "next/cache";

export interface UserCreateInput {
  full_name: string;
  username: string;
  password: string;
  role: UserRole;
  phone?: string;
  grade?: string;
  section?: string;
  permissions?: string[];
  status?: "active" | "suspended";
}

/**
 * Fetch all profiles directly from Supabase public.profiles
 */
export async function getProfilesFromDB(roleFilter?: UserRole | "ALL"): Promise<Profile[]> {
  try {
    const admin = createAdminClient();
    let query = admin.from("profiles").select("*").order("created_at", { ascending: false });

    if (roleFilter && roleFilter !== "ALL") {
      query = query.eq("role", roleFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }

    return (data || []) as Profile[];
  } catch (err) {
    console.error("Exception in getProfilesFromDB:", err);
    return [];
  }
}

/**
 * Create a new user (Teacher or Student or Admin) in Supabase Auth & public.profiles
 */
export async function createUserInDB(input: UserCreateInput): Promise<{
  success: boolean;
  user?: Profile;
  error?: string;
}> {
  try {
    const cleanUsername = input.username.trim().toLowerCase();
    const cleanFullName = input.full_name.trim();

    if (!cleanUsername || !input.password || !cleanFullName) {
      return { success: false, error: "يرجى تعبئة جميع الحقول المطلوبة (الاسم، اسم المستخدم، كلمة المرور)." };
    }

    if (input.password.length < 6) {
      return { success: false, error: "كلمة المرور يجب ألا تقل عن 6 أحرف." };
    }

    const admin = createAdminClient();

    // 1. Check if username is already taken in profiles
    const { data: existingUser } = await admin
      .from("profiles")
      .select("id")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (existingUser) {
      return { success: false, error: "اسم المستخدم هذا مسجل بالفعل في المنصة، يرجى اختيار اسم مستخدم آخر." };
    }

    // 2. Generate internal email for Supabase Auth
    const email = `${cleanUsername}@madrasti.school`;

    // 3. Create user in auth.users via Supabase Admin API
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        username: cleanUsername,
        full_name: cleanFullName,
        role: input.role,
        grade: input.grade || null,
        section: input.section || null,
        phone: input.phone || null,
      },
    });

    if (authError || !authData.user) {
      console.error("Supabase auth user creation error:", authError);
      return { success: false, error: authError?.message || "فشل إنشاء حساب المستخدم في نظام المصادقة." };
    }

    const userId = authData.user.id;

    // 4. Insert profile into public.profiles
    const profilePayload = {
      id: userId,
      role: input.role,
      full_name: cleanFullName,
      username: cleanUsername,
      phone: input.phone?.trim() || null,
      is_active: input.status !== "suspended",
    };

    const { data: profileData, error: profileError } = await admin
      .from("profiles")
      .insert(profilePayload)
      .select()
      .single();

    if (profileError) {
      console.error("Supabase profile insert error:", profileError);
      // Rollback auth user creation if profile fails
      await admin.auth.admin.deleteUser(userId);
      return { success: false, error: `فشل حفظ الملف الشخصي: ${profileError.message}` };
    }

    // 5. If student and section provided, handle enrollment if section exists
    if (input.role === "STUDENT" && input.section) {
      try {
        // Look up section or semester if exists
        const { data: sec } = await admin
          .from("sections")
          .select("id")
          .ilike("name", `%${input.section}%`)
          .maybeSingle();

        const { data: sem } = await admin
          .from("semesters")
          .select("id")
          .eq("is_active", true)
          .maybeSingle();

        if (sec && sem) {
          await admin.from("enrollments").insert({
            student_id: userId,
            section_id: sec.id,
            semester_id: sem.id,
            status: "active",
          });
        }
      } catch (enrollErr) {
        console.warn("Auto enrollment warning:", enrollErr);
      }
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/enrollments");

    return { success: true, user: profileData as Profile };
  } catch (err: any) {
    console.error("Exception in createUserInDB:", err);
    return { success: false, error: err.message || "حدث خطأ غير متوقع أثناء إنشاء المستخدم." };
  }
}

/**
 * Update user status (active / suspended)
 */
export async function updateUserStatusInDB(userId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("profiles")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete user from profiles and auth.users
 */
export async function deleteUserFromDB(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    
    // Delete profile first (or auth delete will cascade if configured)
    await admin.from("profiles").delete().eq("id", userId);
    
    // Delete from auth.users
    const { error: authErr } = await admin.auth.admin.deleteUser(userId);
    if (authErr) console.warn("Notice deleting auth user:", authErr);

    revalidatePath("/admin/users");
    revalidatePath("/admin/enrollments");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Ensure default school settings and initial Admin exist in Supabase
 */
export async function seedInitialAdminAndSchool(): Promise<{ success: boolean; message: string }> {
  try {
    const admin = createAdminClient();

    // 1. Ensure school_settings exists
    const { count: schoolCount } = await admin.from("school_settings").select("*", { count: "exact", head: true });
    if (!schoolCount || schoolCount === 0) {
      await admin.from("school_settings").insert({
        id: "00000000-0000-0000-0000-000000000001",
        school_name: "ثانوية مدرستي النموذجية",
        contact_phone: "+967-783085075",
        contact_email: "info@madrasti.school",
        address: "حضرموت — المكلا — شارع المعلمين",
        timezone: "Asia/Aden",
        max_file_size_mb: 25,
        allowed_file_types: ["pdf", "docx", "pptx", "jpg", "jpeg", "png", "webp"],
        messaging_enabled: true,
        quizzes_enabled: true,
      });
      console.log("Default school settings created.");
    }

    // 2. Check if an admin exists in profiles
    const { count: adminCount } = await admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "ADMIN");

    if (!adminCount || adminCount === 0) {
      // Create admin user in auth.users
      const adminEmail = "admin@madrasti.school";
      const adminPassword = "123"; // Standard default password as configured in platform

      // Check if user already in auth.users
      const { data: usersList } = await admin.auth.admin.listUsers();
      let adminAuthId = usersList?.users?.find(u => u.email === adminEmail)?.id;

      if (!adminAuthId) {
        const { data: newAuth, error: createErr } = await admin.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: {
            username: "admin",
            full_name: "د. عبد الرحمن باحميد (مدير المدرسة)",
            role: "ADMIN",
          },
        });
        if (createErr || !newAuth.user) {
          throw new Error(`Failed to create admin in auth.users: ${createErr?.message}`);
        }
        adminAuthId = newAuth.user.id;
      }

      // Insert profile
      await admin.from("profiles").upsert({
        id: adminAuthId,
        role: "ADMIN",
        full_name: "د. عبد الرحمن باحميد",
        username: "admin",
        phone: "777111222",
        is_active: true,
      });

      console.log("Initial admin profile seeded successfully.");
    }

    // 3. Ensure base grade levels exist if empty
    const { count: gradesCount } = await admin.from("grade_levels").select("*", { count: "exact", head: true });
    if (!gradesCount || gradesCount === 0) {
      await admin.from("grade_levels").insert([
        { id: "30000000-0000-0000-0000-000000000001", name: "الأول الثانوي", level_order: 1 },
        { id: "30000000-0000-0000-0000-000000000002", name: "الثاني الثانوي", level_order: 2 },
        { id: "30000000-0000-0000-0000-000000000003", name: "الثالث الثانوي", level_order: 3 },
      ]);
    }

    return { success: true, message: "تمت تهيئة بيانات الإدارة والمدرسة بنجاح." };
  } catch (err: any) {
    console.error("Error in seedInitialAdminAndSchool:", err);
    return { success: false, message: err.message };
  }
}
