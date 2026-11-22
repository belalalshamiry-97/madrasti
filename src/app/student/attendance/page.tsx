"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Calendar,
  AlertCircle,
  FileCheck,
  ChevronRight,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function StudentAttendancePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const student = MOCK_USERS.student1;

  const logs = [
    {
      date: "2026/11/22",
      subject: "إدارة الشبكات",
      status: "present",
      statusLabel: "حاضر",
      notes: "تم التحضير في الوقت المحدد",
    },
    {
      date: "2026/11/20",
      subject: "أمنية النظم والشبكات",
      status: "present",
      statusLabel: "حاضر",
      notes: "حضور كامل المحاضرة",
    },
    {
      date: "2026/11/17",
      subject: "إدارة الشبكات",
      status: "late",
      statusLabel: "متأخر 10 دقائق",
      notes: "تأخر مروري معتمد",
    },
    {
      date: "2026/11/13",
      subject: "رياضيات متقدمة",
      status: "present",
      statusLabel: "حاضر",
      notes: "حضور نشط ومشاركة",
    },
  ];

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
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">سجل الحضور والغياب الأكاديمي</h1>
              <p className="text-xs text-muted">
                الفصل الدراسي الأول • العام الأكاديمي 2026-2027
              </p>
            </div>
          </div>
        </div>

        {/* Attendance KPI Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-right">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-teal/20 text-brand-teal">
              التزام أكاديمي ممتاز
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              نسبة الحضور العامة: 97.5%
            </h2>
            <p className="text-xs text-muted max-w-md">
              أنت ملتزم بنسبة تتجاوز الحد الأدنى المطلوب للامتحانات (85%). استمر في هذا الأداء الرائع!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full sm:w-auto text-center text-xs">
            <div className="p-3.5 rounded-2xl bg-surface-secondary border border-border">
              <span className="text-muted block text-[11px]">حضور</span>
              <span className="text-lg font-black text-brand-teal block mt-0.5">38</span>
              <span className="text-[10px] text-muted">حصة</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-secondary border border-border">
              <span className="text-muted block text-[11px]">تأخر</span>
              <span className="text-lg font-black text-status-warning block mt-0.5">1</span>
              <span className="text-[10px] text-muted">حصة</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-secondary border border-border">
              <span className="text-muted block text-[11px]">غياب</span>
              <span className="text-lg font-black text-status-danger block mt-0.5">0</span>
              <span className="text-[10px] text-muted">حصة</span>
            </div>
          </div>
        </div>

        {/* Detailed Timeline Log */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-foreground">
            سجل الجلسات الأخيرة:
          </h3>

          <div className="space-y-3">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                      log.status === "present"
                        ? "bg-brand-teal/15 text-brand-teal"
                        : "bg-status-warning/15 text-status-warning"
                    )}
                  >
                    {log.status === "present" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      {log.subject}
                    </h4>
                    <span className="text-[11px] text-muted block mt-0.5">
                      {log.notes}
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[11px] font-bold block mb-1 text-center",
                      log.status === "present"
                        ? "bg-brand-teal/20 text-brand-teal"
                        : "bg-status-warning/20 text-status-warning"
                    )}
                  >
                    {log.statusLabel}
                  </span>
                  <span className="text-[11px] text-muted block" dir="ltr">
                    {log.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNavigation user={student} />
    </div>
  );
}
