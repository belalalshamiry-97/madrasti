"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  UserCheck,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { GradeBadge } from "@/components/common/GradeBadge";
import { MOCK_USERS } from "@/lib/mock-data";
import { getActiveUser } from "@/lib/user-store";
import { getSubmissionsForStudent, AssignmentSubmission } from "@/lib/submission-store";

export default function StudentGradesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [student, setStudent] = useState(MOCK_USERS.student1);
  const [gradedItems, setGradedItems] = useState<AssignmentSubmission[]>([]);

  useEffect(() => {
    const active = getActiveUser("STUDENT");
    setStudent(active);

    const subs = getSubmissionsForStudent(active.id, active.username);
    const graded = subs.filter((s) => s.status === "graded");
    setGradedItems(graded);
  }, []);

  const totalScore = gradedItems.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const totalMax = gradedItems.reduce((acc, curr) => acc + curr.max_score, 0);
  const percentage = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/student"
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">
              سجل الدرجات والنتائج
            </h1>
            <p className="text-xs text-brand-cyan mt-0.5">
              الفصل الدراسي الأول • 20261
            </p>
          </div>
          <div className="w-6" />
        </div>

        {/* Academic Performance Summary Banner */}
        <div className="rounded-3xl bg-gradient-to-tr from-brand-blue to-brand-cyan p-6 text-background shadow-glow relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold block text-background/80">
                المستوى الدراسي التراكمي
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-background mt-1">
                {gradedItems.length > 0 ? `${percentage}% 🌟` : "قيد الرصد والتقييم"}
              </h2>
              <p className="text-xs text-background/90 mt-1">
                {gradedItems.length > 0 ? "سجل الدرجات المعتمدة من المعلمين في مختلف المواد" : "سيتم احتساب المعدل فور رصد درجات واجباتك وتكاليفك"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-background/20 backdrop-blur p-3 rounded-2xl text-center">
                <span className="block text-xl font-black">{gradedItems.length}</span>
                <span className="text-[11px] font-medium opacity-90">مهام مصححة</span>
              </div>
              <div className="bg-background/20 backdrop-blur p-3 rounded-2xl text-center">
                <span className="block text-xl font-black">{gradedItems.length > 0 ? `${percentage}%` : "0%"}</span>
                <span className="text-[11px] font-medium opacity-90">نسبة النجاح</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graded Assignments List */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-brand-teal" />
            التكاليف والأنشطة المصححة
          </h3>

          {gradedItems.length === 0 ? (
            <div className="p-8 rounded-3xl bg-surface border border-border text-center text-muted">
              لا توجد درجات معتمدة حتى الآن.
            </div>
          ) : (
            gradedItems.map((item) => (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-3xl bg-surface border border-border hover:border-brand-teal/40 transition-all shadow-card space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <span className="text-xs text-brand-cyan font-bold block mb-1">
                      {item.course_name}
                    </span>
                    <h4 className="text-base font-bold text-foreground">
                      {item.assignment_title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3 py-1 rounded-xl bg-brand-teal/15 text-brand-teal border border-brand-teal/30 font-black text-sm">
                      {item.score} / {item.max_score}
                    </span>
                  </div>
                </div>

                {item.feedback_notes && (
                  <div className="p-3.5 rounded-2xl bg-surface-secondary/70 border border-border text-xs text-foreground leading-relaxed">
                    <strong className="text-brand-teal">ملاحظات المعلم: </strong>
                    {item.feedback_notes}
                  </div>
                )}

                <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-brand-teal" />
                    المصحح: {item.grader_name || "م. بلال الشميري"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    تاريخ الاعتماد: {item.graded_at || item.submitted_at}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <BottomNavigation user={student} />
    </div>
  );
}