"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface AttendanceRecordInput {
  student_id: string; // UUID or username
  class_subject_id: string;
  attendance_date: string; // YYYY-MM-DD
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
  recorded_by: string; // UUID or username
}

/**
 * Record attendance for multiple students
 */
export async function recordAttendanceInDB(records: AttendanceRecordInput[]): Promise<{
  success: boolean;
  insertedCount?: number;
  error?: string;
}> {
  try {
    const admin = createAdminClient();

    if (!records || records.length === 0) {
      return { success: true, insertedCount: 0 };
    }

    // Resolve UUIDs for students & recorded_by
    const payloads = [];
    for (const r of records) {
      let studentUuid = r.student_id;
      if (!studentUuid.includes("-")) {
        const { data: p } = await admin.from("profiles").select("id").eq("username", r.student_id).maybeSingle();
        if (p?.id) studentUuid = p.id;
      }

      let recorderUuid = r.recorded_by;
      if (!recorderUuid.includes("-")) {
        const { data: p } = await admin.from("profiles").select("id").eq("username", r.recorded_by).maybeSingle();
        if (p?.id) recorderUuid = p.id;
      }

      payloads.push({
        student_id: studentUuid,
        class_subject_id: r.class_subject_id,
        attendance_date: r.attendance_date,
        status: r.status,
        notes: r.notes || null,
        recorded_by: recorderUuid,
      });
    }

    // Clean up existing records for these students on this class_subject and date to avoid duplicates
    const studentIds = payloads.map((p) => p.student_id);
    const date = records[0].attendance_date;
    const classSubjectId = records[0].class_subject_id;

    await admin
      .from("attendance_records")
      .delete()
      .eq("class_subject_id", classSubjectId)
      .eq("attendance_date", date)
      .in("student_id", studentIds);

    const { data, error } = await admin.from("attendance_records").insert(payloads).select("id");

    if (error) {
      console.error("Error saving attendance to DB:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/teacher/attendance");
    revalidatePath("/admin/attendance");
    revalidatePath("/student/attendance");

    return { success: true, insertedCount: data?.length || records.length };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export interface AttendanceStudentRow {
  student_id: string;
  student_name: string;
  student_number: string;
  phone?: string;
  section_id: string;
  attendance_date: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
}

/**
 * Fetch real enrolled students for a class_subject with existing or default attendance status
 */
export async function getSectionStudentsForAttendance(
  classSubjectId: string,
  date: string
): Promise<{
  students: AttendanceStudentRow[];
  subjectName: string;
  gradeName: string;
  sectionName: string;
}> {
  try {
    const admin = createAdminClient();

    const { data: cs, error: csErr } = await admin
      .from("class_subjects")
      .select(`
        id,
        section_id,
        semester_id,
        subjects ( name, code ),
        sections ( name, grade_levels ( name ) )
      `)
      .eq("id", classSubjectId)
      .maybeSingle();

    if (csErr || !cs) {
      return {
        students: [],
        subjectName: "المقرر",
        gradeName: "الصف",
        sectionName: "الشعبة",
      };
    }

    const subjectName = (cs.subjects as any)?.name || "المقرر";
    const sectionName = (cs.sections as any)?.name || "الشعبة";
    const gradeName = (cs.sections as any)?.grade_levels?.name || "الصف";

    // Fetch active enrollments for this section
    const { data: enrollments, error: enrollErr } = await admin
      .from("enrollments")
      .select(`
        student_id,
        profiles:student_id (
          id,
          full_name,
          username,
          phone
        )
      `)
      .eq("section_id", cs.section_id)
      .eq("status", "active");

    if (enrollErr || !enrollments || enrollments.length === 0) {
      return {
        students: [],
        subjectName,
        gradeName,
        sectionName,
      };
    }

    // Fetch existing attendance for this classSubject and date
    const { data: existingRecords } = await admin
      .from("attendance_records")
      .select("student_id, status, notes")
      .eq("class_subject_id", classSubjectId)
      .eq("attendance_date", date);

    const recordMap = new Map<string, { status: any; notes: string }>();
    if (existingRecords) {
      existingRecords.forEach((r) => {
        recordMap.set(r.student_id, { status: r.status, notes: r.notes || "" });
      });
    }

    const students: AttendanceStudentRow[] = enrollments.map((en: any) => {
      const prof = en.profiles;
      const sId = prof?.id || en.student_id;
      const existing = recordMap.get(sId);

      return {
        student_id: sId,
        student_name: prof?.full_name || "طالب",
        student_number: prof?.username || "student",
        phone: prof?.phone || "",
        section_id: cs.section_id,
        attendance_date: date,
        status: (existing?.status as any) || "present",
        notes: existing?.notes || "",
      };
    });

    return {
      students,
      subjectName,
      gradeName,
      sectionName,
    };
  } catch (err) {
    console.error("Error in getSectionStudentsForAttendance:", err);
    return {
      students: [],
      subjectName: "المقرر",
      gradeName: "الصف",
      sectionName: "الشعبة",
    };
  }
}

/**
 * Get attendance records for a given date or class
 */
export async function getAttendanceForDateFromDB(date: string, classSubjectId?: string) {
  try {
    const admin = createAdminClient();

    let query = admin
      .from("attendance_records")
      .select(`
        id,
        attendance_date,
        status,
        notes,
        student_id,
        class_subject_id,
        profiles:student_id (
          full_name,
          username
        ),
        class_subjects (
          subjects ( name ),
          sections ( name, grade_levels ( name ) )
        ),
        recorder:recorded_by (
          full_name
        )
      `)
      .eq("attendance_date", date)
      .order("created_at", { ascending: false });

    if (classSubjectId) {
      query = query.eq("class_subject_id", classSubjectId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((rec: any) => ({
      id: rec.id,
      studentId: rec.student_id,
      studentName: (rec.profiles as any)?.full_name || "طالب",
      username: (rec.profiles as any)?.username || "student",
      grade: (rec.class_subjects as any)?.sections?.grade_levels?.name || "المرحلة الثانوية",
      section: (rec.class_subjects as any)?.sections?.name || "الشعبة (أ)",
      date: rec.attendance_date,
      subject: (rec.class_subjects as any)?.subjects?.name || "المادة",
      teacherName: (rec.recorder as any)?.full_name || "المعلم",
      status: rec.status,
      note: rec.notes || "",
    }));
  } catch (err) {
    console.error("Error in getAttendanceForDateFromDB:", err);
    return [];
  }
}

/**
 * Get all attendance records from Supabase (for admin overview)
 */
export async function getAllAttendanceFromDB(limit = 200) {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("attendance_records")
      .select(`
        id,
        attendance_date,
        status,
        notes,
        student_id,
        class_subject_id,
        profiles:student_id (
          full_name,
          username
        ),
        class_subjects (
          subjects ( name ),
          sections ( name, grade_levels ( name ) )
        ),
        recorder:recorded_by (
          full_name
        )
      `)
      .order("attendance_date", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((rec: any) => ({
      id: rec.id,
      studentId: rec.student_id,
      studentName: (rec.profiles as any)?.full_name || "طالب",
      username: (rec.profiles as any)?.username || "student",
      grade: (rec.class_subjects as any)?.sections?.grade_levels?.name || "المرحلة الثانوية",
      section: (rec.class_subjects as any)?.sections?.name || "الشعبة (أ)",
      date: rec.attendance_date,
      subject: (rec.class_subjects as any)?.subjects?.name || "المادة",
      teacherName: (rec.recorder as any)?.full_name || "المعلم",
      status: rec.status,
      note: rec.notes || "",
    }));
  } catch (err) {
    console.error("Error in getAllAttendanceFromDB:", err);
    return [];
  }
}

/**
 * Get attendance history for a single student
 */
export async function getAttendanceForStudentFromDB(studentIdOrUsername: string) {
  try {
    const admin = createAdminClient();

    let studentUuid = studentIdOrUsername;
    if (!studentIdOrUsername.includes("-")) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", studentIdOrUsername).maybeSingle();
      if (p?.id) studentUuid = p.id;
    }

    const { data, error } = await admin
      .from("attendance_records")
      .select(`
        id,
        attendance_date,
        status,
        notes,
        class_subjects (
          subjects ( name )
        )
      `)
      .eq("student_id", studentUuid)
      .order("attendance_date", { ascending: false });

    if (error || !data) return [];

    return data.map((rec: any) => {
      let statusLabel = "حاضر";
      if (rec.status === "absent") statusLabel = "غائب";
      else if (rec.status === "late") statusLabel = "متأخر";
      else if (rec.status === "excused") statusLabel = "عذر مقبول";

      return {
        id: rec.id,
        date: rec.attendance_date,
        subject: (rec.class_subjects as any)?.subjects?.name || "المادة",
        status: rec.status,
        statusLabel,
        notes: rec.notes || "حضور معتمد في السجل المدرسي",
      };
    });
  } catch (err) {
    console.error("Error in getAttendanceForStudentFromDB:", err);
    return [];
  }
}

/**
 * Get school-wide attendance aggregated stats
 */
export async function getAttendanceStatsFromDB() {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin.from("attendance_records").select("status");

    if (error || !data || data.length === 0) {
      return { total: 0, present: 0, absent: 0, late: 0, excused: 0, rate: 100 };
    }

    const total = data.length;
    const present = data.filter((r) => r.status === "present").length;
    const absent = data.filter((r) => r.status === "absent").length;
    const late = data.filter((r) => r.status === "late").length;
    const excused = data.filter((r) => r.status === "excused").length;
    const rate = Math.round(((present + late * 0.8) / total) * 100);

    return { total, present, absent, late, excused, rate };
  } catch (err) {
    console.error("Error in getAttendanceStatsFromDB:", err);
    return { total: 0, present: 0, absent: 0, late: 0, excused: 0, rate: 100 };
  }
}
