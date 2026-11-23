"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface CreateQuizInput {
  class_subject_id: string;
  title: string;
  description: string;
  duration_minutes: number;
  start_time?: string;
  end_time?: string;
  max_attempts?: number;
  questions: {
    question_text: string;
    question_type: "mcq" | "true_false";
    points: number;
    options: string[];
    correct_index: number;
  }[];
}

/**
 * Create a new quiz with its questions and choices in Supabase
 */
export async function createQuizInDB(input: CreateQuizInput): Promise<{
  success: boolean;
  quizId?: string;
  error?: string;
}> {
  try {
    const admin = createAdminClient();

    let classSubjectId = input.class_subject_id;
    if (!classSubjectId) {
      const { data: firstCS } = await admin.from("class_subjects").select("id").limit(1).maybeSingle();
      if (firstCS) classSubjectId = firstCS.id;
    }

    const now = new Date();
    const startTime = input.start_time || now.toISOString();
    const endTime = input.end_time || new Date(now.getTime() + 14 * 86400000).toISOString();

    // 1. Insert quiz
    const { data: quiz, error: qErr } = await admin
      .from("quizzes")
      .insert({
        class_subject_id: classSubjectId,
        title: input.title.trim(),
        description: input.description.trim(),
        duration_minutes: input.duration_minutes || 15,
        start_time: startTime,
        end_time: endTime,
        max_attempts: input.max_attempts || 1,
        show_results_immediately: true,
        is_published: true,
      })
      .select("id")
      .single();

    if (qErr || !quiz) {
      console.error("Error creating quiz:", qErr);
      return { success: false, error: qErr?.message || "فشل إنشاء الاختبار في قاعدة البيانات." };
    }

    // 2. Insert questions & options
    for (let i = 0; i < input.questions.length; i++) {
      const q = input.questions[i];
      const { data: questionRec, error: questionErr } = await admin
        .from("quiz_questions")
        .insert({
          quiz_id: quiz.id,
          question_text: q.question_text.trim(),
          question_type: q.question_type,
          points: q.points || 1,
          order_index: i + 1,
        })
        .select("id")
        .single();

      if (questionErr || !questionRec) {
        console.error("Error inserting quiz question:", questionErr);
        continue;
      }

      // Insert options
      const optionsPayload = q.options.map((optText, optIdx) => ({
        question_id: questionRec.id,
        option_text: optText.trim(),
        is_correct: optIdx === q.correct_index,
        order_index: optIdx + 1,
      }));

      await admin.from("quiz_options").insert(optionsPayload);
    }

    revalidatePath("/student/quizzes");
    return { success: true, quizId: quiz.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Get available quizzes for student with attempt status
 */
export async function getQuizzesForStudentFromDB(studentIdOrUsername?: string) {
  try {
    const admin = createAdminClient();

    let studentUuid = studentIdOrUsername;
    if (studentIdOrUsername && !studentIdOrUsername.includes("-")) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", studentIdOrUsername).maybeSingle();
      if (p?.id) studentUuid = p.id;
    }

    // 1. Fetch quizzes with subject and class details
    const { data: quizzes, error } = await admin
      .from("quizzes")
      .select(`
        id,
        title,
        description,
        duration_minutes,
        start_time,
        end_time,
        is_published,
        class_subjects (
          id,
          subjects ( name, code ),
          sections ( name, grade_levels ( name ) )
        ),
        quiz_questions (
          id,
          points
        )
      `)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error || !quizzes) return [];

    // 2. Fetch student attempts
    let myAttempts: any[] = [];
    if (studentUuid) {
      const { data: attempts } = await admin
        .from("quiz_attempts")
        .select("quiz_id, total_score, status, end_time")
        .eq("student_id", studentUuid);

      if (attempts) myAttempts = attempts;
    }

    return quizzes.map((q: any) => {
      const questions = q.quiz_questions || [];
      const totalScore = questions.reduce((sum: number, cur: any) => sum + (Number(cur.points) || 0), 0);
      const attempt = myAttempts.find((att) => att.quiz_id === q.id);

      return {
        id: q.id,
        title: q.title,
        description: q.description || "",
        course_name: q.class_subjects?.subjects?.name || "المقرر الدراسي",
        grade: q.class_subjects?.sections?.grade_levels?.name || "المرحلة الثانوية",
        duration_minutes: q.duration_minutes || 15,
        total_score: totalScore || 10,
        passing_score: Math.round((totalScore || 10) * 0.5),
        questions_count: questions.length,
        due_date: new Date(q.end_time).toLocaleDateString("ar-YE", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        is_completed: attempt?.status === "completed",
        my_score: attempt?.total_score ?? null,
      };
    });
  } catch (err) {
    console.error("Error in getQuizzesForStudentFromDB:", err);
    return [];
  }
}

/**
 * Get detailed questions and choices for quiz taking
 */
export async function getQuizDetailsFromDB(quizId: string) {
  try {
    const admin = createAdminClient();

    const { data: quiz, error } = await admin
      .from("quizzes")
      .select(`
        id,
        title,
        description,
        duration_minutes,
        class_subjects (
          subjects ( name )
        ),
        quiz_questions (
          id,
          question_text,
          question_type,
          points,
          order_index,
          quiz_options (
            id,
            option_text,
            is_correct,
            order_index
          )
        )
      `)
      .eq("id", quizId)
      .maybeSingle();

    if (error || !quiz) return null;

    const questions = (quiz.quiz_questions || [])
      .sort((a: any, b: any) => a.order_index - b.order_index)
      .map((q: any) => {
        const sortedOptions = (q.quiz_options || []).sort((a: any, b: any) => a.order_index - b.order_index);
        const correctOpt = sortedOptions.find((opt: any) => opt.is_correct);

        return {
          id: q.id,
          quiz_id: quiz.id,
          question_text: q.question_text,
          question_type: q.question_type,
          points: Number(q.points) || 1,
          order_index: q.order_index,
          options: sortedOptions.map((opt: any) => ({
            id: opt.id,
            text: opt.option_text,
          })),
          correct_answer: correctOpt?.id || (sortedOptions[0]?.id ?? ""),
        };
      });

    const totalScore = questions.reduce((sum: number, q: any) => sum + q.points, 0);

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      course_name: (quiz.class_subjects as any)?.subjects?.name || "المقرر",
      duration_minutes: quiz.duration_minutes || 15,
      total_score: totalScore,
      questions,
    };
  } catch (err) {
    console.error("Error in getQuizDetailsFromDB:", err);
    return null;
  }
}

/**
 * Submit quiz attempt with automatic grading and save into Supabase
 */
export async function submitQuizAttemptInDB(
  quizId: string,
  studentIdOrUsername: string,
  answers: Record<string, string> // question_id -> selected_option_id
): Promise<{
  success: boolean;
  score: number;
  totalScore: number;
  attemptId?: string;
  error?: string;
}> {
  try {
    const admin = createAdminClient();

    let studentUuid = studentIdOrUsername;
    if (!studentIdOrUsername.includes("-")) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", studentIdOrUsername).maybeSingle();
      if (p?.id) studentUuid = p.id;
    }

    // 1. Fetch questions and correct options
    const { data: questions } = await admin
      .from("quiz_questions")
      .select(`
        id,
        points,
        quiz_options (
          id,
          is_correct
        )
      `)
      .eq("quiz_id", quizId);

    if (!questions) {
      return { success: false, score: 0, totalScore: 0, error: "لم يتم العثور على أسئلة الاختبار." };
    }

    let earnedScore = 0;
    let totalScore = 0;
    const answerRecords: any[] = [];

    for (const q of questions) {
      const pts = Number(q.points) || 1;
      totalScore += pts;

      const userSelectedOptId = answers[q.id];
      const correctOpt = q.quiz_options.find((opt: any) => opt.is_correct);
      const isCorrect = userSelectedOptId && correctOpt && userSelectedOptId === correctOpt.id;

      const awarded = isCorrect ? pts : 0;
      earnedScore += awarded;

      answerRecords.push({
        question_id: q.id,
        selected_option_id: userSelectedOptId || null,
        score_awarded: awarded,
      });
    }

    const nowIso = new Date().toISOString();

    // 2. Insert attempt
    const { data: attempt, error: attErr } = await admin
      .from("quiz_attempts")
      .insert({
        quiz_id: quizId,
        student_id: studentUuid,
        total_score: earnedScore,
        status: "completed",
        start_time: nowIso,
        end_time: nowIso,
        attempt_number: 1,
      })
      .select("id")
      .single();

    if (attErr || !attempt) {
      console.error("Error creating quiz attempt:", attErr);
      return { success: false, score: earnedScore, totalScore, error: attErr?.message };
    }

    // 3. Insert quiz answers
    if (answerRecords.length > 0) {
      const answersPayload = answerRecords.map((rec) => ({
        attempt_id: attempt.id,
        question_id: rec.question_id,
        selected_option_id: rec.selected_option_id,
        score_awarded: rec.score_awarded,
      }));
      await admin.from("quiz_answers").insert(answersPayload);
    }

    revalidatePath("/student/quizzes");
    return { success: true, score: earnedScore, totalScore, attemptId: attempt.id };
  } catch (err: any) {
    return { success: false, score: 0, totalScore: 0, error: err.message };
  }
}
