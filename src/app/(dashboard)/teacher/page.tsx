"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  CheckSquare,
  PlusCircle,
  Clock,
  ChevronLeft,
  FileText,
  CalendarCheck,
  Megaphone,
  CalendarDays,
  HelpCircle,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { CourseCard } from "@/components/courses/CourseCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { getActiveUser } from "@/lib/user-store";
import { getTeacherCoursesFromDB, getTeacherDashboardStatsFromDB } from "@/lib/services/academic-service";
import { getTeacherSubmissionsFromDB } from "@/lib/services/assignments-service";

export default function TeacherDashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    assigned_subjects_count: 0,
    total_students_count: 0,
    published_lessons_count: 0,
    pending_submissions_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    async function loadTeacherData() {
      const active = getActiveUser("TEACHER");
      setTeacher(active);

      try {
        const teacherKey = active?.id || active?.username;
        if (teacherKey) {
          const [dbCourses, dbStats, dbSubmissions] = await Promise.all([
            getTeacherCoursesFromDB(teacherKey),
            getTeacherDashboardStatsFromDB(teacherKey),
            getTeacherSubmissionsFromDB(teacherKey),
          ]);

          setAssignedCourses(dbCourses || []);
          setStats(dbStats);

          const pending = (dbSubmissions || []).filter(
            (s: any) => s.status === "submitted" || s.status === "late"
          );
          setPendingSubmissions(pending);
        }
      } catch (err) {
        console.error("Error loading teacher dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTeacherData();
  }, []);

  const primaryCourseId = assignedCourses.length > 0 ? assignedCourses[0].id : null;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader
        user={teacher}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={teacher}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Welcome Header */}
        <section className="rounded-3xl bg-gradient-to-l from-surface via-surface-secondary to-surface p-5 sm:p-7 border border-border shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                  لوحة تحكم المعلم
                </span>
                <span className="text-xs text-muted">
                  مدرس مواد الشبكات والبرمجيات
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                أهلاً بك، {teacher?.full_name || "المعلم"} 👨‍🏫
              </h1>
              <p className="text-sm text-muted mt-1">
                لديك {stats.pending_submissions_count} تسليمات جديدة تنتظر المراجعة والتصحيح اليوم.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Link
                href={primaryCourseId ? `/teacher/courses/${primaryCourseId}/lessons/new` : "/teacher/courses"}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-cyan text-background text-xs font-bold hover:opacity-90 shadow-glow transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                إضافة درس
              </Link>
              <Link
                href="/teacher/assignments/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface text-foreground text-xs font-semibold border border-border transition-colors"
              >
                <FileText className="w-4 h-4 text-brand-teal" />
                إنشاء واجب
              </Link>
              <Link
                href="/teacher/grading"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface text-foreground text-xs font-semibold border border-border transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-status-warning" />
                سجل التصحيح
              </Link>
              <Link
                href="/teacher/attendance"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface text-foreground text-xs font-semibold border border-border transition-colors"
              >
                <CalendarDays className="w-4 h-4 text-brand-teal" />
                كشف الحضور
              </Link>
              <Link
                href="/teacher/quizzes/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-cyan text-background text-xs font-bold hover:brightness-110 shadow-glow transition-all"
              >
                <HelpCircle className="w-4 h-4" />
                إنشاء اختبار
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">المواد المسندة</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">{stats.assigned_subjects_count}</span>
              <BookOpen className="w-5 h-5 text-brand-cyan" />
            </div>
            <span className="text-[11px] text-muted mt-1 block">
              مواد وشعب معتمدة
            </span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">إجمالي الطلاب</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">{stats.total_students_count}</span>
              <Users className="w-5 h-5 text-brand-teal" />
            </div>
            <span className="text-[11px] text-brand-teal mt-1 block">
              في الشعب المسندة
            </span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">بانتظار التصحيح</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-status-warning">
                {stats.pending_submissions_count}
              </span>
              <CheckSquare className="w-5 h-5 text-status-warning" />
            </div>
            <span className="text-[11px] text-status-warning mt-1 block">
              تسليمات جديدة
            </span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">الدروس المنشورة</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">{stats.published_lessons_count}</span>
              <Clock className="w-5 h-5 text-brand-cyan" />
            </div>
            <span className="text-[11px] text-brand-cyan mt-1 block">
              دروس منشورة للطلاب
            </span>
          </div>
        </section>

        {/* Teacher Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses Managed */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  المواد والشعب المسندة إليك
                </h2>
                <p className="text-xs text-muted">
                  إدارة المحاضرات، الدروس، والواجبات لكل مادة
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="p-8 rounded-3xl bg-surface border border-border text-center text-muted text-xs">
                  جاري جلب بيانات المواد والشعب من قاعدة البيانات...
                </div>
              ) : assignedCourses.length === 0 ? (
                <div className="p-8 rounded-3xl bg-surface border border-border text-center text-muted text-xs">
                  لم يتم إسناد مواد دراسية لك بعد. يرجى مراجعة إدارة المدرسة لإسناد المواد وشعب التدريس.
                </div>
              ) : (
                assignedCourses.map((subject) => (
                  <div
                    key={subject.id}
                    className="p-5 rounded-3xl bg-surface border border-border hover:border-brand-teal/40 transition-all shadow-card space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-surface-secondary text-brand-teal flex items-center justify-center font-bold text-sm">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-foreground">
                            {subject.name}
                          </h3>
                          <span className="text-xs text-muted">
                            {subject.grade} • {subject.section} • ({subject.code})
                          </span>
                        </div>
                      </div>

                      <StatusBadge
                        type={subject.subject_type === "theory" ? "theory" : "practical"}
                        label={subject.subject_type === "theory" ? "نظري" : "عملي"}
                      />
                    </div>

                    <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                      <span className="text-xs text-muted">
                        {subject.semester_name || "الفصل الدراسي الحالي"}
                      </span>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/teacher/courses/${subject.id}/lessons`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-xs font-semibold text-foreground transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-brand-teal" />
                          إدارة الدروس
                        </Link>
                        <Link
                          href={`/teacher/courses/${subject.id}/lessons/new`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-teal text-xs font-bold transition-colors"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          إضافة درس
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>


          {/* Pending Submissions Queue */}
          <section className="space-y-4">
            <div className="bg-surface p-5 rounded-3xl border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-status-warning" />
                  تسليمات تنتظر التصحيح
                </h3>
                <Link
                  href="/teacher/grading"
                  className="text-xs text-brand-cyan hover:underline"
                >
                  عرض الكل
                </Link>
              </div>

              <div className="space-y-3">
                {pendingSubmissions.length === 0 ? (
                  <p className="text-xs text-muted text-center py-6">
                    لا توجد تسليمات جديدة تنتظر التصحيح حالياً.
                  </p>
                ) : (
                  pendingSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-2xl bg-surface-secondary/70 border border-border space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          {sub.student_name}
                        </span>
                        <StatusBadge type="pending" label="تسليم جديد" />
                      </div>
                      <p className="text-[11px] text-muted">
                        {sub.assignment_title} ({sub.course_name})
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] text-muted">
                        <span>{sub.submitted_at}</span>
                        <Link
                          href={`/teacher/grading/${sub.id}`}
                          className="text-brand-cyan hover:underline font-bold"
                        >
                          بدء التصحيح &larr;
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
        <DeveloperFooter />
      </main>

      <BottomNavigation user={teacher} />
    </div>
  );
}