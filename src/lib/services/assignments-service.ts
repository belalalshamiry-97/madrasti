"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface CreateAssignmentInput {
  class_subject_id: string;
  lesson_id?: string;
  title: string;
  instructions: string;
  assignment_type?: "assignment" | "activity";
  max_score?: number;
  open_date?: string;
  due_date: string;
  max_attempts?: number;
  allow_late_submissions?: boolean;
  allow_resubmissions?: boolean;
  attachments?: { name: string; file_path: string; file_size_bytes?: number; file_type?: string }[];
}

export interface SubmitAssignmentInput {
  assignment_id: string;
  student_id: string;
  answer_text: string;
  status?: "submitted" | "draft" | "late";
  files?: { name: string; url: string; size: number }[];
}

export interface GradeSubmissionInput {
  submission_id: string;
  grader_id: string;
  score: number;
  feedback_notes?: string;
}

/**
 * Create a new assignment in Supabase
 */
export async function createAssignmentInDB(input: CreateAssignmentInput): Promise<{
  success: boolean;
  assignmentId?: string;
  error?: string;
}> {
  try {
    const admin = createAdminClient();

    // Verify or find fallback class_subject if needed
    let classSubjectId = input.class_subject_id;
    if (!classSubjectId) {
      const { data: firstCS } = await admin.from("class_subjects").select("id").limit(1).maybeSingle();
      if (firstCS) classSubjectId = firstCS.id;
    }

    const { data: assignment, error: aErr } = await admin
      .from("assignments")
      .insert({
        class_subject_id: classSubjectId,
        lesson_id: input.lesson_id || null,
        title: input.title.trim(),
        instructions: input.instructions.trim(),
        assignment_type: input.assignment_type || "assignment",
        max_score: input.max_score || 10,
        open_date: input.open_date || new Date().toISOString(),
        due_date: input.due_date || new Date(Date.now() + 7 * 86400000).toISOString(),
        max_attempts: input.max_attempts || 1,
        allow_late_submissions: input.allow_late_submissions ?? true,
        allow_resubmissions: input.allow_resubmissions ?? true,
      })
      .select("id")
      .single();

    if (aErr || !assignment) {
      console.error("Error creating assignment in DB:", aErr);
      return { success: false, error: aErr?.message || "فشل إنشاء التكليف في قاعدة البيانات." };
    }

    if (input.attachments && input.attachments.length > 0) {
      const attachPayload = input.attachments.map((a) => ({
        assignment_id: assignment.id,
        file_name: a.name,
        file_path: a.file_path,
        file_size_bytes: a.file_size_bytes || 1024 * 1024,
        file_type: a.file_type || "document",
      }));
      await admin.from("assignment_attachments").insert(attachPayload);
    }

    revalidatePath("/student/assignments");
    revalidatePath("/teacher/grading");

    return { success: true, assignmentId: assignment.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get assignments available to a student
 */
export async function getAssignmentsForStudentFromDB(studentIdOrUsername: string) {
  try {
    const admin = createAdminClient();

    let studentUuid = studentIdOrUsername;
    if (studentIdOrUsername && !studentIdOrUsername.includes("-")) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", studentIdOrUsername).maybeSingle();
      if (p?.id) studentUuid = p.id;
    }

    if (!studentUuid) return [];

    // Find student's active enrollment
    const { data: enrollment } = await admin
      .from("enrollments")
      .select("section_id, semester_id")
      .eq("student_id", studentUuid)
      .eq("status", "active")
      .maybeSingle();

    if (!enrollment?.section_id) {
      // Student has no active section enrollment
      return [];
    }

    let csQuery = admin
      .from("class_subjects")
      .select("id")
      .eq("section_id", enrollment.section_id);

    if (enrollment.semester_id) {
      csQuery = csQuery.eq("semester_id", enrollment.semester_id);
    }

    const { data: allowedCS } = await csQuery;
    if (!allowedCS || allowedCS.length === 0) return [];

    const allowedCsIds = allowedCS.map((c) => c.id);

    // 1. Fetch assignments strictly for this student's section
    const { data: assignments, error } = await admin
      .from("assignments")
      .select(`
        id,
        title,
        instructions,
        assignment_type,
        max_score,
        open_date,
        due_date,
        class_subjects (
          id,
          subjects ( name, code ),
          sections ( name, grade_levels ( name ) )
        )
      `)
      .in("class_subject_id", allowedCsIds)
      .order("created_at", { ascending: false });

    if (error || !assignments) return [];

    // 2. Fetch existing submissions for this student
    let studentSubmissions: any[] = [];
    if (studentUuid) {
      const { data: subs } = await admin
        .from("submissions")
        .select(`
          id,
          assignment_id,
          status,
          submitted_at,
          submission_feedback (
            score,
            feedback_notes
          )
        `)
        .eq("student_id", studentUuid);

      if (subs) studentSubmissions = subs;
    }

    const now = new Date();

    return assignments.map((a: any) => {
      const sub = studentSubmissions.find((s) => s.assignment_id === a.id);
      const isPastDue = new Date(a.due_date) < now;
      let displayStatus = "pending";

      if (sub) {
        displayStatus = sub.status; // 'submitted', 'graded', etc.
      } else if (isPastDue) {
        displayStatus = "late";
      }

      const feedback = sub?.submission_feedback && sub.submission_feedback[0];

      return {
        id: a.id,
        title: a.title,
        instructions: a.instructions,
        course_name: a.class_subjects?.subjects?.name || "المقرر الدراسي",
        grade: a.class_subjects?.sections?.grade_levels?.name || "المرحلة الثانوية",
        due_date: new Date(a.due_date).toLocaleDateString("ar-YE", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        max_score: Number(a.max_score) || 10,
        status: displayStatus,
        submission_id: sub?.id || null,
        score: feedback?.score ?? null,
      };
    });
  } catch (err) {
    console.error("Error in getAssignmentsForStudentFromDB:", err);
    return [];
  }
}

/**
 * Get detailed assignment information for submission view
 */
export async function getAssignmentByIdFromDB(assignmentId: string, studentIdOrUsername?: string) {
  try {
    const admin = createAdminClient();

    const { data: a, error } = await admin
      .from("assignments")
      .select(`
        id,
        title,
        instructions,
        assignment_type,
        max_score,
        open_date,
        due_date,
        allow_late_submissions,
        allow_resubmissions,
        class_subjects (
          id,
          subjects ( name, code ),
          sections ( name, grade_levels ( name ) ),
          profiles:teacher_id ( full_name )
        ),
        assignment_attachments (
          id,
          file_name,
          file_path,
          file_size_bytes,
          file_type
        )
      `)
      .eq("id", assignmentId)
      .maybeSingle();

    if (error || !a) return null;

    let studentSubmission = null;
    if (studentIdOrUsername) {
      let studentUuid = studentIdOrUsername;
      if (!studentIdOrUsername.includes("-")) {
        const { data: p } = await admin.from("profiles").select("id").eq("username", studentIdOrUsername).maybeSingle();
        if (p?.id) studentUuid = p.id;
      }

      const { data: sub } = await admin
        .from("submissions")
        .select(`
          id,
          attempt_number,
          answer_text,
          status,
          submitted_at,
          submission_files (
            file_name,
            file_path,
            file_size_bytes
          ),
          submission_feedback (
            score,
            feedback_notes,
            graded_at,
            profiles:grader_id ( full_name )
          )
        `)
        .eq("assignment_id", assignmentId)
        .eq("student_id", studentUuid)
        .maybeSingle();

      if (sub) {
        const feedback = sub.submission_feedback && sub.submission_feedback[0];
        studentSubmission = {
          id: sub.id,
          attempt_number: sub.attempt_number,
          answer_text: sub.answer_text,
          status: sub.status,
          submitted_at: sub.submitted_at,
          score: feedback?.score ?? null,
          feedback_notes: feedback?.feedback_notes ?? null,
          graded_at: feedback?.graded_at ?? null,
          grader_name: (feedback as any)?.profiles?.full_name || "المعلم المصحح",
          files: (sub.submission_files || []).map((f: any) => ({
            name: f.file_name,
            url: f.file_path,
            size: f.file_size_bytes || 0,
          })),
        };
      }
    }

    return {
      id: a.id,
      title: a.title,
      instructions: a.instructions,
      course_name: (a.class_subjects as any)?.subjects?.name || "المقرر",
      teacher_name: (a.class_subjects as any)?.profiles?.full_name || "م. بلال الشميري",
      grade: (a.class_subjects as any)?.sections?.grade_levels?.name || "المرحلة الثانوية",
      due_date: new Date(a.due_date).toLocaleDateString("ar-YE", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      max_score: Number(a.max_score) || 10,
      allow_late_submissions: a.allow_late_submissions,
      allow_resubmissions: a.allow_resubmissions,
      attachments: a.assignment_attachments || [],
      student_submission: studentSubmission,
    };
  } catch (err) {
    console.error("Error in getAssignmentByIdFromDB:", err);
    return null;
  }
}

/**
 * Submit an assignment solution by a student
 */
export async function submitAssignmentInDB(input: SubmitAssignmentInput): Promise<{
  success: boolean;
  submissionId?: string;
  error?: string;
}> {
  try {
    const admin = createAdminClient();

    let studentUuid = input.student_id;
    if (!studentUuid.includes("-")) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", input.student_id).maybeSingle();
      if (p?.id) studentUuid = p.id;
    }

    // Check if submission already exists for (assignment_id, student_id)
    const { data: existing } = await admin
      .from("submissions")
      .select("id, attempt_number")
      .eq("assignment_id", input.assignment_id)
      .eq("student_id", studentUuid)
      .maybeSingle();

    let submissionId = existing?.id;
    const nowIso = new Date().toISOString();

    if (existing) {
      // Update existing
      const { error: updErr } = await admin
        .from("submissions")
        .update({
          answer_text: input.answer_text.trim(),
          status: input.status || "submitted",
          submitted_at: nowIso,
          updated_at: nowIso,
          attempt_number: (existing.attempt_number || 1) + 1,
        })
        .eq("id", existing.id);

      if (updErr) return { success: false, error: updErr.message };
    } else {
      // Insert new
      const { data: created, error: insErr } = await admin
        .from("submissions")
        .insert({
          assignment_id: input.assignment_id,
          student_id: studentUuid,
          answer_text: input.answer_text.trim(),
          status: input.status || "submitted",
          submitted_at: nowIso,
          attempt_number: 1,
        })
        .select("id")
        .single();

      if (insErr || !created) {
        return { success: false, error: insErr?.message || "فشل تسليم الحل." };
      }
      submissionId = created.id;
    }

    // Insert new files if any
    if (submissionId && input.files && input.files.length > 0) {
      const filesPayload = input.files.map((f) => ({
        submission_id: submissionId,
        file_name: f.name,
        file_path: f.url || `submissions/${f.name}`,
        file_size_bytes: f.size || 512000,
        file_type: f.name.endsWith(".pdf") ? "pdf" : "image",
      }));
      await admin.from("submission_files").insert(filesPayload);
    }

    revalidatePath("/student/assignments");
    revalidatePath("/student/grades");
    revalidatePath("/teacher/grading");

    return { success: true, submissionId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Grade a student submission and save feedback in Supabase
 */
export async function gradeSubmissionInDB(input: GradeSubmissionInput): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const admin = createAdminClient();

    let graderUuid = input.grader_id;
    if (!graderUuid.includes("-")) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", input.grader_id).maybeSingle();
      if (p?.id) graderUuid = p.id;
    }

    // 1. Insert or update submission_feedback (using feedback_notes column)
    const { error: feedErr } = await admin.from("submission_feedback").upsert(
      {
        submission_id: input.submission_id,
        grader_id: graderUuid,
        score: input.score,
        feedback_notes: input.feedback_notes?.trim() || "تم اعتماد وتقييم الواجب بنجاح.",
        graded_at: new Date().toISOString(),
      },
      { onConflict: "submission_id" }
    );

    if (feedErr) {
      return { success: false, error: feedErr.message };
    }

    // 2. Update submission status to 'graded'
    await admin
      .from("submissions")
      .update({ status: "graded", updated_at: new Date().toISOString() })
      .eq("id", input.submission_id);

    revalidatePath("/teacher/grading");
    revalidatePath("/student/grades");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get submissions for teacher's assigned subjects
 */
export async function getTeacherSubmissionsFromDB(teacherIdOrUsername: string) {
  try {
    const admin = createAdminClient();

    let teacherUuid = teacherIdOrUsername;
    if (teacherIdOrUsername && !teacherIdOrUsername.includes("-")) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", teacherIdOrUsername).maybeSingle();
      if (p?.id) teacherUuid = p.id;
    }

    // Find class_subjects for this teacher
    let csQuery = admin.from("class_subjects").select("id, subjects(name), sections(name, grade_levels(name))");
    if (teacherUuid) {
      csQuery = csQuery.eq("teacher_id", teacherUuid);
    }
    const { data: classSubjects } = await csQuery;

    if (!classSubjects || classSubjects.length === 0) return [];

    const csIds = classSubjects.map((cs) => cs.id);

    // Find assignments
    const { data: assignments } = await admin
      .from("assignments")
      .select("id, title, max_score, class_subject_id")
      .in("class_subject_id", csIds);

    if (!assignments || assignments.length === 0) return [];

    const assignIds = assignments.map((a) => a.id);

    // Find submissions
    const { data: submissions, error } = await admin
      .from("submissions")
      .select(`
        id,
        assignment_id,
        student_id,
        status,
        submitted_at,
        answer_text,
        attempt_number,
        profiles (
          full_name,
          username
        ),
        submission_files (
          file_name,
          file_size_bytes,
          file_path
        ),
        submission_feedback (
          score,
          feedback_notes,
          graded_at
        )
      `)
      .in("assignment_id", assignIds)
      .order("submitted_at", { ascending: false });

    if (error || !submissions) return [];

    return submissions.map((sub: any) => {
      const parentAssign = assignments.find((a) => a.id === sub.assignment_id);
      const parentCS = classSubjects.find((cs) => cs.id === parentAssign?.class_subject_id);
      const feedback = sub.submission_feedback && sub.submission_feedback[0];

      return {
        id: sub.id,
        assignment_id: sub.assignment_id,
        assignment_title: parentAssign?.title || "تكليف دراسي",
        course_name: (parentCS as any)?.subjects?.name || "المقرر",
        grade: (parentCS as any)?.sections?.grade_levels?.name || "المرحلة الثانوية",
        student_id: sub.student_id,
        student_name: sub.profiles?.full_name || "طالب",
        student_username: sub.profiles?.username || "student",
        status: sub.status,
        submitted_at: sub.submitted_at
          ? new Date(sub.submitted_at).toLocaleString("ar-YE", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "غير محدد",
        answer_text: sub.answer_text,
        attempt_number: sub.attempt_number || 1,
        max_score: Number(parentAssign?.max_score) || 10,
        score: feedback?.score !== undefined && feedback?.score !== null ? Number(feedback.score) : null,
        feedback_notes: feedback?.feedback_notes ?? null,
        graded_at: feedback?.graded_at ?? null,
        files: (sub.submission_files || []).map((f: any) => ({
          name: f.file_name,
          size: f.file_size_bytes || 0,
          url: f.file_path,
        })),
      };
    });
  } catch (err) {
    console.error("Error in getTeacherSubmissionsFromDB:", err);
    return [];
  }
}

/**
 * Get grades of a student from Supabase
 */
export async function getStudentGradesFromDB(studentIdOrUsername: string) {
  try {
    const admin = createAdminClient();

    let studentUuid = studentIdOrUsername;
    if (!studentIdOrUsername.includes("-")) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", studentIdOrUsername).maybeSingle();
      if (p?.id) studentUuid = p.id;
    }

    const { data: submissions, error } = await admin
      .from("submissions")
      .select(`
        id,
        submitted_at,
        assignments (
          title,
          max_score,
          class_subjects (
            subjects ( name )
          )
        ),
        submission_feedback (
          score,
          feedback_notes,
          graded_at,
          profiles:grader_id ( full_name )
        )
      `)
      .eq("student_id", studentUuid)
      .eq("status", "graded");

    if (error || !submissions) return [];

    return submissions.map((s: any) => {
      const feedback = s.submission_feedback && s.submission_feedback[0];
      const assign = s.assignments;
      const subjectName = assign?.class_subjects?.subjects?.name || "المادة";

      return {
        id: s.id,
        course_name: subjectName,
        assignment_title: assign?.title || "تكليف",
        score: feedback?.score !== undefined ? Number(feedback.score) : 0,
        max_score: Number(assign?.max_score) || 10,
        feedback_notes: feedback?.feedback_notes || "تم اعتماد الدرجة.",
        graded_at: feedback?.graded_at
          ? new Date(feedback.graded_at).toLocaleDateString("ar-YE", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : s.submitted_at,
        teacher_name: (feedback as any)?.profiles?.full_name || "المعلم",
      };
    });
  } catch (err) {
    console.error("Error in getStudentGradesFromDB:", err);
    return [];
  }
}

