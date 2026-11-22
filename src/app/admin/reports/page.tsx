"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  GraduationCap,
  CalendarCheck,
  FileCheck2,
  TrendingUp,
  Download,
  Filter,
  ShieldAlert,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { MOCK_USERS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function AdminReportsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const admin = MOCK_USERS.admin;

  return (
    <div className="min-h-screen bg-background pb-12 flex flex-col">
      <AppHeader
        user={admin}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={admin}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-cyan text-background flex items-center justify-center font-bold shadow-glow">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">التقارير والمؤشرات الأكاديمية الشاملة</h1>
              <p className="text-xs text-muted">
                إحصائيات إدارية حية لثانوية مدرستي — الفصل الدراسي الأول 2026-2027
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert("تم تصدير التقرير بصيغة PDF بنجاح!")}
              className="px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-xs font-semibold text-brand-cyan flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              تصدير كـ PDF
            </button>
          </div>
        </div>

        {/* Key KPI Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-card space-y-2">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>إجمالي الطلاب المسجلين</span>
              <Users className="w-4 h-4 text-brand-cyan" />
            </div>
            <span className="block text-2xl font-black text-foreground">240</span>
            <span className="text-[11px] text-brand-teal flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12 طالب هذا الفصل
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-surface border border-border shadow-card space-y-2">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>نسبة الحضور المدرسية</span>
              <CalendarCheck className="w-4 h-4 text-brand-teal" />
            </div>
            <span className="block text-2xl font-black text-brand-teal">95.2%</span>
            <span className="text-[11px] text-muted">
              معدل غياب منخفض جداً
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-surface border border-border shadow-card space-y-2">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>تسليم التكاليف والأنشطة</span>
              <FileCheck2 className="w-4 h-4 text-status-warning" />
            </div>
            <span className="block text-2xl font-black text-status-warning">91.8%</span>
            <span className="text-[11px] text-muted">
              438 تكليف تم تسليمه
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-surface border border-border shadow-card space-y-2">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>متوسط درجات الطلاب العام</span>
              <GraduationCap className="w-4 h-4 text-purple-400" />
            </div>
            <span className="block text-2xl font-black text-purple-400">86.4%</span>
            <span className="text-[11px] text-brand-teal">
              تقدير عام: ممتاز
            </span>
          </div>
        </div>

        {/* Attendance Rates by Grade Level */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-card space-y-5">
          <h3 className="text-base font-bold text-foreground">
            مؤشر الالتزام بالحضور حسب المراحل الدراسية:
          </h3>

          <div className="space-y-4 text-xs">
            {/* Grade 1 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="text-foreground">الأول الثانوي (عام - الشعب 1 و 2)</span>
                <span className="text-brand-teal">96.0%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-secondary overflow-hidden">
                <div className="h-full bg-brand-teal rounded-full" style={{ width: "96%" }}></div>
              </div>
            </div>

            {/* Grade 2 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="text-foreground">الثاني الثانوي (علمي وأدبي)</span>
                <span className="text-brand-cyan">94.0%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-secondary overflow-hidden">
                <div className="h-full bg-brand-cyan rounded-full" style={{ width: "94%" }}></div>
              </div>
            </div>

            {/* Grade 3 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="text-foreground">الثالث الثانوي (الشهادة الثانوية - علمي وأدبي)</span>
                <span className="text-brand-teal">95.6%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-secondary overflow-hidden">
                <div className="h-full bg-brand-teal rounded-full" style={{ width: "95.6%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Students Leaderboard */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-status-warning" />
              أوائل الطلاب المتفوقين في التقييمات والاختبارات:
            </h3>
            <span className="text-xs text-brand-cyan font-bold">الفصل الأول</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-surface-secondary/60 border border-brand-teal/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-brand-teal text-background flex items-center justify-center font-black text-xs">
                  1
                </span>
                <span className="text-xs font-black text-brand-teal">99.2%</span>
              </div>
              <h4 className="text-xs font-bold text-foreground">سارة خالد الكثيري</h4>
              <span className="text-[11px] text-muted block">ثالث ثانوي • علمي 1</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-secondary/60 border border-brand-cyan/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-brand-cyan text-background flex items-center justify-center font-black text-xs">
                  2
                </span>
                <span className="text-xs font-black text-brand-cyan">98.5%</span>
              </div>
              <h4 className="text-xs font-bold text-foreground">عمر أحمد بافضل</h4>
              <span className="text-[11px] text-muted block">ثالث ثانوي • علمي 1</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-secondary/60 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-surface text-foreground flex items-center justify-center font-black text-xs border border-border">
                  3
                </span>
                <span className="text-xs font-black text-foreground">97.8%</span>
              </div>
              <h4 className="text-xs font-bold text-foreground">ريم علي العمودي</h4>
              <span className="text-[11px] text-muted block">ثالث ثانوي • علمي 1</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
