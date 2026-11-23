"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  PlusCircle,
  FileText,
  Users,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { MOCK_USERS } from "@/lib/mock-data";
import { getActiveUser } from "@/lib/user-store";
import { getStoredSubjects, SubjectAssignment } from "@/lib/academic-store";
import { getTeacherCoursesFromDB } from "@/lib/services/academic-service";

export default function TeacherCoursesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(MOCK_USERS.teacher1);
  const [assignedCourses, setAssignedCourses] = useState<SubjectAssignment[]>([]);

  useEffect(() => {
    const active = getActiveUser("TEACHER");
    setCurrentTeacher(active);

    async function loadCourses() {
      try {
        const dbCourses = await getTeacherCoursesFromDB(active.id || active.username);
        if (dbCourses && dbCourses.length > 0) {
          setAssignedCourses(
            dbCourses.map((c: any) => ({
              id: c.id,
              name: c.name,
              code: c.code,
              type: c.subject_type === "practical" ? "practical" : "theory",
              grade: c.grade,
              section: c.section,
              teacherName: active.full_name,
            }))
          );
          return;
        }
      } catch (err) {
        console.warn("Falling back to local teacher courses:", err);
      }

      // Fallback
      const all = getStoredSubjects();
      const assigned = all.filter(
        (s) =>
          s.teacherName.toLowerCase().includes(active.full_name.toLowerCase()) ||
          active.full_name.toLowerCase().includes(s.teacherName.toLowerCase())
      );

      if (assigned.length > 0) {
        setAssignedCourses(assigned);
      } else {
        if (active.username === "teacher1" || active.full_name.includes("بلال")) {
          setAssignedCourses(all.filter((s) => s.teacherName.includes("بلال")));
        } else if (active.username === "teacher2" || active.full_name.includes("فاطمة")) {
          setAssignedCourses(all.filter((s) => s.teacherName.includes("فاطمة")));
        }
      }
    }

    loadCourses();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader user={currentTeacher} onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={currentTeacher} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Breadcrumb */}
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
                <BookOpen className="w-6 h-6 text-brand-teal" />
                مقرراتي المسندة والتدريس
              </h1>
              <p className="text-xs text-muted">
                قائمة المواد المسندة إليك رسمياً من إدارة المدرسة وإدارة الدروس والمحاضرات
              </p>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedCourses.length === 0 ? (
            <div className="col-span-2 p-12 text-center rounded-3xl bg-surface border border-border space-y-3">
              <BookOpen className="w-12 h-12 text-brand-teal mx-auto opacity-40" />
              <h3 className="text-base font-bold text-foreground">لا توجد مواد مسندة إليك حالياً</h3>
              <p className="text-xs text-muted">
                يرجى التواصل مع مدير المدرسة لإسناد المقررات الدراسية الخاصة بك من لوحة الإدارة.
              </p>
            </div>
          ) : (
            assignedCourses.map((course) => (
              <div
                key={course.id}
                className="p-5 rounded-3xl bg-surface border border-border hover:border-brand-teal/40 shadow-card transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-teal/15 text-brand-teal flex items-center justify-center font-bold">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">{course.name}</h3>
                      <span className="text-xs text-brand-cyan font-mono">{course.code}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-secondary border border-border text-foreground">
                    {course.type === "theory" ? "نظري" : "عملي"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-surface-secondary/60 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted">الصف المستهدف:</span>
                    <span className="font-bold text-foreground">{course.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">الشعبة الدراسية:</span>
                    <span className="font-bold text-brand-teal">{course.section}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <Link
                    href={`/teacher/courses/${course.id}/lessons`}
                    className="px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>إدارة الدروس</span>
                  </Link>

                  <Link
                    href={`/teacher/courses/${course.id}/lessons/new`}
                    className="px-4 py-2 rounded-xl bg-brand-teal text-background text-xs font-bold flex items-center gap-1.5 shadow-glow hover:brightness-110 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>إضافة درس جديد</span>
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
