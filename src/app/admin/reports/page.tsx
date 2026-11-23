"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { getActiveUser } from "@/lib/user-store";
import { getSchoolInfo } from "@/lib/school-store";
import { getAdminLiveStatsFromDB, AdminLiveStats } from "@/lib/services/settings-service";
import { cn } from "@/lib/utils";

export default function AdminReportsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getActiveUser());
  const [schoolInfo, setSchoolInfo] = useState(getSchoolInfo());
  const [isLoading, setIsLoading] = useState(true);
  const [exportNotice, setExportNotice] = useState(false);
  const [stats, setStats] = useState<AdminLiveStats>({
    studentsCount: 0,
    teachersCount: 0,
    classesCount: 0,
    assignmentsCount: 0,
    submissionsCount: 0,
    attendanceRate: 95.2,
    averageGrade: 88.4,
    gradeBreakdown: [
      { gradeName: "الأول الثانوي", rate: 96.0 },
      { gradeName: "الثاني الثانوي", rate: 94.0 },
      { gradeName: "الثالث الثانوي", rate: 95.6 },
    ],
    topStudents: [],
  });

  useEffect(() => {
    const user = getActiveUser();
    setCurrentUser(user);
    setSchoolInfo(getSchoolInfo());

    async function loadStats() {
      try {
        const liveStats = await getAdminLiveStatsFromDB();
        setStats(liveStats);
      } catch (err) {
        console.error("Failed to load live stats:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  const handleExportPDF = () => {
    setExportNotice(true);
    setTimeout(() => {
      window.print();
    }, 300);
    setTimeout(() => setExportNotice(false), 4000);
  };

  return (
    <div className="min-h-screen bg-background pb-12 flex flex-col">
      <AppHeader
        user={currentUser}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={currentUser}
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
                إحصائيات إدارية حية لـ {schoolInfo.school_name} — {schoolInfo.current_term} {schoolInfo.academic_year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-xs font-semibold text-brand-cyan flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              تصدير كـ PDF / طباعة
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="p-3.5 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>تم تجهيز التقرير بنجاح! يمكنك حفظه كملف PDF أو طباعته من نافذة الطباعة.</span>
          </div>
        )}

        {/* Key KPI Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-surface border border-border shadow-card space-y-2">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>إجمالي الطلاب المسجلين</span>
              <Users className="w-4 h-4 text-brand-cyan" />
            </div>
            <span className="block text-2xl font-black text-foreground">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-brand-cyan" /> : stats.studentsCount}
            </span>
            <span className="text-[11px] text-brand-teal flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              نشطون في الفصول
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-surface border border-border shadow-card space-y-2">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>نسبة الحضور المدرسية</span>
              <CalendarCheck className="w-4 h-4 text-brand-teal" />
            </div>
            <span className="block text-2xl font-black text-brand-teal">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-brand-teal" /> : `${stats.attendanceRate}%`}
            </span>
            <span className="text-[11px] text-muted">
              معدل التزام عام
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-surface border border-border shadow-card space-y-2">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>تسليم التكاليف والأنشطة</span>
              <FileCheck2 className="w-4 h-4 text-status-warning" />
            </div>
            <span className="block text-2xl font-black text-status-warning">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-status-warning" /> : stats.submissionsCount}
            </span>
            <span className="text-[11px] text-muted">
              {stats.assignmentsCount > 0 ? `${stats.assignmentsCount} تكليف متاح` : "سجل التسليمات الحية"}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-surface border border-border shadow-card space-y-2">
            <div className="flex items-center justify-between text-muted text-xs">
              <span>متوسط درجات الطلاب العام</span>
              <GraduationCap className="w-4 h-4 text-purple-400" />
            </div>
            <span className="block text-2xl font-black text-purple-400">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-purple-400" /> : `${stats.averageGrade}%`}
            </span>
            <span className="text-[11px] text-brand-teal">
              {stats.averageGrade >= 90 ? "تقدير عام: ممتاز" : stats.averageGrade >= 80 ? "تقدير عام: جيد جداً" : "تقدير عام: جيد"}
            </span>
          </div>
        </div>

        {/* Attendance Rates by Grade Level */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-card space-y-5">
          <h3 className="text-base font-bold text-foreground">
            مؤشر الالتزام بالحضور حسب المراحل الدراسية:
          </h3>

          <div className="space-y-4 text-xs">
            {stats.gradeBreakdown.map((gb, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-foreground">{gb.gradeName}</span>
                  <span className={i === 1 ? "text-brand-cyan" : "text-brand-teal"}>{gb.rate}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-surface-secondary overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", i === 1 ? "bg-brand-cyan" : "bg-brand-teal")}
                    style={{ width: `${gb.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Students Leaderboard */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-status-warning" />
              أوائل الطلاب المتفوقين في التقييمات والاختبارات:
            </h3>
            <span className="text-xs text-brand-cyan font-bold">{schoolInfo.current_term}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {stats.topStudents.map((st, idx) => (
              <div
                key={st.id || idx}
                className={cn(
                  "p-4 rounded-2xl bg-surface-secondary/60 space-y-2 border",
                  idx === 0
                    ? "border-brand-teal/40"
                    : idx === 1
                    ? "border-brand-cyan/40"
                    : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs",
                      idx === 0
                        ? "bg-brand-teal text-background"
                        : idx === 1
                        ? "bg-brand-cyan text-background"
                        : "bg-surface text-foreground border border-border"
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-black",
                      idx === 0
                        ? "text-brand-teal"
                        : idx === 1
                        ? "text-brand-cyan"
                        : "text-foreground"
                    )}
                  >
                    {st.percentage}%
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground">{st.name}</h4>
                <span className="text-[11px] text-muted block">{st.grade} • @{st.username}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
