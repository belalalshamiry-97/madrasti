"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  FileText,
  ChevronLeft,
  Video,
  MapPin,
  Sparkles,
  HelpCircle,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { CourseCard } from "@/components/courses/CourseCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { getActiveUser } from "@/lib/user-store";
import { getStudentCoursesFromDB } from "@/lib/services/academic-service";
import { getAssignmentsForStudentFromDB } from "@/lib/services/assignments-service";

export default function StudentDashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStudentData() {
      const active = getActiveUser("STUDENT");
      setStudent(active);

      try {
        const studentId = active?.id || active?.username;
        if (studentId) {
          const [dbCourses, dbAssignments] = await Promise.all([
            getStudentCoursesFromDB(studentId),
            getAssignmentsForStudentFromDB(studentId),
          ]);
          setCourses(dbCourses || []);
          setAssignments(dbAssignments || []);
        }
      } catch (err) {
        console.error("Error loading student dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStudentData();
  }, []);

  const totalLessons = courses.reduce((acc, c) => acc + (c.lessons_count || 0), 0);
  const pendingAssignments = assignments.filter((a) => a.status === "pending" || a.status === "submitted");
  const lateAssignments = assignments.filter((a) => a.status === "late");

  const studentCourses = courses.map((s) => ({
    id: s.id,
    section_id: s.section,
    subject_id: s.code,
    teacher_id: s.teacher_name,
    semester_id: "20261",
    subject: {
      id: s.id,
      name: s.name,
      code: s.code,
      subject_type: s.subject_type || "theory",
      icon_name: s.name.includes("شبكات")
        ? "Network"
        : s.name.includes("أمنية")
        ? "ShieldCheck"
        : s.name.includes("برمجة") || s.name.includes("حاسوب")
        ? "Code2"
        : "Calculator",
    },
    teacher: {
      id: `t-${s.teacher_name}`,
      role: "TEACHER" as const,
      full_name: s.teacher_name,
      username: (s.teacher_name || "").replace(/\s+/g, ""),
      is_active: true,
      created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z",
    },
    lessons_count: s.lessons_count || 0,
    assignments_count: 0,
    progress_percentage: 0,
  }));

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader user={student} onOpenSidebar={() => setIsSidebarOpen(true)} />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={student} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Student Welcome Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-surface via-surface-secondary to-surface p-5 sm:p-7 border border-border shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                  الفصل الدراسي الأول • 20261
                </span>
                <span className="text-xs text-muted">
                  {student?.grade || "المرحلة الثانوية"} • {student?.section || "الشعبة (أ)"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                مرحباً بك، {student?.full_name || "عزيزي الطالب"} 👋
              </h1>
              <p className="text-sm text-muted mt-1">
                تابع مقرراتك وجدول حصصك وتكاليفك الأكاديمية لهذا الأسبوع.
              </p>
            </div>

            {/* Overall status pill */}
            <div className="flex items-center gap-4 bg-background/60 p-3.5 rounded-2xl border border-border self-start md:self-auto">
              <div className="w-12 h-12 rounded-full border-4 border-brand-cyan flex items-center justify-center font-black text-brand-cyan text-sm">
                100%
              </div>
              <div>
                <span className="text-xs text-muted block">حالة الحساب</span>
                <span className="text-sm font-bold text-foreground">
                  طالب مسجل ومنتظم
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">المواد المسندة للشعبة</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">
                {isLoading ? "..." : studentCourses.length}
              </span>
              <BookOpen className="w-5 h-5 text-brand-cyan" />
            </div>
            <span className="text-[11px] text-brand-cyan mt-1 block">
              مسجلة في قاعدة البيانات
            </span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">الدروس المنشورة</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">
                {isLoading ? "..." : totalLessons}
              </span>
              <FileText className="w-5 h-5 text-brand-teal" />
            </div>
            <span className="text-[11px] text-brand-teal mt-1 block">
              محاضرات متوفرة للدراسة
            </span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">واجبات قيد التسليم</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-status-warning">
                {isLoading ? "..." : pendingAssignments.length}
              </span>
              <Clock className="w-5 h-5 text-status-warning" />
            </div>
            <span className="text-[11px] text-status-warning mt-1 block">
              تستحق المتابعة
            </span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">تكاليف متأخرة</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-status-danger">
                {isLoading ? "..." : lateAssignments.length}
              </span>
              <AlertCircle className="w-5 h-5 text-status-danger" />
            </div>
            <span className="text-[11px] text-status-danger mt-1 block">
              {lateAssignments.length > 0 ? "يرجى تسليمها فوراً" : "لا توجد متأخرات"}
            </span>
          </div>
        </section>

        {/* Quick Modules Banner: Quizzes & Attendance */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/student/quizzes"
            className="p-4 rounded-2xl bg-surface hover:bg-surface-secondary border border-border hover:border-brand-cyan/40 shadow-card flex items-center justify-between gap-3 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">الاختبارات الإلكترونية</h4>
                <span className="text-[11px] text-brand-cyan block">متابعة الاختبارات والتقييمات</span>
              </div>
            </div>
            <span className="text-xs font-bold text-brand-cyan">دخول &larr;</span>
          </Link>

          <Link
            href="/student/attendance"
            className="p-4 rounded-2xl bg-surface hover:bg-surface-secondary border border-border hover:border-brand-teal/40 shadow-card flex items-center justify-between gap-3 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">سجل الحضور والغياب</h4>
                <span className="text-[11px] text-brand-teal block">كشوفات الدوام والانضباط</span>
              </div>
            </div>
            <span className="text-xs font-bold text-brand-teal">استعراض &larr;</span>
          </Link>
        </section>

        {/* Main Content Grid: Courses (2 Cols) + Assignments (1 Col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses List (2 Columns on Desktop) */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  مقرراتي الدراسية
                </h2>
                <p className="text-xs text-muted">
                  المقررات المسندة لشعبتك الدراسية للفصل الحالي
                </p>
              </div>
              <Link
                href="/student/courses"
                className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1"
              >
                عرض الكل
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="p-8 rounded-3xl bg-surface border border-border text-center text-xs text-muted">
                  جاري جلب المقررات من قاعدة البيانات...
                </div>
              ) : studentCourses.length === 0 ? (
                <div className="p-8 rounded-3xl bg-surface border border-border text-center text-xs text-muted">
                  لا توجد مقررات مسندة لشعبتك الدراسية حالياً.
                </div>
              ) : (
                studentCourses.map((course, idx) => (
                  <CourseCard
                    key={`${course.subject?.id}-${idx}`}
                    course={course}
                    basePath="/student/courses"
                  />
                ))
              )}
            </div>
          </section>

          {/* Side Column: Assignments Widget */}
          <section className="space-y-6">
            <div className="bg-surface p-5 rounded-3xl border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-teal" />
                  التكاليف والواجبات
                </h3>
                <Link
                  href="/student/assignments"
                  className="text-xs text-brand-cyan hover:underline"
                >
                  الكل
                </Link>
              </div>

              {isLoading ? (
                <p className="text-xs text-muted text-center py-4">جاري التحميل...</p>
              ) : assignments.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted">
                  لا توجد تكاليف مطلوبة حالياً.
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.slice(0, 4).map((assignment) => (
                    <Link
                      key={assignment.id}
                      href={`/student/assignments`}
                      className="block p-3.5 rounded-2xl bg-surface-secondary/70 hover:bg-surface-secondary border border-border/80 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-xs font-bold text-foreground">
                          {assignment.title}
                        </h4>
                        <StatusBadge
                          type={assignment.status || "pending"}
                          label={
                            assignment.status === "late" ? "متأخر" : "تكليف"
                          }
                        />
                      </div>
                      <p className="text-[11px] text-muted">
                        {assignment.course_name}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted border-t border-border/50 pt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-status-warning" />
                          {assignment.due_date}
                        </span>
                        <span className="text-foreground font-semibold">
                          الدرجة: {assignment.max_score}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <DeveloperFooter />
      </main>

      <BottomNavigation user={student} />
    </div>
  );
}
