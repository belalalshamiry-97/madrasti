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

/**
 * Add a new Subject to Supabase
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
 * Assign Teacher to a Subject & Section in Supabase
 */
export async function assignTeacherToSubjectAction(
  sectionId: string,
  subjectId: string,
  teacherId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    // Get active semester
    const { data: sem } = await admin
      .from("semesters")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    const semesterId = sem?.id || "20000000-0000-0000-0000-000000000001";

    // Upsert class_subjects
    const { error } = await admin.from("class_subjects").upsert({
      section_id: sectionId,
      subject_id: subjectId,
      teacher_id: teacherId,
      semester_id: semesterId,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/subjects");
    revalidatePath("/teacher/courses");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get courses assigned to a specific teacher from Supabase
 */
export async function getTeacherCoursesFromDB(teacherIdOrUsername: string) {
  try {
    const admin = createAdminClient();
    // Resolve teacher UUID if username was passed
    let teacherUuid = teacherIdOrUsername;
    if (!teacherIdOrUsername.includes("-")) {
      const { data: prof } = await admin
        .from("profiles")
        .select("id")
        .eq("username", teacherIdOrUsername)
        .maybeSingle();
      if (prof?.id) teacherUuid = prof.id;
    }

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
        lessons ( count )
      `)
      .eq("teacher_id", teacherUuid);

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      name: item.subjects?.name || "مقرر دراسي",
      code: item.subjects?.code || "SUB-001",
      section: item.sections?.name || "الشعبة العامة",
      grade: item.sections?.grade_levels?.name || "المرحلة الثانوية",
      description: item.subjects?.description || "",
      subject_type: item.subjects?.subject_type || "theory",
      lessons_count: item.lessons ? item.lessons[0]?.count || 0 : 0,
      students_count: 28,
    }));
  } catch (err) {
    console.error("Error in getTeacherCoursesFromDB:", err);
    return [];
  }
}

/**
 * Get courses for a student based on their enrolled section
 */
export async function getStudentCoursesFromDB(studentIdOrUsername: string) {
  try {
    const admin = createAdminClient();
    // Resolve student UUID if username was passed
    let studentUuid = studentIdOrUsername;
    if (!studentIdOrUsername.includes("-")) {
      const { data: prof } = await admin
        .from("profiles")
        .select("id")
        .eq("username", studentIdOrUsername)
        .maybeSingle();
      if (prof?.id) studentUuid = prof.id;
    }

    // Find student's enrollment
    const { data: enrollment } = await admin
      .from("enrollments")
      .select("section_id, semester_id, sections(name, grade_levels(name))")
      .eq("student_id", studentUuid)
      .maybeSingle();

    let targetSectionId = enrollment?.section_id;

    // Fallback: If no enrollment record, get first section of grade
    if (!targetSectionId) {
      const { data: firstSec } = await admin.from("sections").select("id").limit(1).maybeSingle();
      targetSectionId = firstSec?.id;
    }

    if (!targetSectionId) return [];

    const { data, error } = await admin
      .from("class_subjects")
      .select(`
        id,
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
        ),
        lessons ( count )
      `)
      .eq("section_id", targetSectionId);

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      name: item.subjects?.name || "مقرر دراسي",
      code: item.subjects?.code || "SUB-001",
      teacher_name: item.profiles?.full_name || "مدرس المادة",
      grade: item.sections?.grade_levels?.name || "الثانوية",
      section: item.sections?.name || "الشعبة العامة",
      description: item.subjects?.description || "",
      subject_type: item.subjects?.subject_type || "theory",
      lessons_count: item.lessons ? item.lessons[0]?.count || 0 : 0,
    }));
  } catch (err) {
    console.error("Error in getStudentCoursesFromDB:", err);
    return [];
  }
}
