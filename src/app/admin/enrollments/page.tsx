"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Users,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRightLeft,
  UserCheck,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS } from "@/lib/mock-data";

export default function AdminEnrollmentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const admin = MOCK_USERS.admin;

  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([
    { id: "1", name: "عمر أحمد بافضل", username: "student1", grade: "الثالث الثانوي", track: "علمي", section: "الشعبة (أ)", status: "active" },
    { id: "2", name: "سارة خالد الكثيري", username: "student2", grade: "الثالث الثانوي", track: "علمي", section: "الشعبة (أ)", status: "active" },
    { id: "3", name: "محمد ياسين اليافعي", username: "student3", grade: "الثالث الثانوي", track: "علمي", section: "الشعبة (ب)", status: "active" },
    { id: "4", name: "أروى عبد الله بارحيم", username: "student4", grade: "الثاني الثانوي", track: "أدبي", section: "الشعبة (أ)", status: "active" },
    { id: "5", name: "خالد سعيد العامري", username: "student5", grade: "الأول الثانوي", track: "عام", section: "الشعبة (أ)", status: "active" },
    { id: "6", name: "فاطمة سالم باوزير", username: "student6", grade: "الأول الثانوي", track: "عام", section: "الشعبة (ب)", status: "active" },
  ]);

  const filtered = students.filter(
    (s) =>
      s.name.includes(searchTerm) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReassign = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextSec = s.section === "الشعبة (أ)" ? "الشعبة (ب)" : "الشعبة (أ)";
          return { ...s, section: nextSec };
        }
        return s;
      })
    );
  };

  const handleCsvImport = () => {
    alert("محاكاة استيراد ملف CSV: تم استيراد 18 طالباً وتوزيعهم على الشعب الدراسية بنجاح!");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader
        user={admin}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={admin}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">
              تسجيل وقيد الطلاب بالشعب
            </h1>
            <p className="text-xs text-brand-cyan mt-0.5">
              توزيع الطلاب على الشعب للفصل الحالي 20261
            </p>
          </div>
          <button
            onClick={handleCsvImport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-secondary hover:bg-surface text-foreground text-xs font-semibold border border-border transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-teal" />
            <span className="hidden sm:inline">استيراد CSV</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="البحث باسم الطالب أو رقم القيد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 rounded-2xl bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-brand-cyan placeholder-muted/60"
          />
        </div>

        {/* Students Table */}
        <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden">
          <div className="p-5 border-b border-border/80 flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-cyan" />
              الطلاب المقيدون
            </h3>
            <span className="text-xs text-muted font-bold">
              {filtered.length} طلاب مسجلين
            </span>
          </div>

          <div className="divide-y divide-border/60">
            {filtered.map((student) => (
              <div
                key={student.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-secondary border border-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold text-sm shrink-0">
                    {student.name.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {student.name}
                    </h4>
                    <span className="text-xs text-muted">
                      رقم القيد: <strong className="text-foreground">{student.username}</strong> • {student.grade} ({student.track})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs self-end sm:self-auto">
                  <span className="px-3 py-1 rounded-xl bg-surface-secondary border border-border font-bold text-brand-cyan">
                    {student.section}
                  </span>

                  <button
                    onClick={() => handleReassign(student.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground font-semibold transition-colors"
                    title="نقل إلى شعبة أخرى"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-brand-teal" />
                    <span>تبديل الشعبة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNavigation user={admin} />
    </div>
  );
}