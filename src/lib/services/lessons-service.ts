"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface LessonMaterialInput {
  title: string;
  material_type: "pdf" | "document" | "presentation" | "video_link" | "external_url" | "image";
  file_path?: string;
  file_size_bytes?: number;
  external_url?: string;
}

export interface CreateLessonInput {
  class_subject_id: string;
  lesson_number?: number;
  title: string;
  description?: string;
  objectives?: string;
  content_html?: string;
  status?: "draft" | "published";
  materials?: LessonMaterialInput[];
}

/**
 * Fetch all lessons for a specific course (class_subject)
 */
export async function getLessonsForCourseFromDB(classSubjectId: string) {
  try {
    const admin = createAdminClient();
    const { data: lessons, error } = await admin
      .from("lessons")
      .select(`
        id,
        lesson_number,
        title,
        description,
        objectives,
        content_html,
        status,
        published_at,
        created_at,
        lesson_materials (
          id,
          title,
          material_type,
          file_path,
          file_size_bytes,
          external_url
        )
      `)
      .eq("class_subject_id", classSubjectId)
      .order("lesson_number", { ascending: true });

    if (error || !lessons) return [];

    return lessons.map((l: any) => {
      const mappedMaterials = (l.lesson_materials || []).map((m: any) => {
        let fileUrl = m.external_url || null;
        if (m.file_path) {
          fileUrl = m.file_path.startsWith("http")
            ? m.file_path
            : admin.storage.from("course-materials").getPublicUrl(m.file_path).data.publicUrl;
        }
        return {
          ...m,
          file_url: fileUrl,
        };
      });

      return {
        id: l.id,
        lesson_number: l.lesson_number || 1,
        title: l.title,
        description: l.description || "",
        objectives: l.objectives || "",
        content_html: l.content_html || "",
        status: l.status || "published",
        published_at: l.published_at || l.created_at,
        materials: mappedMaterials,
        materials_count: mappedMaterials.length,
        sessions_count: 1,
        assignments_count: 1,
        questions_count: 0,
      };
    });
  } catch (err) {
    console.error("Error fetching course lessons:", err);
    return [];
  }
}

/**
 * Get single lesson with full materials and student progress
 */
export async function getLessonDetailsFromDB(lessonId: string, studentId?: string) {
  try {
    const admin = createAdminClient();
    const { data: lesson, error } = await admin
      .from("lessons")
      .select(`
        id,
        class_subject_id,
        lesson_number,
        title,
        description,
        objectives,
        content_html,
        status,
        published_at,
        class_subjects (
          subjects ( name, code ),
          sections ( name, grade_levels ( name ) )
        ),
        lesson_materials (
          id,
          title,
          material_type,
          file_path,
          file_size_bytes,
          external_url
        )
      `)
      .eq("id", lessonId)
      .maybeSingle();

    if (error || !lesson) return null;

    let isCompleted = false;
    if (studentId) {
      const { data: prog } = await admin
        .from("lesson_progress")
        .select("is_completed")
        .eq("lesson_id", lessonId)
        .eq("student_id", studentId)
        .maybeSingle();
      if (prog?.is_completed) isCompleted = true;
    }

    const mappedMaterials = (lesson.lesson_materials || []).map((m: any) => {
      let fileUrl = m.external_url || null;
      if (m.file_path) {
        fileUrl = m.file_path.startsWith("http")
          ? m.file_path
          : admin.storage.from("course-materials").getPublicUrl(m.file_path).data.publicUrl;
      }
      return {
        ...m,
        file_url: fileUrl,
      };
    });

    return {
      id: lesson.id,
      class_subject_id: lesson.class_subject_id,
      course_name: (lesson as any).class_subjects?.subjects?.name || "المقرر",
      course_code: (lesson as any).class_subjects?.subjects?.code || "SUB",
      grade: (lesson as any).class_subjects?.sections?.grade_levels?.name || "المرحلة الثانوية",
      lesson_number: lesson.lesson_number || 1,
      title: lesson.title,
      description: lesson.description || "",
      objectives: lesson.objectives || "",
      content_html: lesson.content_html || "",
      status: lesson.status,
      materials: mappedMaterials,
      is_completed: isCompleted,
    };
  } catch (err) {
    console.error("Error fetching lesson details:", err);
    return null;
  }
}

/**
 * Get next available lesson number for a course
 */
export async function getNextLessonNumberFromDB(classSubjectId: string): Promise<number> {
  try {
    const admin = createAdminClient();
    const { data: maxRow } = await admin
      .from("lessons")
      .select("lesson_number")
      .eq("class_subject_id", classSubjectId)
      .order("lesson_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    return (maxRow?.lesson_number || 0) + 1;
  } catch {
    return 1;
  }
}

/**
 * Create a new lesson and its materials in Supabase
 */
export async function createLessonInDB(input: CreateLessonInput): Promise<{
  success: boolean;
  lessonId?: string;
  error?: string;
}> {
  try {
    const admin = createAdminClient();

    // 1. Determine next lesson number safely to prevent collision on UNIQUE(class_subject_id, lesson_number)
    let lessonNum = input.lesson_number;
    const { data: maxRow } = await admin
      .from("lessons")
      .select("lesson_number")
      .eq("class_subject_id", input.class_subject_id)
      .order("lesson_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const maxExisting = maxRow?.lesson_number || 0;
    if (!lessonNum || lessonNum <= maxExisting) {
      lessonNum = maxExisting + 1;
    }

    // 2. Insert lesson
    const { data: lesson, error: lessonErr } = await admin
      .from("lessons")
      .insert({
        class_subject_id: input.class_subject_id,
        lesson_number: lessonNum,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        objectives: input.objectives?.trim() || null,
        content_html: input.content_html || null,
        status: input.status || "published",
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (lessonErr || !lesson) {
      return { success: false, error: lessonErr?.message || "فشل إنشاء الدرس في قاعدة البيانات." };
    }

    // 3. Insert materials if provided
    if (input.materials && input.materials.length > 0) {
      const materialsPayload = input.materials.map((m) => ({
        lesson_id: lesson.id,
        title: m.title.trim(),
        material_type: m.material_type,
        file_path: m.file_path || null,
        file_size_bytes: m.file_size_bytes || 1024 * 1024,
        external_url: m.external_url || null,
      }));

      await admin.from("lesson_materials").insert(materialsPayload);
    }

    revalidatePath(`/teacher/courses/${input.class_subject_id}/lessons`);
    revalidatePath(`/student/courses/${input.class_subject_id}`);

    return { success: true, lessonId: lesson.id };
  } catch (err: any) {
    console.error("Error creating lesson:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete a lesson from Supabase
 */
export async function deleteLessonFromDB(lessonId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("lessons").delete().eq("id", lessonId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
