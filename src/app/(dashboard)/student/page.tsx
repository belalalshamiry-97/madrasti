"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { CourseCard } from "@/components/courses/CourseCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import {
  MOCK_USERS,
  MOCK_COURSES,
  MOCK_SESSIONS,
  MOCK_ASSIGNMENTS,
  MOCK_ANNOUNCEMENTS,
} from "@/lib/mock-data";

export default function StudentDashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const student = MOCK_USERS.student1;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader
        user={student}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={student}
      />

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
                  الثالث الثانوي • شعبة (أ) — علمي
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                مرحباً بك، {student.full_name} 👋
              </h1>
              <p className="text-sm text-muted mt-1">
                تابع مقرراتك وجدول حصصك وتكاليفك الأكاديمية لهذا الأسبوع.
              </p>
            </div>

            {/* Quick overall progress pill */}
            <div className="flex items-center gap-4 bg-background/60 p-3.5 rounded-2xl border border-border self-start md:self-auto">
              <div className="w-12 h-12 rounded-full border-4 border-brand-cyan flex items-center justify-center font-black text-brand-cyan text-sm">
                68%
              </div>
              <div>
                <span className="text-xs text-muted block">نسبة الإنجاز العام</span>
                <span className="text-sm font-bold text-foreground">
                  مستوى دراسي متميز
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">المواد المسجلة</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">4</span>
              <BookOpen className="w-5 h-5 text-brand-cyan" />
            </div>
            <span className="text-[11px] text-brand-cyan mt-1 block">
              جميع المواد نشطة
            </span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">الدروس المنشورة</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">16</span>
              <FileText className="w-5 h-5 text-brand-teal" />
            </div>
            <span className="text-[11px] text-brand-teal mt-1 block">
              +2 دروس هذا الأسبوع
            </span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">واجبات قيد التسليم</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-status-warning">1</span>
              <Clock className="w-5 h-5 text-status-warning" />
            </div>
            <span className="text-[11px] text-status-warning mt-1 block">
              تستحق قريباً
            </span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">تكاليف متأخرة</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-status-danger">1</span>
              <AlertCircle className="w-5 h-5 text-status-danger" />
            </div>
            <span className="text-[11px] text-status-danger mt-1 block">
              تكليف 2 إدارة الشبكات
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
                <span className="text-[11px] text-brand-cyan block">1 اختبار متاح الآن</span>
              </div>
            </div>
            <span className="text-xs font-bold text-brand-cyan">بدء &larr;</span>
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
                <span className="text-[11px] text-brand-teal block">نسبة الالتزام 97.5%</span>
              </div>
            </div>
            <span className="text-xs font-bold text-brand-teal">استعراض &larr;</span>
          </Link>
        </section>

        {/* Announcements Bar */}
        {MOCK_ANNOUNCEMENTS.length > 0 && (
          <section className="bg-surface-secondary/70 border border-brand-cyan/30 p-4 rounded-2xl flex items-start gap-3">
            <div className="p-2 rounded-xl bg-brand-cyan/20 text-brand-cyan shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-foreground">
                  {MOCK_ANNOUNCEMENTS[0].title}
                </h4>
                <span className="text-[10px] text-muted shrink-0">إعلان عام</span>
              </div>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {MOCK_ANNOUNCEMENTS[0].content}
              </p>
            </div>
          </section>
        )}

        {/* Main Content Grid: Courses (2 Cols) + Sessions & Assignments (1 Col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses List (2 Columns on Desktop) */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  مقرراتي الدراسية
                </h2>
                <p className="text-xs text-muted">
                  المقررات المسجلة للفصل الدراسي الحالي
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
              {MOCK_COURSES.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  basePath="/student/courses"
                />
              ))}
            </div>
          </section>

          {/* Side Column: Upcoming Sessions & Urgent Assignments */}
          <section className="space-y-6">
            {/* Upcoming Sessions (matching screenshot 1) */}
            <div className="bg-surface p-5 rounded-3xl border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-cyan" />
                  الجلسات الدراسية
                </h3>
                <span className="text-xs text-muted">1 جلسة</span>
              </div>

              {MOCK_SESSIONS.map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl bg-surface-secondary/70 border border-border/80 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        {session.title}
                      </h4>
                      <span className="text-xs text-brand-cyan block mt-0.5">
                        إدارة الشبكات
                      </span>
                    </div>
                    <StatusBadge type="scheduled" label="مجدولة" />
                  </div>

                  <div className="space-y-1.5 text-xs text-muted">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted" />
                      <span>{session.session_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted" />
                      <span>
                        {session.start_time} — {session.end_time}
                      </span>
                    </div>
                    {session.location_or_room && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-muted" />
                        <span>{session.location_or_room}</span>
                      </div>
                    )}
                  </div>

                  {session.meeting_url && (
                    <a
                      href={session.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-brand-cyan/15 text-brand-cyan hover:bg-brand-cyan/25 text-xs font-bold transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      الانضمام للاجتماع
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Assignments Widget */}
            <div className="bg-surface p-5 rounded-3xl border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-teal" />
                  التكاليف العاجلة
                </h3>
                <Link
                  href="/student/assignments"
                  className="text-xs text-brand-cyan hover:underline"
                >
                  الكل
                </Link>
              </div>

              <div className="space-y-3">
                {MOCK_ASSIGNMENTS.map((assignment) => (
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
            </div>
          </section>
        </div>
        <DeveloperFooter />
      </main>

      <BottomNavigation user={student} />
    </div>
  );
}
