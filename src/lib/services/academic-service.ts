"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface AcademicGradeData {
  id: string;
  name: string;
  level_order: number;
  sections_count?: number;
}

export interface AcademicSectionData {
  id: string;
  name: string;
  grade_level_id: string;
  grade_name: string;
  track_name: string;
  capacity: number;
  enrolled_count: number;
}

export interface SubjectData {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon_name?: string;
  subject_type: string;
}

export interface ClassSubjectAssignment {
  id: string;
  section_id: string;
  section_name: string;
  grade_name: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  teacher_id: string;
  teacher_name: string;
  semester_id: string;
}

/**
 * Get all grade levels from Supabase
 */
export async function getGradeLevelsFromDB(): Promise<AcademicGradeData[]> {
  try {
    const admin = createAdminClient();
    const { data: grades, error } = await admin
      .from("grade_levels")
      .select("id, name, level_order")
      .order("level_order", { ascending: true });

    if (error || !grades) return [];

    return grades.map((g) => ({
      id: g.id,
      name: g.name,
      level_order: g.level_order,
    }));
  } catch (err) {
    console.error("Error fetching grade levels:", err);
    return [];
  }
}

/**
 * Get all sections with their grade level & track info
 */
export async function getSectionsFromDB(): Promise<AcademicSectionData[]> {
  try {
    const admin = createAdminClient();
    const { data: sections, error } = await admin
      .from("sections")
      .select(`
        id,
        name,
        capacity,
        grade_level_id,
        grade_levels ( name ),
        academic_tracks ( name )
      `)
      .order("name", { ascending: true });

    if (error || !sections) return [];

    return sections.map((s: any) => ({
      id: s.id,
      name: s.name,
      grade_level_id: s.grade_level_id,
      grade_name: s.grade_levels?.name || "الصف الدراسي",
      track_name: s.academic_tracks?.name || "عام",
      capacity: s.capacity || 30,
      enrolled_count: 0,
    }));
  } catch (err) {
    console.error("Error fetching sections:", err);
    return [];
  }
}

/**
 * Get all subjects from Supabase
 */
export async function getSubjectsFromDB(): Promise<SubjectData[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("subjects")
      .select("id, name, code, description, icon_name, subject_type")
      .order("name", { ascending: true });

    if (error || !data) return [];
    return data as SubjectData[];
  } catch (err) {
    console.error("Error fetching subjects:", err);
    return [];
  }
}

/**
 * Get all class_subjects with teacher assignments
 */
export async function getClassSubjectsFromDB(): Promise<ClassSubjectAssignment[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("class_subjects")
      .select(`
        id,
        section_id,
        subject_id,
        teacher_id,
        semester_id,
        sections (
          name,
          grade_levels ( name )
        ),
        subjects (
          name,
          code
        ),
        profiles (
          full_name
        )
      `);

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      section_id: item.section_id,
      section_name: item.sections?.name || "",
      grade_name: item.sections?.grade_levels?.name || "",
      subject_id: item.subject_id,
      subject_name: item.subjects?.name || "",
      subject_code: item.subjects?.code || "",
      teacher_id: item.teacher_id,
      teacher_name: item.profiles?.full_name || "غير محدد",
      semester_id: item.semester_id,
    }));
  } catch (err) {
    console.error("Error fetching class_subjects:", err);
    return [];
  }
}

/**
 * Add a new Grade Level to Supabase
 */
