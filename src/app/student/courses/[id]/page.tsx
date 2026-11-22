"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  FileText,
  FileCheck,
  MessageCircle,
  FolderOpen,
  GitBranch,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { StatusBadge } from "@/components/common/StatusBadge";
import { MOCK_USERS, MOCK_COURSES, MOCK_LESSONS } from "@/lib/mock-data";

export default function CourseJourneyPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const student = MOCK_USERS.student1;
  const params = useParams();
  const courseId = params?.id as string;

  const course =
    MOCK_COURSES.find((c) => c.id === courseId) || MOCK_COURSES[0];

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
        {/* Top Header with Back Button (matching screenshot 4) */}
        <div className="flex items-center justify-between">
          <Link
            href="/student/courses"
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">
            {course.subject?.name}
          </h1>
          <div className="w-6" />
        </div>

        {/* Hero Course Banner (matching screenshot 4 top card) */}
        <div className="rounded-3xl bg-gradient-to-tr from-brand-blue to-brand-cyan p-5 sm:p-6 text-background shadow-glow relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-background">
              {course.subject?.name}
            </h2>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-background/20 text-background backdrop-blur">
                نظري
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-background/20 text-background backdrop-blur">
                20261 • الفصل
              </span>
            </div>
          </div>

          {/* 4 Stat Pills */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-background/15 backdrop-blur p-2.5 sm:p-3 rounded-2xl text-center">
              <span className="block text-lg sm:text-2xl font-black">4</span>
              <span className="text-[11px] sm:text-xs font-medium opacity-90">
                المحاضرات
              </span>
            </div>
            <div className="bg-background/15 backdrop-blur p-2.5 sm:p-3 rounded-2xl text-center">
              <span className="block text-lg sm:text-2xl font-black">0</span>
              <span className="text-[11px] sm:text-xs font-medium opacity-90">
                الوسائط
              </span>
            </div>
            <div className="bg-background/15 backdrop-blur p-2.5 sm:p-3 rounded-2xl text-center">
              <span className="block text-lg sm:text-2xl font-black">4</span>
              <span className="text-[11px] sm:text-xs font-medium opacity-90">
                التكاليف
              </span>
            </div>
            <div className="bg-background/15 backdrop-blur p-2.5 sm:p-3 rounded-2xl text-center">
              <span className="block text-lg sm:text-2xl font-black">0</span>
              <span className="text-[11px] sm:text-xs font-medium opacity-90">
                المراجع
              </span>
            </div>
          </div>
        </div>

        {/* Course Journey Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-foreground">رحلة المقرر</h3>
          </div>
          <span className="text-xs text-muted font-bold px-2 py-0.5 rounded-md bg-surface border border-border">
            4
          </span>
        </div>

        {/* Timeline View (matching screenshot 4) */}
        <div className="relative pr-6">
          {/* Vertical Connecting Line on Right (RTL) */}
          <div className="absolute top-6 bottom-6 right-[17px] w-0.5 bg-brand-cyan/40" />

          <div className="space-y-4">
            {MOCK_LESSONS.map((lesson) => (
              <div key={lesson.id} className="relative flex items-center gap-4">
                {/* Timeline Circle Node */}
                <div className="relative z-10 w-9 h-9 rounded-full bg-surface border-2 border-brand-cyan flex items-center justify-center text-brand-cyan font-black text-sm shrink-0 shadow-glow">
                  {lesson.lesson_number}
                </div>

                {/* Lesson Card */}
                <Link
                  href={`/student/courses/${course.id}/lessons/${lesson.id}`}
                  className="flex-1 p-4 rounded-2xl bg-surface hover:bg-surface-secondary border border-border hover:border-brand-cyan/40 transition-all shadow-card group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-foreground group-hover:text-brand-cyan transition-colors">
                        {lesson.title}
                      </h4>

                      {/* Date & Time pill */}
                      {lesson.published_at && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-xl bg-surface-secondary text-xs text-muted">
                          <Clock className="w-3.5 h-3.5 text-brand-cyan" />
                          <span>{lesson.published_at}</span>
                        </div>
                      )}
                    </div>

                    <ChevronLeft className="w-5 h-5 text-muted group-hover:text-brand-cyan group-hover:-translate-x-1 transition-all mt-1" />
                  </div>

                  {/* Micro Counters Row (matching screenshot 4) */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1 text-brand-teal">
                      <Calendar className="w-3.5 h-3.5" />
                      {lesson.sessions_count || 1}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {lesson.questions_count || 0}
                    </span>
                    <span className="flex items-center gap-1 text-status-warning">
                      <FileCheck className="w-3.5 h-3.5" />
                      {lesson.assignments_count || 1}
                    </span>
                    <span className="flex items-center gap-1 text-brand-cyan">
                      <FileText className="w-3.5 h-3.5" />
                      {lesson.materials_count || 0}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNavigation user={student} />
    </div>
  );
}