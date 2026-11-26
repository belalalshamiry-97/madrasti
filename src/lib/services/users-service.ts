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
  grade_id?: string;
  section_id?: string;
  permissions?: string[];
  status?: "active" | "suspended";
}

export interface EnrolledStudentData {
  id: string; // student profile id (UUID)
  full_name: string;
  username: string;
  phone: string;
  is_active: boolean;
  enrollment_id?: string;
  grade_level_id?: string;
  grade_name?: string;
  section_id?: string;
  section_name?: string;
  semester_id?: string;
  semester_name?: string;
  enrolled_at?: string;
  status: "active" | "withdrawn" | "completed";
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

    // 5. If student and section/section_id provided, handle enrollment
    if (input.role === "STUDENT" && (input.section_id || input.section)) {
      try {
        let secId = input.section_id;
        if (!secId && input.section) {
          let q = admin.from("sections").select("id").ilike("name", `%${input.section}%`);
          if (input.grade_id) q = q.eq("grade_level_id", input.grade_id);
          const { data: sec } = await q.maybeSingle();
          secId = sec?.id;
        }

        const { data: sem } = await admin
          .from("semesters")
          .select("id")
          .eq("is_active", true)
          .maybeSingle();

        const activeSemId = sem?.id || (await admin.from("semesters").select("id").limit(1).maybeSingle()).data?.id;

        if (secId && activeSemId) {
          await admin.from("enrollments").upsert(
            {
              student_id: userId,
              section_id: secId,
              semester_id: activeSemId,
              status: "active",
            },
            { onConflict: "student_id,semester_id" }
          );
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

/**
 * Fetch all registered students along with their active enrollment, section and grade from Supabase
 */
export async function getEnrolledStudentsFromDB(): Promise<EnrolledStudentData[]> {
  try {
    const admin = createAdminClient();

    // 1. Get all student profiles
    const { data: students, error: studErr } = await admin
      .from("profiles")
      .select("*")
      .eq("role", "STUDENT")
      .order("created_at", { ascending: false });

    if (studErr || !students) return [];

    // 2. Get all enrollments with relations
    const { data: enrollments } = await admin
      .from("enrollments")
      .select(`
        id,
        student_id,
        section_id,
        semester_id,
        status,
        enrolled_at,
        sections (
          id,
          name,
          grade_level_id,
          grade_levels ( id, name )
        ),
        semesters (
          id,
          name
        )
      `);

    const enrollMap = new Map<string, any>();
    if (enrollments) {
      for (const e of enrollments) {
        if (e.status === "active" || !enrollMap.has(e.student_id)) {
          enrollMap.set(e.student_id, e);
        }
      }
    }

    return students.map((s) => {
      const enr = enrollMap.get(s.id);
      return {
        id: s.id,
        full_name: s.full_name,
        username: s.username,
        phone: s.phone || "",
        is_active: Boolean(s.is_active),
        enrollment_id: enr?.id,
        grade_level_id: enr?.sections?.grade_levels?.id,
        grade_name: enr?.sections?.grade_levels?.name || "غير محدد",
        section_id: enr?.sections?.id,
        section_name: enr?.sections?.name || "غير مسجل بشعبة",
        semester_id: enr?.semesters?.id,
        semester_name: enr?.semesters?.name || "الفصل الدراسي الأول",
        enrolled_at: enr?.enrolled_at || s.created_at,
        status: (enr?.status as any) || (s.is_active ? "active" : "suspended"),
      };
    });
  } catch (err) {
    console.error("Error in getEnrolledStudentsFromDB:", err);
    return [];
  }
}

/**
 * Update student profile and change/assign section enrollment
 */
export async function updateStudentAction(input: {
  student_id: string;
  full_name: string;
  phone?: string;
  section_id?: string;
  is_active?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const cleanName = input.full_name?.trim();
    if (!cleanName) return { success: false, error: "اسم الطالب مطلوب ولا يمكن تركه فارغاً." };

    // 1. Update profile
    const profileUpdate: any = {
      full_name: cleanName,
      phone: input.phone?.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if (input.is_active !== undefined) {
      profileUpdate.is_active = input.is_active;
    }

    const { error: profErr } = await admin
      .from("profiles")
      .update(profileUpdate)
      .eq("id", input.student_id);

    if (profErr) {
      return { success: false, error: `فشل تحديث الملف الشخصي: ${profErr.message}` };
    }

    // 2. Update / Upsert enrollment if section_id is provided
    if (input.section_id) {
      // Find active semester
      const { data: sem } = await admin
        .from("semesters")
        .select("id")
        .eq("is_active", true)
        .maybeSingle();

      const semesterId = sem?.id || (await admin.from("semesters").select("id").limit(1).maybeSingle()).data?.id;

      if (!semesterId) {
        return { success: false, error: "تعذر العثور على فصل دراسي نشط لتسجيل الطالب." };
      }

      const { error: enrollErr } = await admin
        .from("enrollments")
        .upsert(
          {
            student_id: input.student_id,
            section_id: input.section_id,
            semester_id: semesterId,
            status: input.is_active === false ? "withdrawn" : "active",
            enrolled_at: new Date().toISOString(),
          },
          { onConflict: "student_id,semester_id" }
        );

      if (enrollErr) {
        console.error("Error updating student enrollment:", enrollErr);
        return { success: false, error: `فشل تحديث الشعبة المسجلة للطالب: ${enrollErr.message}` };
      }
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/enrollments");
    revalidatePath("/student");
    revalidatePath("/student/courses");
    return { success: true };
  } catch (err: any) {
    console.error("Exception in updateStudentAction:", err);
    return { success: false, error: err.message || "حدث خطأ غير متوقع أثناء تحديث بيانات الطالب." };
  }
}

/**
 * Update general user profile (Teacher or Admin or Student)
 */
export async function updateUserAction(input: {
  user_id: string;
  full_name: string;
  phone?: string;
  is_active?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const cleanName = input.full_name?.trim();
    if (!cleanName) return { success: false, error: "الاسم مطلوب ولا يمكن تركه فارغاً." };

    const updatePayload: any = {
      full_name: cleanName,
      phone: input.phone?.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if (input.is_active !== undefined) {
      updatePayload.is_active = input.is_active;
    }

    const { error } = await admin
      .from("profiles")
      .update(updatePayload)
      .eq("id", input.user_id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/users");
    revalidatePath("/admin/enrollments");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

