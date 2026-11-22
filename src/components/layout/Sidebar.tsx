"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  User,
  CreditCard,
  MessageSquare,
  Compass,
  QrCode,
  CalendarDays,
  Users,
  BookOpen,
  Percent,
  Trophy,
  AlertTriangle,
  Settings,
  LogOut,
  GraduationCap,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { Profile } from "@/types/database.types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile;
}

export function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const pathname = usePathname();

  const getResultsLink = () => {
    if (user.role === "TEACHER") return "/teacher/grading";
    if (user.role === "STUDENT") return "/student/grades";
    return "/admin/reports";
  };

  const getAttendanceLink = () => {
    if (user.role === "TEACHER") return "/teacher/attendance";
    if (user.role === "STUDENT") return "/student/attendance";
    return "/admin/reports";
  };

  const getQuizzesLink = () => {
    if (user.role === "TEACHER") return "/teacher/quizzes/new";
    if (user.role === "STUDENT") return "/student/quizzes";
    return "/admin/reports";
  };

  const menuItems = [
    { label: "ملفي الشخصي", href: "/profile", icon: User },
    {
      label: "البطاقة الإلكترونية",
      href: "/id-card",
      icon: CreditCard,
      badge: "جديد",
    },
    { label: "بيانات التواصل", href: "/contact-info", icon: MessageSquare },
    { isDivider: true },
    { label: "كشف التحضير والغياب", href: getAttendanceLink(), icon: CalendarDays },
    { label: "الاختبارات الإلكترونية", href: getQuizzesLink(), icon: HelpCircle, badge: "جديد" },
    {
      label: "مقرراتي",
      href: user.role === "TEACHER" ? "/teacher/courses" : "/student/courses",
      icon: BookOpen,
      badge: "جديد",
    },
    { label: "النتائج والدرجات", href: getResultsLink(), icon: Percent },
    ...(user.role === "ADMIN"
      ? [{ label: "التقارير والمؤشرات", href: "/admin/reports", icon: BarChart3 }]
      : []),
    { isDivider: true },
    { label: "الإعدادات", href: "/settings", icon: Settings },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer (starts from right in RTL) */}
      <aside className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-surface z-50 flex flex-col shadow-2xl border-l border-border animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center text-background font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base leading-tight">
                منصة مدرستي
              </h3>
              <p className="text-xs text-brand-cyan">{user.full_name}</p>
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

        {/* Menu list */}
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
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-cyan/15 text-brand-cyan font-bold"
                    : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-surface-secondary"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-secondary/70 flex items-center justify-center text-brand-cyan">
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

        {/* Footer with Logout */}
        <div className="p-4 border-t border-border">
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-surface-secondary text-status-danger hover:bg-status-danger/10 text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </Link>
        </div>
      </aside>
    </>
  );
}