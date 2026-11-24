"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, FileCheck, Clock, Calendar, AlertCircle } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getActiveUser } from "@/lib/user-store";
import { getAssignmentsForStudentFromDB } from "@/lib/services/assignments-service";

export default function StudentAssignmentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "late" | "pending">("all");
  const [student, setStudent] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const active = getActiveUser("STUDENT");
    setStudent(active);

    async function loadData() {
      setIsLoading(true);
      try {
        const studentId = active?.id || active?.username;
        if (studentId) {
          const dbAssignments = await getAssignmentsForStudentFromDB(studentId);
          setAssignments(dbAssignments || []);
        } else {
          setAssignments([]);
        }
      } catch (err) {
        console.error("Failed to load student assignments:", err);
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredAssignments = assignments.filter((a) => {
    if (filter === "all") return true;
    if (filter === "late") return a.status === "late";
    if (filter === "pending") return a.status === "pending" || a.status === "submitted";
    return true;
  });

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
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/student"
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">واجباتي وتكاليفي</h1>
          <div className="w-6" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-brand-cyan text-background shadow-glow"
                : "bg-surface text-muted hover:text-foreground border border-border"
            }`}
          >
            جميع التكاليف ({assignments.length})
          </button>
          <button
            onClick={() => setFilter("late")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "late"
                ? "bg-status-danger text-white shadow-glow"
                : "bg-surface text-muted hover:text-foreground border border-border"
            }`}
          >
            المتأخرة ({assignments.filter((a) => a.status === "late").length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "pending"
                ? "bg-status-warning text-background shadow-glow"
                : "bg-surface text-muted hover:text-foreground border border-border"
            }`}
          >
            قيد التسليم ({assignments.filter((a) => a.status === "pending" || a.status === "submitted").length})
          </button>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-surface border border-border space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center mx-auto">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                لا توجد تكاليف مطابقة
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                كافة التكاليف والواجبات المطلوبة ستظهر هنا فور نشرها من قبل المعلمين في مقرراتك الدراسية.
              </p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
              className="p-5 rounded-3xl bg-surface border border-border hover:border-brand-cyan/40 shadow-card space-y-4 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs text-brand-cyan font-bold block mb-1">
                    {assignment.course_name}
                  </span>
                  <h3 className="text-base font-bold text-foreground">
                    {assignment.title}
                  </h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {assignment.instructions}
                  </p>
                </div>
                <StatusBadge
                  type={assignment.status || "pending"}
                  label={assignment.status === "late" ? "متأخر" : "تكليف"}
                />
              </div>

              <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-status-warning" />
                    الموعد: {assignment.due_date}
                  </span>
                  <span className="font-semibold text-foreground">
                    الدرجة: {assignment.max_score}
                  </span>
                </div>

                <Link
                  href={`/student/assignments/${assignment.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-brand-cyan text-background text-xs font-bold hover:opacity-90 shadow-glow transition-all"
                >
                  <FileCheck className="w-4 h-4" />
                  تسليم الحل ومتابعة التكليف
                </Link>
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