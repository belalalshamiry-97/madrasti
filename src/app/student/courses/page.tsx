"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Calendar, BookOpen, Layers } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { CourseCard } from "@/components/courses/CourseCard";
import { getActiveUser } from "@/lib/user-store";
import { getStudentCoursesFromDB } from "@/lib/services/academic-service";

export default function StudentCoursesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      const active = getActiveUser("STUDENT");
      setStudent(active);

      try {
        const studentId = active?.id || active?.username;
        if (studentId) {
          const dbCourses = await getStudentCoursesFromDB(studentId);
          setCourses(dbCourses || []);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error("Error loading student courses from DB:", err);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, []);

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
      <AppHeader
        user={student}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={student}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Top Header with Back Button */}
        <div className="flex items-center justify-between">
          <Link
            href="/student"
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">مقرراتي الدراسية</h1>
            <p className="text-xs text-brand-cyan mt-0.5">
              {student?.grade || "المرحلة الثانوية"} {student?.section ? `• ${student.section}` : ""}
            </p>
          </div>
          <div className="w-6" />
        </div>

        {/* Semester Selector Pill */}
        <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-cyan" />
            <span className="text-muted">الفصل الدراسي:</span>
            <span className="font-bold text-foreground">20261 • الحالي</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Layers className="w-3.5 h-3.5 text-brand-teal" />
            <span>عدد المواد المسندة لشعبتك: <strong>{studentCourses.length}</strong></span>
          </div>
        </div>

        {/* Courses Cards List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-8 rounded-3xl bg-surface border border-border text-center text-muted text-xs">
              جاري تحميل المقررات المسندة لشعبتك الدراسية من قاعدة البيانات...
            </div>
          ) : studentCourses.length === 0 ? (
            <div className="p-8 rounded-3xl bg-surface border border-border text-center text-muted text-xs">
              لا توجد مقررات دراسية مسندة لشعبتك الدراسية حالياً. يرجى مراجعة إدارة المدرسة للتأكد من تسجيلك في الشعبة.
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
      </main>

      <BottomNavigation user={student} />
    </div>
  );
}
