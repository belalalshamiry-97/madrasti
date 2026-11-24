"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  User,
  CreditCard,
  MessageSquare,
  CalendarDays,
  Users,
  BookOpen,
  Percent,
  Trophy,
  Settings,
  LogOut,
  GraduationCap,
  BarChart3,
  HelpCircle,
  Layers,
  FileSpreadsheet,
  Megaphone,
  UserPlus,
  Shield,
  FileCheck,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";
import { Profile } from "@/types/database.types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getSchoolInfo } from "@/lib/school-store";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: Profile | null;
}

export function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const pathname = usePathname();
  const [schoolTitle, setSchoolTitle] = React.useState("ثانوية مدرستي");

  React.useEffect(() => {
    const info = getSchoolInfo();
    setSchoolTitle(info.school_name);

    const handleUpdate = (e: any) => {
      if (e.detail?.school_name) setSchoolTitle(e.detail.school_name);
    };
    window.addEventListener("madrasti_school_updated", handleUpdate);
    return () => window.removeEventListener("madrasti_school_updated", handleUpdate);
  }, []);

  // Admin menu strictly tailored for School Principal (NO student items)
  const adminMenuItems = [
    { label: "لوحة التحكم الإدارية", href: "/admin", icon: LayoutDashboard },
    { isDivider: true },
    {
      label: "كشوفات الحضور لجميع الطلاب",
      href: "/admin/attendance",
      icon: CalendarDays,
      badge: "يومي",
    },
    {
      label: "تسجيل وقيد الطلاب بالشعب",
      href: "/admin/enrollments",
      icon: UserPlus,
    },
    {
      label: "قائمة نتائج الطلاب لكل فصل وسنة",
      href: "/admin/results",
      icon: Percent,
      badge: "معتمد",
    },
    {
      label: "إدارة المستخدمين والصلاحيات",
      href: "/admin/users",
      icon: Shield,
    },
    {
      label: "إرسال الإشعارات والتعاميم",
      href: "/announcements",
      icon: Megaphone,
    },
    { isDivider: true },
    {
      label: "الصفوف والشعب الدراسية",
      href: "/admin/classes",
      icon: Layers,
    },
    {
      label: "المواد وإسناد المعلمين",
      href: "/admin/subjects",
      icon: BookOpen,
    },
    {
      label: "التقارير والمؤشرات الأكاديمية",
      href: "/admin/reports",
      icon: BarChart3,
    },
    { isDivider: true },
    { label: "إعدادات المدرسة العامة", href: "/settings", icon: Settings },
  ];

  // Teacher menu strictly tailored for Teachers (NO student items)
  const teacherMenuItems = [
    { label: "لوحة تحكم المعلم", href: "/teacher", icon: LayoutDashboard },
    { isDivider: true },
    {
      label: "مقرراتي المسندة",
      href: "/teacher/courses",
      icon: BookOpen,
    },
    {
      label: "كشف التحضير اليومي",
      href: "/teacher/attendance",
      icon: CalendarDays,
    },
    {
      label: "سجل وطابور التصحيح",
      href: "/teacher/grading",
      icon: FileCheck,
      badge: "مهام",
    },
    {
      label: "الاختبارات وبنك الأسئلة",
      href: "/teacher/quizzes/new",
      icon: HelpCircle,
    },
    {
      label: "إدارة الواجبات والتكليفات",
      href: "/teacher/assignments",
      icon: ClipboardList,
    },
    {
      label: "محادثات واستفسارات الطلاب",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      label: "الإعلانات المدرسية",
      href: "/announcements",
      icon: Megaphone,
    },
    { isDivider: true },
    { label: "ملفي الشخصي", href: "/profile", icon: User },
    { label: "الإعدادات", href: "/settings", icon: Settings },
  ];

  // Student menu strictly tailored for Students
  const studentMenuItems = [
    { label: "الرئيسية", href: "/student", icon: LayoutDashboard },
    { isDivider: true },
    { label: "مقرراتي الدراسية", href: "/student/courses", icon: BookOpen },
    { label: "واجباتي وتكليفاتي", href: "/student/assignments", icon: ClipboardList },
    { label: "الاختبارات الإلكترونية", href: "/student/quizzes", icon: HelpCircle },
    { label: "سجل الحضور والغياب", href: "/student/attendance", icon: CalendarDays },
    { label: "النتائج والدرجات", href: "/student/grades", icon: Percent },
    {
      label: "البطاقة المدرسية الذكية",
      href: "/id-card",
      icon: CreditCard,
      badge: "جديد",
    },
    { label: "لوحة الشرف والمتفوقين", href: "/leaderboard", icon: Trophy },
    { label: "الرسائل مع المعلمين", href: "/messages", icon: MessageSquare },
    { isDivider: true },
    { label: "ملفي الشخصي", href: "/profile", icon: User },
    { label: "الإعدادات", href: "/settings", icon: Settings },
  ];

  const userRole = user?.role || "STUDENT";
  const userFullName = user?.full_name || "مستخدم";

  // Select items based on user role
  const menuItems =
    userRole === "ADMIN"
      ? adminMenuItems
      : userRole === "TEACHER"
      ? teacherMenuItems
      : studentMenuItems;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-surface z-50 flex flex-col shadow-2xl border-l border-border animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-background shadow-glow",
                userRole === "ADMIN"
                  ? "bg-gradient-to-tr from-amber-500 to-status-warning text-black"
                  : userRole === "TEACHER"
                  ? "bg-gradient-to-tr from-brand-teal to-emerald-400"
                  : "bg-gradient-to-tr from-brand-blue to-brand-cyan"
              )}
            >
              {userRole === "ADMIN" ? (
                <Shield className="w-6 h-6" />
              ) : (
                <GraduationCap className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-black text-foreground text-base leading-tight truncate max-w-[180px]">
                {schoolTitle}
              </h3>
              <p className="text-xs font-semibold text-brand-cyan">
                {userFullName}
              </p>
              <span className="text-[10px] text-muted block mt-0.5">
                {userRole === "ADMIN"
                  ? "مدير المدرسة • صلاحية كاملة"
                  : userRole === "TEACHER"
                  ? "معلم معتمد • الكادر التعليمي"
                  : "طالب نظامي"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-secondary transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {menuItems.map((item, idx) => {
            if (item.isDivider) {
              return (
                <div
                  key={`divider-${idx}`}
                  className="my-2 border-t border-border/60"
                />
              );
            }

            const Icon = item.icon!;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href || "#"}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-brand-cyan/15 text-brand-cyan font-bold border border-brand-cyan/20"
                    : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-surface-secondary"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
                      isActive
                        ? "bg-brand-cyan text-background"
                        : "bg-surface-secondary/70 text-brand-cyan"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <StatusBadge type="new" label={item.badge} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Developer Credit & Logout */}
        <div className="p-3 border-t border-border space-y-2 bg-surface-secondary/30">
          <div className="text-[10px] text-center text-muted border-b border-border/40 pb-2">
            تطوير: <strong className="text-foreground">م. بلال الشميري</strong> (783085075)
          </div>

          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-surface-secondary text-status-danger hover:bg-status-danger/10 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
