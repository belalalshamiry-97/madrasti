"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Calendar, BookOpen, Layers } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { CourseCard } from "@/components/courses/CourseCard";
import { MOCK_USERS } from "@/lib/mock-data";
import { getActiveUser } from "@/lib/user-store";
import { getSubjectsForGrade, SubjectAssignment } from "@/lib/academic-store";

export default function StudentCoursesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [student, setStudent] = useState(MOCK_USERS.student1);
  const [studentSubjects, setStudentSubjects] = useState<SubjectAssignment[]>([]);

  useEffect(() => {
    const active = getActiveUser("STUDENT");
    setStudent(active);

    const grade = active.grade || "الثالث الثانوي";
    const subjects = getSubjectsForGrade(grade);
    setStudentSubjects(subjects);
  }, []);

  const studentCourses = studentSubjects.map((s) => ({
    id: `80000000-0000-0000-0000-000000000001`,
    section_id: `sec-${s.grade}`,
    subject_id: s.id,
    teacher_id: `t-${s.teacherName}`,
    semester_id: "20261",
    subject: {
      id: s.id,
      name: s.name,
      code: s.code,
      subject_type: s.type,
      icon_name: s.name.includes("شبكات")
        ? "Network"
        : s.name.includes("أمنية")
        ? "ShieldCheck"
        : s.name.includes("برمجة") || s.name.includes("حاسوب")
        ? "Code2"
        : "Calculator",
    },
    teacher: {
      id: `t-${s.teacherName}`,
      role: "TEACHER" as const,
      full_name: s.teacherName,
      username: s.teacherName.replace(/\s+/g, ""),
      is_active: true,
      created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z",
    },
    lessons_count: 4,
    assignments_count: 3,
    progress_percentage: 75,
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
              {student.grade || "الثالث الثانوي"} • {student.section || "الشعبة (أ)"}
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
            <span>عدد المواد المسندة لصفك: <strong>{studentCourses.length}</strong></span>
          </div>
        </div>

        {/* Courses Cards List */}
        <div className="space-y-3">
          {studentCourses.length === 0 ? (
            <div className="p-8 rounded-3xl bg-surface border border-border text-center text-muted text-xs">
              لا توجد مقررات دراسية مسندة لصفك الدراسي حالياً. يرجى مراجعة إدارة المدرسة.
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
