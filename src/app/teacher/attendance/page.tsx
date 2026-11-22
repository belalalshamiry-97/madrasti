"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  X,
  Clock,
  FileQuestion,
  Save,
  CheckCircle2,
  Calendar,
  Users,
  Search,
  Filter,
  CheckCheck,
  ChevronRight,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS, MOCK_ATTENDANCE_STUDENTS } from "@/lib/mock-data";
import { AttendanceRecord } from "@/types/database.types";
import { cn } from "@/lib/utils";

export default function TeacherAttendancePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const teacher = MOCK_USERS.teacher1;

  const [selectedDate, setSelectedDate] = useState("2026-11-22");
  const [records, setRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE_STUDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const handleStatusChange = (
    studentId: string,
    newStatus: "present" | "absent" | "late" | "excused"
  ) => {
    setRecords((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, status: newStatus } : r))
    );
  };

  const handleMarkAllPresent = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: "present" })));
  };

  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    const excused = records.filter((r) => r.status === "excused").length;
    const rate = total > 0 ? Math.round(((present + late * 0.8) / total) * 100) : 0;
    return { total, present, absent, late, excused, rate };
  }, [records]);

  const filteredRecords = records.filter((r) =>
    r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.student_number.includes(searchQuery)
  );

  const handleSaveAttendance = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader
        user={teacher}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={teacher}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-teal text-background flex items-center justify-center font-bold shadow-glow">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">كشف التحضير والغياب اليومي</h1>
              <p className="text-xs text-muted">
                إدارة الحضور لشعبة الثالث الثانوي (علمي 1) — مادة إدارة الشبكات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="px-3 py-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-xs font-semibold text-brand-teal flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              تحضير الكل كحاضر
            </button>
            <button
              onClick={handleSaveAttendance}
              className="px-4 py-2 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center gap-1.5 hover:brightness-110 shadow-glow transition-all"
            >
              <Save className="w-4 h-4" />
              {isSaved ? "تم الحفظ بنجاح!" : "حفظ الكشف"}
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {isSaved && (
          <div className="p-4 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>تم حفظ واعتماد كشف الحضور والغياب بنجاح في قاعدة البيانات وتحديث سجلات الطلاب.</span>
          </div>
        )}

        {/* Date and Section Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-surface border border-border shadow-card text-xs">
          <div>
            <label className="block text-muted mb-1">المادة والشعبة:</label>
            <span className="font-bold text-foreground block text-sm">
              إدارة الشبكات • ثالث ثانوي (علمي - 1)
            </span>
          </div>
          <div>
            <label className="block text-muted mb-1">تاريخ الحصة:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold text-xs focus:outline-none focus:border-brand-cyan"
            />
          </div>
          <div>
            <label className="block text-muted mb-1">نسبة الحضور المسجلة:</label>
            <span className="font-bold text-brand-teal block text-sm">
              %{stats.rate} من إجمالي {stats.total} طلاب
            </span>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted block">حاضر</span>
              <span className="text-xl font-black text-brand-teal">{stats.present}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center font-bold">
              <Check className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted block">غائب</span>
              <span className="text-xl font-black text-status-danger">{stats.absent}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-status-danger/15 text-status-danger flex items-center justify-center font-bold">
              <X className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted block">متأخر</span>
              <span className="text-xl font-black text-status-warning">{stats.late}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-status-warning/15 text-status-warning flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted block">بعذر</span>
              <span className="text-xl font-black text-brand-cyan">{stats.excused}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center font-bold">
              <FileQuestion className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم الطالب أو الرقم المدرسي..."
            className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan"
          />
        </div>

        {/* Student Attendance List */}
        <div className="p-4 sm:p-6 rounded-3xl bg-surface border border-border shadow-card space-y-3">
          <div className="hidden sm:grid sm:grid-cols-12 text-xs font-bold text-muted pb-3 border-b border-border">
            <span className="col-span-5">اسم الطالب والرقم المدرسي</span>
            <span className="col-span-4 text-center">حالة الحضور</span>
            <span className="col-span-3 text-left">ملاحظات</span>
          </div>

          <div className="space-y-3">
            {filteredRecords.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-surface-secondary/50 border border-border/80 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-3 transition-colors hover:border-brand-cyan/30"
              >
                {/* Student Info */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-surface text-brand-cyan flex items-center justify-center font-bold text-xs border border-border shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      {item.student_name}
                    </h4>
                    <span className="text-[11px] text-muted" dir="ltr">
                      #{item.student_number}
                    </span>
                  </div>
                </div>

                {/* 4-State Toggle Buttons */}
                <div className="col-span-4 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.student_id, "present")}
                    className={cn(
                      "px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                      item.status === "present"
                        ? "bg-brand-teal text-background shadow-glow"
                        : "bg-surface hover:bg-surface-secondary text-muted"
                    )}
                  >
                    حاضر
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.student_id, "absent")}
                    className={cn(
                      "px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                      item.status === "absent"
                        ? "bg-status-danger text-background shadow-glow"
                        : "bg-surface hover:bg-surface-secondary text-muted"
                    )}
                  >
                    غائب
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.student_id, "late")}
                    className={cn(
                      "px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                      item.status === "late"
                        ? "bg-status-warning text-background shadow-glow"
                        : "bg-surface hover:bg-surface-secondary text-muted"
                    )}
                  >
                    متأخر
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.student_id, "excused")}
                    className={cn(
                      "px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                      item.status === "excused"
                        ? "bg-brand-cyan text-background shadow-glow"
                        : "bg-surface hover:bg-surface-secondary text-muted"
                    )}
                  >
                    بعذر
                  </button>
                </div>

                {/* Notes Column */}
                <div className="col-span-3 text-left">
                  {item.notes ? (
                    <span className="text-[11px] text-muted block truncate" title={item.notes}>
                      {item.notes}
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted/50">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNavigation user={teacher} />
    </div>
  );
}
