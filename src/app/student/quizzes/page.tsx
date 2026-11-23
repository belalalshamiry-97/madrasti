"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS, MOCK_QUIZZES } from "@/lib/mock-data";
import { getActiveUser } from "@/lib/user-store";
import { getQuizzesForStudentFromDB } from "@/lib/services/quizzes-service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

export default function StudentQuizzesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [student, setStudent] = useState(MOCK_USERS.student1);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const active = getActiveUser("STUDENT");
    setStudent(active);

    async function loadData() {
      setIsLoading(true);
      try {
        const dbQuizzes = await getQuizzesForStudentFromDB(active.id || active.username);
        if (dbQuizzes && dbQuizzes.length > 0) {
          setQuizzes(dbQuizzes);
        } else {
          setQuizzes(MOCK_QUIZZES);
        }
      } catch (err) {
        console.error("Failed to load quizzes from DB:", err);
        setQuizzes(MOCK_QUIZZES);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-cyan text-background flex items-center justify-center font-bold shadow-glow">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">الاختبارات الإلكترونية</h1>
              <p className="text-xs text-muted">
                الاختبارات الدورية الموقوتة والتقييمات التفاعلية
              </p>
            </div>
          </div>
        </div>

        {/* Quizzes List */}
        <div className="space-y-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="p-5 sm:p-6 rounded-3xl bg-surface border border-border hover:border-brand-cyan/40 shadow-card transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20">
                      {quiz.course_name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-teal/15 text-brand-teal border border-brand-teal/20 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {quiz.duration_minutes} دقيقة
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground pt-1">
                    {quiz.title}
                  </h3>
                  {quiz.description && (
                    <p className="text-xs text-muted leading-relaxed max-w-2xl">
                      {quiz.description}
                    </p>
                  )}
                </div>

                <div className="text-right sm:text-left shrink-0">
                  <span className="block text-xl font-black text-brand-cyan">
                    {quiz.total_score} درجات
                  </span>
                  <span className="text-[11px] text-muted block">
                    درجة النجاح: {quiz.passing_score}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-brand-cyan" />
                    عدد الأسئلة: {quiz.questions_count || 4} أسئلة
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-muted" />
                    متاح حتى: 25 نوفمبر 2026
                  </span>
                </div>

                <Link
                  href={`/student/quizzes/${quiz.id}`}
                  className="px-5 py-2.5 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 shadow-glow transition-all"
                >
                  <span>بدء الاختبار الآن</span>
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNavigation user={student} />
    </div>
  );
}
