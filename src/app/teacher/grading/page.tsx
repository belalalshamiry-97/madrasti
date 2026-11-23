"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  CheckSquare,
  Search,
  Filter,
  Clock,
  Award,
  ArrowRight,
  User,
  FileCheck,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { MOCK_USERS } from "@/lib/mock-data";
import { getActiveUser } from "@/lib/user-store";
import { getStoredSubjects, SubjectAssignment } from "@/lib/academic-store";
import { getSubmissionsForTeacher, AssignmentSubmission } from "@/lib/submission-store";

export default function TeacherGradingQueuePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(MOCK_USERS.teacher1);
  const [teacherSubjects, setTeacherSubjects] = useState<SubjectAssignment[]>([]);
  const [submissionsList, setSubmissionsList] = useState<AssignmentSubmission[]>([]);

  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "graded">("all");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const active = getActiveUser("TEACHER");
    setCurrentTeacher(active);

    // Get submissions strictly for courses assigned to this teacher
    const subs = getSubmissionsForTeacher(active.full_name, active.username);
    setSubmissionsList(subs);

    // Get subjects assigned to this active teacher from academic store
    const allSubjects = getStoredSubjects();
    const assigned = allSubjects.filter(
      (s) =>
        s.teacherName.toLowerCase().includes(active.full_name.toLowerCase()) ||
        active.full_name.toLowerCase().includes(s.teacherName.toLowerCase())
    );

    setTeacherSubjects(assigned);
  }, []);

  // Filter submissions strictly to ONLY courses assigned to this teacher
  const teacherSubmissions = useMemo(() => {
    return submissionsList;
  }, [submissionsList]);

  const filtered = useMemo(() => {
    return teacherSubmissions.filter((sub) => {
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "pending"
          ? sub.status === "submitted" || sub.status === "late"
          : sub.status === "graded";

      const matchesSubject =
        selectedSubjectFilter === "ALL" || sub.course_name === selectedSubjectFilter;

      const matchesSearch =
        sub.student_name.includes(searchQuery) ||
        sub.assignment_title.includes(searchQuery);

      return matchesStatus && matchesSubject && matchesSearch;
    });
  }, [teacherSubmissions, statusFilter, selectedSubjectFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader user={currentTeacher} onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={currentTeacher} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher"
              className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-brand-teal" />
                طابور وسجل تصحيح التكليفات المسندة
              </h1>
              <p className="text-xs text-muted">
                مراجعة حلول الطلاب ورصد الدرجات للمواد المسندة إليك حصراً: (
                {teacherSubjects.length > 0
                  ? teacherSubjects.map((s) => s.name).join(" • ")
                  : currentTeacher.full_name.includes("بلال")
                  ? "إدارة الشبكات"
                  : currentTeacher.full_name.includes("فاطمة")
                  ? "أمنية النظم • الرياضيات"
                  : "لا توجد مواد مسندة بعد"}
                )
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                statusFilter === "all"
                  ? "bg-brand-teal text-background shadow-glow"
                  : "bg-surface text-muted hover:text-foreground border border-border"
              }`}
            >
              جميع تسليمات موادي ({teacherSubmissions.length})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                statusFilter === "pending"
                  ? "bg-status-warning text-background shadow-glow"
                  : "bg-surface text-muted hover:text-foreground border border-border"
              }`}
            >
              تنتظر التصحيح (
              {teacherSubmissions.filter((s) => s.status === "submitted" || s.status === "late").length}
              )
            </button>
            <button
              onClick={() => setStatusFilter("graded")}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                statusFilter === "graded"
                  ? "bg-brand-cyan text-background shadow-glow"
                  : "bg-surface text-muted hover:text-foreground border border-border"
              }`}
            >
              تم تصحيحها (
              {teacherSubmissions.filter((s) => s.status === "graded").length}
              )
            </button>
          </div>

          <div className="relative sm:w-64">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="البحث باسم الطالب أو التكليف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-brand-teal placeholder-muted/60"
            />
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-surface border border-border space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-teal/15 text-brand-teal flex items-center justify-center mx-auto">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                لا توجد تسليمات تنتظر التصحيح في مقرراتك
              </h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                {teacherSubmissions.length === 0
                  ? "لم يتم إسناد مواد تحتوي تسليمات لحسابك بعد. يمكنك مراجعة مدير المدرسة لإسناد المقررات الدراسية المناسبة لك."
                  : "تم تصحيح كافة التكليفات المسندة إليك بنجاح!"}
              </p>
            </div>
          ) : (
            filtered.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-3xl bg-surface border border-border hover:border-brand-teal/40 transition-all shadow-card space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center font-bold text-sm text-brand-teal shrink-0">
                      {sub.student_name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">
                          {sub.student_name}
                        </h3>
                        <span className="text-xs text-muted font-mono" dir="ltr">
                          (@{sub.student_username})
                        </span>
                      </div>
                      <span className="text-xs text-brand-cyan block mt-0.5">
                        {sub.assignment_title} — <strong className="text-brand-teal">{sub.course_name}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <StatusBadge
                      type={sub.status === "graded" ? "completed" : "pending"}
                      label={sub.status === "graded" ? "تم التصحيح" : "تسليم جديد"}
                    />
                    {sub.score !== null && sub.score !== undefined && (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-brand-teal/15 text-brand-teal border border-brand-teal/30">
                        {sub.score} / {sub.max_score}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted bg-surface-secondary/50 p-3 rounded-xl border border-border/60 line-clamp-2">
                  {sub.answer_text}
                </p>

                <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-muted" />
                      وقت التسليم: {sub.submitted_at}
                    </span>
                    <span>المحاولة: {sub.attempt_number}</span>
                    <span>الملفات المرفقة: {sub.files.length}</span>
                  </div>

                  <Link
                    href={`/teacher/grading/${sub.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-teal text-background text-xs font-bold shadow-glow hover:opacity-90 transition-all self-end sm:self-auto"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>{sub.status === "graded" ? "مراجعة وتعديل الدرجة" : "بدء التصحيح"}</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        <DeveloperFooter />
      </main>

      <BottomNavigation user={currentTeacher} />
    </div>
  );
}