export async function createGradeLevelAction(name: string): Promise<{ success: boolean; error?: string }> {
  try {
    const clean = name.trim();
    if (!clean) return { success: false, error: "اسم الصف مطلوب." };

    const admin = createAdminClient();
    const { count } = await admin.from("grade_levels").select("*", { count: "exact", head: true });
    const levelOrder = (count || 0) + 1;

    const { error } = await admin.from("grade_levels").insert({
      name: clean,
      level_order: levelOrder,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/classes");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Add a new Section to Supabase
 */
export async function createSectionAction(
  name: string,
  gradeLevelId: string,
  capacity = 30
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanName = name.trim();
    if (!cleanName || !gradeLevelId) return { success: false, error: "يرجى اختيار الصف وكتابة اسم الشعبة." };

    const admin = createAdminClient();
    const { error } = await admin.from("sections").insert({
      name: cleanName,
      grade_level_id: gradeLevelId,
      capacity,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/classes");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export interface SemesterData {
  id: string;
  name: string;
  academic_year_id: string;
  year_name?: string;
  is_active: boolean;
}

/**
 * Get all semesters from Supabase
 */
export async function getSemestersFromDB(): Promise<SemesterData[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("semesters")
      .select(`
        id,
        name,
        academic_year_id,
        is_active,
        academic_years ( name )
      `)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((s: any) => ({
      id: s.id,
      name: s.name,
      academic_year_id: s.academic_year_id,
      year_name: s.academic_years?.name || "",
      is_active: Boolean(s.is_active),
    }));
  } catch (err) {
    console.error("Error fetching semesters:", err);
    return [];
  }
}

/**
 * Add a new Subject to Supabase with unique code validation
 */
export async function createSubjectAction(
  name: string,
  code: string,
  subjectType = "theory",
  description = ""
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanName || !cleanCode) return { success: false, error: "اسم المقرر ورمزه مطلوبان." };

    const admin = createAdminClient();

    // Check if code already exists
    const { data: existing } = await admin
      .from("subjects")
      .select("id")
      .eq("code", cleanCode)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "رمز المقرر هذا مسجل مسبقاً، يرجى اختيار رمز آخر." };
    }

    const { error } = await admin.from("subjects").insert({
      name: cleanName,
      code: cleanCode,
      subject_type: subjectType,
      description: description.trim() || undefined,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Update an existing Subject in Supabase
 */
export async function updateSubjectAction(
  id: string,
  name: string,
  code: string,
  subjectType = "theory",
  description = ""
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanName || !cleanCode) return { success: false, error: "اسم المقرر ورمزه مطلوبان." };

    const admin = createAdminClient();

    // Check if code is taken by another subject
    const { data: existing } = await admin
      .from("subjects")
      .select("id")
      .eq("code", cleanCode)
      .neq("id", id)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "رمز المقرر هذا مسجل مسبقاً لمادة أخرى." };
    }

    const { error } = await admin
      .from("subjects")
      .update({
        name: cleanName,
        code: cleanCode,
        subject_type: subjectType,
        description: description.trim() || null,
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete a Subject from Supabase
 */
export async function deleteSubjectAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();

    // Check if subject is assigned to any class_subjects
    const { count } = await admin
      .from("class_subjects")
      .select("id", { count: "exact", head: true })
      .eq("subject_id", id);

    if (count && count > 0) {
      return {
        success: false,
        error: `لا يمكن حذف هذه المادة لأنها مسندة حالياً لـ (${count}) شعبة دراسية. يرجى إلغاء إسنادها أولاً.`,
      };
    }

    const { error } = await admin.from("subjects").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Assign Teacher to a Subject & Section in Supabase respecting UNIQUE(section_id, subject_id, semester_id)
 */
export async function assignTeacherToSubjectAction(
  sectionId: string,
  subjectId: string,
  teacherId: string,
  semesterId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();

    let semId = semesterId;
    if (!semId) {
      const { data: sem } = await admin
        .from("semesters")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      semId = sem?.id;
    }

    if (!semId) {
      const { data: firstSem } = await admin.from("semesters").select("id").limit(1).maybeSingle();
      semId = firstSem?.id;
    }

    if (!semId) {
      return { success: false, error: "تعذر تحديد الفصل الدراسي للإسناد." };
    }

    // Upsert class_subjects using constraint onConflict
    const { error } = await admin.from("class_subjects").upsert(
      {
        section_id: sectionId,
        subject_id: subjectId,
        teacher_id: teacherId,
        semester_id: semId,
      },
      { onConflict: "section_id,subject_id,semester_id" }
    );

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/subjects");
    revalidatePath("/teacher");
    revalidatePath("/teacher/courses");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete a teaching assignment from class_subjects
 */
export async function deleteClassSubjectAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("class_subjects").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/subjects");
    revalidatePath("/teacher");
    revalidatePath("/teacher/courses");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get courses assigned to a specific teacher from Supabase with REAL student and lesson counts
 */
export async function getTeacherCoursesFromDB(teacherIdOrUsername: string) {
  try {
    const admin = createAdminClient();
    let teacherUuid = teacherIdOrUsername;
    if (teacherIdOrUsername && !teacherIdOrUsername.includes("-")) {
      const { data: prof } = await admin
        .from("profiles")
        .select("id")
        .eq("username", teacherIdOrUsername)
        .maybeSingle();
      if (prof?.id) teacherUuid = prof.id;
    }

    if (!teacherUuid) return [];

    const { data, error } = await admin
      .from("class_subjects")
      .select(`
        id,
        section_id,
        semester_id,
        subjects (
          id,
          name,
          code,
          description,
          icon_name,
          subject_type
        ),
        sections (
          id,
          name,
          grade_levels ( name )
        ),
        semesters (
          id,
          name
        )
      `)
      .eq("teacher_id", teacherUuid);

    if (error || !data) return [];

    const enriched = await Promise.all(
      data.map(async (item: any) => {
        // Real count of enrolled students in this section
        const { count: studentCount } = await admin
          .from("enrollments")
          .select("id", { count: "exact", head: true })
          .eq("section_id", item.section_id)
          .eq("status", "active");

        // Real count of published lessons for this class_subject
        const { count: lessonCount } = await admin
          .from("lessons")
          .select("id", { count: "exact", head: true })
          .eq("class_subject_id", item.id);

        return {
          id: item.id,
          section_id: item.section_id,
          semester_id: item.semester_id,
          semester_name: item.semesters?.name || "الفصل الدراسي",
          name: item.subjects?.name || "مقرر دراسي",
          code: item.subjects?.code || "SUB-001",
          section: item.sections?.name || "الشعبة العامة",
          grade: item.sections?.grade_levels?.name || "المرحلة الثانوية",
          description: item.subjects?.description || "",
          subject_type: item.subjects?.subject_type || "theory",
          lessons_count: lessonCount || 0,
          students_count: studentCount || 0,
        };
      })
    );

    return enriched;
  } catch (err) {
    console.error("Error in getTeacherCoursesFromDB:", err);
    return [];
  }
}

/**
 * Get real-time dashboard statistics for a teacher from Supabase
 */
export async function getTeacherDashboardStatsFromDB(teacherIdOrUsername: string) {
  try {
    const admin = createAdminClient();
    let teacherUuid = teacherIdOrUsername;
    if (teacherIdOrUsername && !teacherIdOrUsername.includes("-")) {
      const { data: prof } = await admin
        .from("profiles")
        .select("id")
        .eq("username", teacherIdOrUsername)
        .maybeSingle();
      if (prof?.id) teacherUuid = prof.id;
    }

    if (!teacherUuid) {
      return {
        assigned_subjects_count: 0,
        total_students_count: 0,
        published_lessons_count: 0,
        pending_submissions_count: 0,
      };
    }

    // 1. Get class_subjects for this teacher
    const { data: csList } = await admin
      .from("class_subjects")
      .select("id, section_id, semester_id")
      .eq("teacher_id", teacherUuid);

    if (!csList || csList.length === 0) {
      return {
        assigned_subjects_count: 0,
        total_students_count: 0,
        published_lessons_count: 0,
        pending_submissions_count: 0,
      };
    }

    const csIds = csList.map((c) => c.id);
    const uniqueSectionIds = Array.from(new Set(csList.map((c) => c.section_id)));

    // 2. Count distinct students enrolled in these sections
    const { count: studentCount } = await admin
      .from("enrollments")
      .select("student_id", { count: "exact", head: true })
      .in("section_id", uniqueSectionIds)
      .eq("status", "active");

    // 3. Count published lessons across these class_subjects
    const { count: lessonCount } = await admin
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .in("class_subject_id", csIds)
      .eq("status", "published");

    // 4. Count pending submissions for assignments in these class_subjects
    const { data: assignments } = await admin
      .from("assignments")
      .select("id")
      .in("class_subject_id", csIds);

    let pendingSubsCount = 0;
    if (assignments && assignments.length > 0) {
      const aIds = assignments.map((a) => a.id);
      const { count: subCount } = await admin
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .in("assignment_id", aIds)
        .in("status", ["submitted", "late"]);
      pendingSubsCount = subCount || 0;
    }

    return {
      assigned_subjects_count: csList.length,
      total_students_count: studentCount || 0,
      published_lessons_count: lessonCount || 0,
      pending_submissions_count: pendingSubsCount,
    };
  } catch (err) {
    console.error("Error in getTeacherDashboardStatsFromDB:", err);
    return {
      assigned_subjects_count: 0,
      total_students_count: 0,
      published_lessons_count: 0,
      pending_submissions_count: 0,
    };
  }
}

/**
 * Get courses for a student based strictly on their enrolled section
 */
export async function getStudentCoursesFromDB(studentIdOrUsername: string) {
  try {
    const admin = createAdminClient();
    let studentUuid = studentIdOrUsername;
    if (studentIdOrUsername && !studentIdOrUsername.includes("-")) {
      const { data: prof } = await admin
        .from("profiles")
        .select("id")
        .eq("username", studentIdOrUsername)
        .maybeSingle();
      if (prof?.id) studentUuid = prof.id;
    }

    if (!studentUuid) return [];

    // Find student's active enrollment
    const { data: enrollment } = await admin
      .from("enrollments")
      .select("section_id, semester_id, sections(name, grade_levels(name))")
      .eq("student_id", studentUuid)
      .eq("status", "active")
      .maybeSingle();

    const targetSectionId = enrollment?.section_id;
    // Strict isolation: if student is not enrolled in a section, return empty array!
    if (!targetSectionId) return [];

    let csQuery = admin
      .from("class_subjects")
      .select(`
        id,
        section_id,
        semester_id,
        subjects (
          id,
          name,
          code,
          description,
          icon_name,
          subject_type
        ),
        profiles (
          full_name
        ),
        sections (
          name,
          grade_levels ( name )
        )
      `)
      .eq("section_id", targetSectionId);

    if (enrollment.semester_id) {
      csQuery = csQuery.eq("semester_id", enrollment.semester_id);
    }

    const { data, error } = await csQuery;
    if (error || !data) return [];

    const results = await Promise.all(
      data.map(async (item: any) => {
        const { count: lessonCount } = await admin
          .from("lessons")
          .select("id", { count: "exact", head: true })
          .eq("class_subject_id", item.id)
          .eq("status", "published");

        return {
          id: item.id,
          name: item.subjects?.name || "مقرر دراسي",
          code: item.subjects?.code || "SUB-001",
          teacher_name: item.profiles?.full_name || "مدرس المادة",
          grade: item.sections?.grade_levels?.name || "الثانوية",
          section: item.sections?.name || "الشعبة العامة",
          description: item.subjects?.description || "",
          subject_type: item.subjects?.subject_type || "theory",
          lessons_count: lessonCount || 0,
        };
      })
    );

    return results;
  } catch (err) {
    console.error("Error in getStudentCoursesFromDB:", err);
    return [];
  }
}

/**
 * Get single course (class_subject) details with subject and section info
 */
export async function getCourseDetailsFromDB(classSubjectId: string) {
  try {
    const admin = createAdminClient();
    const { data: item, error } = await admin
      .from("class_subjects")
      .select(`
        id,
        section_id,
        semester_id,
        semesters ( name ),
        subjects (
          id,
          name,
          code,
          description,
          icon_name,
          subject_type
        ),
        profiles (
          id,
          full_name,
          username
        ),
        sections (
          id,
          name,
          grade_levels ( name )
        )
      `)
      .eq("id", classSubjectId)
      .maybeSingle();

    if (error || !item) return null;

    const { count: lessonCount } = await admin
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("class_subject_id", item.id)
      .eq("status", "published");

    const { count: assignmentCount } = await admin
      .from("assignments")
      .select("id", { count: "exact", head: true })
      .eq("class_subject_id", item.id);

    return {
      id: item.id,
      name: (item.subjects as any)?.name || "مقرر دراسي",
      code: (item.subjects as any)?.code || "SUB-001",
      teacher_name: (item.profiles as any)?.full_name || "مدرس المادة",
      grade: (item.sections as any)?.grade_levels?.name || "المرحلة الثانوية",
      section: (item.sections as any)?.name || "الشعبة الدراسية",
      semester_name: (item.semesters as any)?.name || "الفصل الدراسي الحالي",
      description: (item.subjects as any)?.description || "",
      subject_type: (item.subjects as any)?.subject_type || "theory",
      lessons_count: lessonCount || 0,
      assignments_count: assignmentCount || 0,
    };
  } catch (err) {
    console.error("Error in getCourseDetailsFromDB:", err);
    return null;
  }
}
