"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, Calendar, BookOpen } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { CourseCard } from "@/components/courses/CourseCard";
import { MOCK_USERS, MOCK_COURSES } from "@/lib/mock-data";

export default function StudentCoursesPage() {
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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Top Header with Back Button (matching screenshot 3) */}
        <div className="flex items-center justify-between">
          <Link
            href="/student"
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">مقرراتي</h1>
          <div className="w-6" />
        </div>

        {/* Semester Selector Pill (matching screenshot 3) */}
        <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-cyan" />
            <span className="text-muted">اختر الفصل الدراسي:</span>
            <span className="font-bold text-foreground">20261 • الحالي</span>
          </div>
          <span className="text-xs text-brand-cyan font-semibold">تغيير</span>
        </div>

        {/* Courses Cards List */}
        <div className="space-y-3">
          {MOCK_COURSES.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              basePath="/student/courses"
            />
          ))}
        </div>
      </main>

      <BottomNavigation user={student} />
    </div>
  );
}
