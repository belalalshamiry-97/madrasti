"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  GraduationCap,
  LogOut,
  ChevronDown,
  User,
  Shield,
  BookOpen,
} from "lucide-react";
import { Profile, UserRole } from "@/types/database.types";
import { setSessionRole, clearSession } from "@/lib/auth-actions";
import { getSchoolInfo } from "@/lib/school-store";

interface AppHeaderProps {
  user: Profile;
  onOpenSidebar: () => void;
}

export function AppHeader({ user, onOpenSidebar }: AppHeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [schoolName, setSchoolName] = useState("منصة مدرستي");
  const [termLabel, setTermLabel] = useState("الفصل الدراسي الأول");

  React.useEffect(() => {
    const info = getSchoolInfo();
    setSchoolName(info.school_name);
    setTermLabel(info.current_term);

    const handleUpdate = (e: any) => {
      if (e.detail?.school_name) setSchoolName(e.detail.school_name);
      if (e.detail?.current_term) setTermLabel(e.detail.current_term);
    };
    window.addEventListener("madrasti_school_updated", handleUpdate);
    return () => window.removeEventListener("madrasti_school_updated", handleUpdate);
  }, []);

  const handleRoleSwitch = async (role: UserRole) => {
    // Only admins are permitted to switch views for auditing/preview
    if (user.role !== "ADMIN" && role === "ADMIN") return;

    await setSessionRole(role);
    setIsDropdownOpen(false);
    if (role === "ADMIN") router.push("/admin");
    else if (role === "TEACHER") router.push("/teacher");
    else router.push("/student");
    router.refresh();
  };

  const handleSignOut = async () => {
    await clearSession();
    router.push("/login");
    router.refresh();
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "مدير المدرسة";
      case "TEACHER":
        return "معلم";
      case "STUDENT":
        return "طالب";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Right side (RTL): Menu button & School branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-secondary transition-colors"
            aria-label="القائمة الجانبية"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center text-background shadow-glow">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-wide text-foreground block leading-tight max-w-[180px] sm:max-w-xs truncate">
                {schoolName}
              </span>
              <span className="text-[11px] text-muted block leading-none">
                بوابة التعلّم الإلكتروني
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Semester info pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs text-muted">
          <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
          <span>{termLabel} • 2026</span>
        </div>

        {/* Left side: Notifications & User profile dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/notifications"
            className="relative p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface-secondary transition-colors"
            aria-label="الإشعارات"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-danger ring-2 ring-background"></span>
          </Link>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-surface hover:bg-surface-secondary border border-border transition-colors text-right"
            >
              <div className="w-8 h-8 rounded-lg bg-surface-secondary border border-brand-cyan/30 flex items-center justify-center text-brand-cyan font-bold text-sm">
                {user.full_name.slice(0, 1)}
              </div>
              <div className="hidden sm:block text-right">
                <span className="block text-xs font-semibold text-foreground max-w-[120px] truncate">
                  {user.full_name}
                </span>
                <span className="block text-[10px] text-brand-cyan">
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted" />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-surface border border-border shadow-card py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-xs text-muted">الحساب الحالي:</p>
                  <p className="text-sm font-bold text-foreground truncate">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-brand-cyan">
                    {getRoleLabel(user.role)} ({user.username})
                  </p>
                </div>

                {/* Only display Admin options IF the current user is an authenticated ADMIN */}
                {user.role === "ADMIN" && (
                  <div className="py-1 border-b border-border">
                    <p className="px-4 py-1 text-[11px] font-semibold text-status-warning">
                      صلاحيات الإدارة:
                    </p>
                    <Link
                      href="/admin"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full px-4 py-1.5 text-xs text-right text-foreground hover:bg-surface-secondary flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-status-warning" />
                      لوحة تحكم الإدارة
                    </Link>
                    <button
                      onClick={() => handleRoleSwitch("TEACHER")}
                      className="w-full px-4 py-1.5 text-xs text-right text-foreground hover:bg-surface-secondary flex items-center gap-2"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-brand-teal" />
                      معاينة كمعلم
                    </button>
                    <button
                      onClick={() => handleRoleSwitch("STUDENT")}
                      className="w-full px-4 py-1.5 text-xs text-right text-foreground hover:bg-surface-secondary flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-brand-cyan" />
                      معاينة كطالب
                    </button>
                  </div>
                )}

                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-xs text-right text-status-danger hover:bg-surface-secondary flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}