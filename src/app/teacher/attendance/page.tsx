"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  X,
  Clock,
  FileQuestion,
  Save,
  CheckCircle2,
  Calendar,
  Users,
  Search,
  Filter,
  CheckCheck,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { cn } from "@/lib/utils";
import { getActiveUser } from "@/lib/user-store";
import { getTeacherCoursesFromDB } from "@/lib/services/academic-service";
import {
  recordAttendanceInDB,
  getSectionStudentsForAttendance,
  AttendanceStudentRow,
} from "@/lib/services/attendance-service";

export default function TeacherAttendancePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teacher, setTeacher] = useState<any>({
    full_name: "المعلم",
    role: "TEACHER",
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [classSubjectId, setClassSubjectId] = useState<string>("");
  const [metaInfo, setMetaInfo] = useState({
    subjectName: "",
    gradeName: "",
    sectionName: "",
  });

  const [records, setRecords] = useState<AttendanceStudentRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Load teacher profile & courses
  useEffect(() => {
    async function init() {
      const active = getActiveUser("TEACHER");
      if (active) setTeacher(active);

      try {
        const teacherId = active?.id || active?.username;
        if (teacherId) {
          const courses = await getTeacherCoursesFromDB(teacherId);
          setTeacherCourses(courses || []);
          if (courses && courses.length > 0) {
            setClassSubjectId(courses[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load teacher courses:", err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // 2. Load attendance records whenever classSubjectId or selectedDate changes
  useEffect(() => {
    if (!classSubjectId) {
      setRecords([]);
      return;
    }

    async function loadAttendance() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const result = await getSectionStudentsForAttendance(
          classSubjectId,
          selectedDate
        );
        setRecords(result.students);
        setMetaInfo({
          subjectName: result.subjectName,
          gradeName: result.gradeName,
          sectionName: result.sectionName,
        });
      } catch (err: any) {
        console.error("Failed to load attendance for class:", err);
        setErrorMessage("تعذر جلب سجل الحضور للشعبة المختارة.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAttendance();
  }, [classSubjectId, selectedDate]);

  const handleStatusChange = (
    studentId: string,
    newStatus: "present" | "absent" | "late" | "excused"
  ) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.student_id === studentId ? { ...r, status: newStatus } : r
      )
    );
  };

  const handleMarkAllPresent = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: "present" })));
  };

  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    const excused = records.filter((r) => r.status === "excused").length;
    const rate = total > 0 ? Math.round(((present + late * 0.8) / total) * 100) : 0;
    return { total, present, absent, late, excused, rate };
  }, [records]);

  const filteredRecords = records.filter(
    (r) =>
      r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveAttendance = async () => {
    if (!classSubjectId || records.length === 0) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const payload = records.map((r) => ({
        student_id: r.student_id,
        class_subject_id: classSubjectId,
        attendance_date: selectedDate,
        status: r.status,
        notes: r.notes || undefined,
        recorded_by: teacher?.id || teacher?.username || "teacher",
      }));

      const res = await recordAttendanceInDB(payload);
      if (!res.success) {
        setErrorMessage(res.error || "فشل حفظ كشف الحضور.");
        return;
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    } catch (err: any) {
      console.error("Failed saving attendance:", err);
      setErrorMessage(err.message || "حدث خطأ غير متوقع أثناء الحفظ.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader user={teacher} onOpenSidebar={() => setIsSidebarOpen(true)} />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={teacher}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher"
              className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-brand-teal" />
                كشف التحضير والغياب اليومي (Supabase)
              </h1>
              <p className="text-xs text-muted">
                {metaInfo.subjectName
                  ? `إدارة الحضور لشعبة ${metaInfo.gradeName} (${metaInfo.sectionName}) — مادة ${metaInfo.subjectName}`
                  : "رصد الحضور اليومي للطلاب المقيدين في الشعبة"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              disabled={records.length === 0}
              className="px-3 py-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-xs font-semibold text-brand-teal flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              تحضير الكل كحاضر
            </button>
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving || records.length === 0}
              className="px-4 py-2 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center gap-1.5 hover:brightness-110 shadow-glow transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaved ? "تم الحفظ بنجاح!" : "حفظ الكشف"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {isSaved && (
          <div className="p-4 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>تم حفظ واعتماد كشف الحضور والغياب بنجاح في Supabase وتحديث سجلات الطلاب.</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Date and Section Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-surface border border-border shadow-card text-xs">
          <div>
            <label className="block text-muted mb-1 font-semibold">المقرر الدراسي والشعبة:</label>
            {teacherCourses.length === 0 ? (
              <span className="text-muted block text-xs">لا توجد مواد مسندة لك حالياً</span>
            ) : (
              <select
                value={classSubjectId}
                onChange={(e) => setClassSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-teal"
              >
                {teacherCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} • {c.grade} ({c.section})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-muted mb-1 font-semibold">تاريخ الحصة:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-bold text-xs focus:outline-none focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="block text-muted mb-1 font-semibold">نسبة الحضور المسجلة:</label>
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-brand-teal block text-sm">
                %{stats.rate}
              </span>
              <span className="text-xs text-muted">
                (من إجمالي {stats.total} طلاب مقيدين)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted block">حاضر</span>
              <span className="text-xl font-black text-brand-teal">{stats.present}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center font-bold">
              <Check className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted block">غائب</span>
              <span className="text-xl font-black text-status-danger">{stats.absent}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-status-danger/15 text-status-danger flex items-center justify-center font-bold">
              <X className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted block">متأخر</span>
              <span className="text-xl font-black text-status-warning">{stats.late}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-status-warning/15 text-status-warning flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted block">بعذر</span>
              <span className="text-xl font-black text-brand-cyan">{stats.excused}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center font-bold">
              <FileQuestion className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم الطالب أو رقم القيد..."
            className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-brand-teal"
          />
        </div>

        {/* Student Attendance List */}
        <div className="p-4 sm:p-6 rounded-3xl bg-surface border border-border shadow-card space-y-3">
          <div className="hidden sm:grid sm:grid-cols-12 text-xs font-bold text-muted pb-3 border-b border-border">
            <span className="col-span-5">اسم الطالب ورقم القيد في الشعبة</span>
            <span className="col-span-4 text-center">حالة الحضور</span>
            <span className="col-span-3 text-left">ملاحظات</span>
          </div>

          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-brand-teal animate-spin" />
              <p className="text-xs text-muted">جاري تحميل طلاب الشعبة وسجل الحضور من Supabase...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-10 text-center text-muted text-xs space-y-2">
              <Users className="w-8 h-8 text-muted mx-auto opacity-40" />
              <p className="font-bold text-foreground">لا يوجد طلاب مقيدون في هذه الشعبة حالياً</p>
              <p className="text-[11px]">يمكن للمدير تسجيل الطلاب وإسنادهم لهذه الشعبة لتظهر أسماؤهم هنا تلقائياً.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((item, idx) => (
                <div
                  key={item.student_id}
                  className="p-3.5 rounded-2xl bg-surface-secondary/50 border border-border/80 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-3 transition-colors hover:border-brand-teal/30"
                >
                  {/* Student Info */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-surface text-brand-teal flex items-center justify-center font-bold text-xs border border-border shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {item.student_name}
                      </h4>
                      <span className="text-[11px] text-muted" dir="ltr">
                        @{item.student_number}
                      </span>
                    </div>
                  </div>

                  {/* 4-State Toggle Buttons */}
                  <div className="col-span-4 flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.student_id, "present")}
                      className={cn(
                        "px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                        item.status === "present"
                          ? "bg-brand-teal text-background shadow-glow"
                          : "bg-surface hover:bg-surface-secondary text-muted"
                      )}
                    >
                      حاضر
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.student_id, "absent")}
                      className={cn(
                        "px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                        item.status === "absent"
                          ? "bg-status-danger text-background shadow-glow"
                          : "bg-surface hover:bg-surface-secondary text-muted"
                      )}
                    >
                      غائب
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.student_id, "late")}
                      className={cn(
                        "px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                        item.status === "late"
                          ? "bg-status-warning text-background shadow-glow"
                          : "bg-surface hover:bg-surface-secondary text-muted"
                      )}
                    >
                      متأخر
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item.student_id, "excused")}
                      className={cn(
                        "px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                        item.status === "excused"
                          ? "bg-brand-cyan text-background shadow-glow"
                          : "bg-surface hover:bg-surface-secondary text-muted"
                      )}
                    >
                      بعذر
                    </button>
                  </div>

                  {/* Notes Column */}
                  <div className="col-span-3 text-left">
                    {item.notes ? (
                      <span className="text-[11px] text-muted block truncate" title={item.notes}>
                        {item.notes}
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted/50">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DeveloperFooter />
      </main>

      <BottomNavigation user={teacher} />
    </div>
  );
}
