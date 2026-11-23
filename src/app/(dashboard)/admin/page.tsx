"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Percent,
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  Settings,
  ShieldCheck,
  Megaphone,
  FileSpreadsheet,
  Activity,
  UserPlus,
  ShieldAlert,
  Shield,
  BarChart3,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { MOCK_USERS, MOCK_SCHOOL_SETTINGS } from "@/lib/mock-data";
import { getActiveUser } from "@/lib/user-store";
import { getSchoolInfo } from "@/lib/school-store";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<string>("ADMIN");
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [admin, setAdmin] = useState(MOCK_USERS.admin);
  const [schoolName, setSchoolName] = useState(MOCK_SCHOOL_SETTINGS.school_name);

  useEffect(() => {
    // Check session role from cookies
    const match = document.cookie.match(new RegExp("(^| )madrasti_session_role=([^;]+)"));
    const role = match ? match[2] : "ADMIN";
    setCurrentRole(role);
    if (role !== "ADMIN") {
      setIsAuthorized(false);
    } else {
      const active = getActiveUser("ADMIN");
      if (active.role === "ADMIN") setAdmin(active);
      const info = getSchoolInfo();
      setSchoolName(info.school_name);
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-status-danger/15 text-status-danger flex items-center justify-center mb-4">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-2">
          غير مصرح بالدخول (Access Denied)
        </h1>
        <p className="text-sm text-muted max-w-md mb-6 leading-relaxed">
          هذه الواجهة مخصصة حصراً لمدير المدرسة ولأصحاب الصلاحيات الإدارية المعتمدة.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 rounded-xl bg-brand-cyan text-background text-sm font-bold shadow-glow"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Admin Welcome Banner */}
        <section className="rounded-3xl bg-gradient-to-l from-surface via-surface-secondary to-surface p-5 sm:p-7 border border-border shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-status-warning/15 text-status-warning border border-status-warning/30">
                  الإدارة العامة للمدرسة
                </span>
                <span className="text-xs text-muted">
                  {schoolName}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                لوحة إدارة المنصة — {admin.full_name} 🛡️
              </h1>
              <p className="text-sm text-muted mt-1">
                إدارة الحسابات، المواد الدراسية، الشعب، والصلاحيات الأكاديمية للمدرسة.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/enrollments"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface text-foreground text-xs font-semibold border border-border transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-brand-teal" />
                تسجيل الطلاب
              </Link>
              <Link
                href="/admin/reports"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface text-foreground text-xs font-semibold border border-border transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-purple-400" />
                التقارير والمؤشرات
              </Link>
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-status-warning/20 border border-status-warning/40 text-status-warning text-xs font-bold hover:bg-status-warning/30 transition-all">
                <Shield className="w-4 h-4" />
                إدارة الصلاحيات والمستخدمين
              </Link>
              <Link
                href="/admin/classes"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-cyan text-background text-xs font-bold hover:opacity-90 shadow-glow transition-all"
              >
                <UserPlus className="w-4 h-4" />
                إدارة الصفوف والشعب
              </Link>
            </div>
          </div>
        </section>

        {/* Global Statistics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">الطلاب المقيدون</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">180</span>
              <Users className="w-5 h-5 text-brand-cyan" />
            </div>
            <span className="text-[11px] text-brand-cyan mt-1 block">
              100% حسابات نشطة
            </span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">الكادر التعليمي</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">14</span>
              <GraduationCap className="w-5 h-5 text-brand-teal" />
            </div>
            <span className="text-[11px] text-brand-teal mt-1 block">
              معلمون معتمدون
            </span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">الصفوف والشعب</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">6</span>
              <Layers className="w-5 h-5 text-status-warning" />
            </div>
            <span className="text-[11px] text-muted mt-1 block">
              3 صفوف ثانوية
            </span>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border">
            <span className="text-xs text-muted block mb-1">المقررات النشطة</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">12</span>
              <BookOpen className="w-5 h-5 text-brand-cyan" />
            </div>
            <span className="text-[11px] text-brand-cyan mt-1 block">
              مسندة ومجدولة
            </span>
          </div>
        </section>

        {/* Management Modules Grid */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">أقسام إدارة المنصة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/enrollments"
              className="p-5 rounded-2xl bg-surface border border-border hover:border-brand-cyan/40 transition-all space-y-3 block group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-brand-cyan transition-colors">
                إدارة وتسجيل الطلاب
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                توزيع الطلاب على الشعب، استيراد القوائم، وتأكيد التسجيل الأكاديمي.
              </p>
            </Link>

            <Link
              href="/admin/classes"
              className="p-5 rounded-2xl bg-surface border border-border hover:border-status-warning/40 transition-all space-y-3 block group"
            >
              <div className="w-10 h-10 rounded-xl bg-status-warning/15 text-status-warning flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-status-warning transition-colors">
                الصفوف والشعب الدراسية
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                تهيئة الصف الأول والثاني والثالث الثانوي، وتحديد المسارات (علمي/أدبي).
              </p>
            </Link>

            <Link
              href="/admin/subjects"
              className="p-5 rounded-2xl bg-surface border border-border hover:border-brand-teal/40 transition-all space-y-3 block group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-brand-teal transition-colors">
                المواد وإسناد المعلمين
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                إنشاء المواد، تحديد النوع (نظري/عملي)، وإسناد المعلم لكل شعبة.
              </p>
            </Link>

            <Link
              href="/admin/attendance"
              className="p-5 rounded-2xl bg-surface border border-border hover:border-brand-cyan/40 transition-all space-y-3 block group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-brand-cyan transition-colors">
                كشوفات الحضور والغياب لجميع الطلاب
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                سجلات الحضور اليومية لجميع الصفوف والشعب مرتبة بالتاريخ مع إمكانية التعديل والاعتماد.
              </p>
            </Link>

            <Link
              href="/admin/results"
              className="p-5 rounded-2xl bg-surface border border-border hover:border-brand-teal/40 transition-all space-y-3 block group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-teal/15 text-brand-teal flex items-center justify-center group-hover:scale-105 transition-transform">
                <Percent className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-brand-teal transition-colors">
                نتائج الطلاب لكل فصل ولكل سنة
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                الكشوفات الرسمية للنتائج، الدرجات، ونسب النجاح والتقدير لجميع المراحل الدراسية.
              </p>
            </Link>

            <Link
              href="/announcements"
              className="p-5 rounded-2xl bg-surface border border-border hover:border-status-warning/40 transition-all space-y-3 block group"
            >
              <div className="w-10 h-10 rounded-xl bg-status-warning/15 text-status-warning flex items-center justify-center group-hover:scale-105 transition-transform">
                <Megaphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground group-hover:text-status-warning transition-colors">
                إرسال الإشعارات والتعاميم المدرسية
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                نشر إشعارات وتوجيهها للطلاب أو المعلمين أو لشعب محددة فورياً.
              </p>
            </Link>

            <div className="p-5 rounded-2xl bg-surface border border-border hover:border-brand-cyan/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-surface-secondary text-foreground flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">إعدادات المنصة</h3>
              <p className="text-xs text-muted leading-relaxed">
                اسم المدرسة، الشعار، المنطقة الزمنية، حدود رفع الملفات، وسياسات الرسائل.
              </p>
            </div>
          </div>
        </section>

        {/* Security & Audit Logs Preview */}
        <section className="bg-surface p-5 rounded-3xl border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-cyan" />
              سجل التدقيق والنشاط الأمني (Audit Log)
            </h3>
            <span className="text-xs text-brand-cyan font-semibold">
              RLS مفعل ومحمي 100%
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-surface-secondary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-success"></span>
                <span className="font-semibold text-foreground">
                  تسجيل دخول إداري آمن
                </span>
                <span className="text-muted">— المدير: د. عبد الرحمن باحميد</span>
              </div>
              <span className="text-[11px] text-muted">اليوم 08:30 ص</span>
            </div>

            <div className="p-3 rounded-xl bg-surface-secondary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-cyan"></span>
                <span className="font-semibold text-foreground">
                  نشر محاضرة جديدة (Lecture 4 : NLB)
                </span>
                <span className="text-muted">— مادة إدارة الشبكات</span>
              </div>
              <span className="text-[11px] text-muted">اليوم 10:00 ص</span>
            </div>

            <div className="p-3 rounded-xl bg-surface-secondary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-warning"></span>
                <span className="font-semibold text-foreground">
                  تسليم تكليف
                </span>
                <span className="text-muted">— الطالب: عمر أحمد بافضل</span>
              </div>
              <span className="text-[11px] text-muted">اليوم 11:30 ص</span>
            </div>
          </div>
        </section>
        <DeveloperFooter />
      </main>

      <BottomNavigation user={admin} />
    </div>
  );
}