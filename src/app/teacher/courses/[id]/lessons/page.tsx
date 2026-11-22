"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  PlusCircle,
  FileText,
  Clock,
  Eye,
  Trash2,
  Calendar,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS, MOCK_COURSES, MOCK_LESSONS } from "@/lib/mock-data";
import { Lesson } from "@/types/database.types";

export default function TeacherCourseLessonsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const teacher = MOCK_USERS.teacher1;
  const params = useParams();
  const courseId = params?.id as string;

  const course =
    MOCK_COURSES.find((c) => c.id === courseId) || MOCK_COURSES[0];

  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  const toggleStatus = (id: string) => {
    setLessons((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const nextStatus = l.status === "published" ? "draft" : "published";
          return { ...l, status: nextStatus };
        }
        return l;
      })
    );
  };

  const handleConfirmDelete = () => {
    if (!lessonToDelete) return;
    const deletedTitle = lessonToDelete.title;
    setLessons((prev) => prev.filter((l) => l.id !== lessonToDelete.id));
    setLessonToDelete(null);
    setDeleteSuccessMsg(`تم حذف "${deletedTitle}" بنجاح!`);
    setTimeout(() => setDeleteSuccessMsg(null), 3000);
  };

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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/teacher"
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">
              دروس ومحاضرات المقرر
            </h1>
            <p className="text-xs text-brand-teal mt-0.5">
              {course.subject?.name} — شعبة (أ)
            </p>
          </div>
          <Link
            href={`/teacher/courses/${course.id}/lessons/new`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-cyan text-background text-xs font-bold shadow-glow hover:opacity-90 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">درس جديد</span>
          </Link>
        </div>

        {/* Delete Success Alert */}
        {deleteSuccessMsg && (
          <div className="p-4 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{deleteSuccessMsg}</span>
          </div>
        )}

        {/* Stats banner */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-surface border border-border text-center">
            <span className="text-xs text-muted block">إجمالي الدروس</span>
            <span className="text-xl font-black text-foreground">{lessons.length}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-surface border border-border text-center">
            <span className="text-xs text-muted block">منشور للطلاب</span>
            <span className="text-xl font-black text-brand-teal">
              {lessons.filter((l) => l.status === "published").length}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-surface border border-border text-center">
            <span className="text-xs text-muted block">مسودات</span>
            <span className="text-xl font-black text-status-warning">
              {lessons.filter((l) => l.status === "draft").length}
            </span>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          {lessons.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-surface border border-border text-muted text-sm">
              لا توجد دروس متبقية في هذا المقرر. يمكنك إضافة درس جديد من الزر في الأعلى.
            </div>
          ) : (
            lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-5 rounded-3xl bg-surface border border-border hover:border-brand-teal/40 transition-all shadow-card space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center text-brand-teal font-black text-sm shrink-0">
                      {lesson.lesson_number}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-foreground truncate">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-muted mt-1 line-clamp-2">
                        {lesson.description || "لا يوجد وصف مدخل"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                        lesson.status === "published"
                          ? "bg-brand-teal/15 text-brand-teal border-brand-teal/30"
                          : "bg-status-warning/15 text-status-warning border-status-warning/30"
                      }`}
                    >
                      {lesson.status === "published" ? "منشور للطلاب" : "مسودة"}
                    </span>
                  </div>
                </div>

                {/* Lesson Metadata Counters */}
                <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                      {lesson.sessions_count || 1} جلسات
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-status-warning" />
                      {lesson.assignments_count || 1} تكاليف
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-brand-cyan" />
                      {lesson.materials_count || 0} ملفات
                    </span>
                  </div>

                  {/* Teacher Action Controls with Delete Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(lesson.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground text-xs font-semibold transition-colors"
                    >
                      {lesson.status === "published" ? "تحويل لمسودة" : "نشر الآن"}
                    </button>

                    <Link
                      href={`/student/courses/${course.id}/lessons/${lesson.id}`}
                      className="p-2 rounded-xl text-muted hover:text-brand-cyan hover:bg-surface-secondary transition-colors"
                      title="معاينة كما يراها الطالب"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => setLessonToDelete(lesson)}
                      className="p-2 rounded-xl text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors"
                      title="حذف المحاضرة نهائياً"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {lessonToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-status-danger/20 text-status-danger flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                تأكيد حذف المحاضرة
              </h3>
              <p className="text-xs font-semibold text-brand-cyan">
                {lessonToDelete.title}
              </p>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              هل أنت متأكد من حذف هذا الدرس بشكل نهائي؟ سيتم حذف كافة الملفات والوسائط والروابط التابعة له.
            </p>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLessonToDelete(null)}
                className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-status-danger text-background text-xs font-bold hover:brightness-110 shadow-glow"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation user={teacher} />
    </div>
  );
}
