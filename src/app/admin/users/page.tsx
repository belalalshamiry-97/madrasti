"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  UserPlus,
  KeyRound,
  CheckCircle2,
  ChevronRight,
  Search,
  Filter,
  UserCheck,
  ShieldAlert,
  GraduationCap,
  BookOpen,
  X,
  Save,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS } from "@/lib/mock-data";
import { UserRole } from "@/types/database.types";
import { cn } from "@/lib/utils";

interface ManagedUser {
  id: string;
  full_name: string;
  username: string;
  role: UserRole;
  phone: string;
  status: "active" | "suspended";
}

export default function AdminUsersPermissionsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const admin = MOCK_USERS.admin;

  const [usersList, setUsersList] = useState<ManagedUser[]>([
    {
      id: "u-1",
      full_name: "د. عبد الرحمن باحميد",
      username: "admin",
      role: "ADMIN",
      phone: "777111222",
      status: "active",
    },
    {
      id: "u-2",
      full_name: "م. بلال الشميري",
      username: "teacher1",
      role: "TEACHER",
      phone: "777333444",
      status: "active",
    },
    {
      id: "u-3",
      full_name: "أ. فاطمة العولقي",
      username: "teacher2",
      role: "TEACHER",
      phone: "777555666",
      status: "active",
    },
    {
      id: "u-4",
      full_name: "عمر أحمد بافضل",
      username: "student1",
      role: "STUDENT",
      phone: "777888999",
      status: "active",
    },
    {
      id: "u-5",
      full_name: "سارة خالد الكثيري",
      username: "student2",
      role: "STUDENT",
      phone: "777999000",
      status: "active",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New User Form State
  const [newFullName, setNewFullName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("TEACHER");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    const targetUser = usersList.find((u) => u.id === userId);
    showToast(
      `تم تعديل صلاحية "${targetUser?.full_name}" بنجاح إلى: ${getRoleTitle(newRole)}`
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newUsername.trim()) return;

    const newUser: ManagedUser = {
      id: `u-${Date.now()}`,
      full_name: newFullName.trim(),
      username: newUsername.trim(),
      role: newRole,
      phone: newPhone.trim() || "—",
      status: "active",
    };

    setUsersList((prev) => [newUser, ...prev]);
    setIsAddModalOpen(false);
    setNewFullName("");
    setNewUsername("");
    setNewPhone("");
    setNewPassword("");
    showToast(`تم إنشاء المستخدم ومنحه صلاحية "${getRoleTitle(newRole)}" بنجاح!`);
  };

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "مدير المدرسة (صلاحية كاملة)";
      case "TEACHER":
        return "معلم";
      case "STUDENT":
        return "طالب";
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-status-warning" />
                إدارة المستخدمين وصلاحيات الدخول
              </h1>
              <p className="text-xs text-muted">
                تعيين صلاحيات مديري المدرسة، المعلمين، والطلاب وتحديد أدوارهم
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 shadow-glow transition-all"
          >
            <UserPlus className="w-4 h-4" />
            إضافة مستخدم وتعيين صلاحية
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم أو اسم المستخدم..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setRoleFilter("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-colors",
                roleFilter === "ALL"
                  ? "bg-brand-cyan text-background font-bold shadow-glow"
                  : "bg-surface text-muted hover:text-foreground border border-border"
              )}
            >
              الكل ({usersList.length})
            </button>
            <button
              onClick={() => setRoleFilter("ADMIN")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1",
                roleFilter === "ADMIN"
                  ? "bg-status-warning text-background font-bold shadow-glow"
                  : "bg-surface text-muted hover:text-foreground border border-border"
              )}
            >
              <Shield className="w-3.5 h-3.5" />
              المديرون ({usersList.filter((u) => u.role === "ADMIN").length})
            </button>
            <button
              onClick={() => setRoleFilter("TEACHER")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1",
                roleFilter === "TEACHER"
                  ? "bg-brand-teal text-background font-bold shadow-glow"
                  : "bg-surface text-muted hover:text-foreground border border-border"
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              المعلمون ({usersList.filter((u) => u.role === "TEACHER").length})
            </button>
            <button
              onClick={() => setRoleFilter("STUDENT")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1",
                roleFilter === "STUDENT"
                  ? "bg-brand-cyan text-background font-bold shadow-glow"
                  : "bg-surface text-muted hover:text-foreground border border-border"
              )}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              الطلاب ({usersList.filter((u) => u.role === "STUDENT").length})
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="p-4 sm:p-6 rounded-3xl bg-surface border border-border shadow-card space-y-3">
          <div className="hidden sm:grid sm:grid-cols-12 text-xs font-bold text-muted pb-3 border-b border-border">
            <span className="col-span-5">اسم المستخدم والحساب</span>
            <span className="col-span-4 text-center">الصلاحية ونوع الحساب</span>
            <span className="col-span-3 text-left">تعديل الصلاحية فورياً</span>
          </div>

          <div className="space-y-3">
            {filteredUsers.map((userItem) => (
              <div
                key={userItem.id}
                className="p-4 rounded-2xl bg-surface-secondary/50 border border-border flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-3 transition-colors hover:border-brand-cyan/30"
              >
                {/* User Info */}
                <div className="col-span-5 flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                      userItem.role === "ADMIN"
                        ? "bg-status-warning/20 text-status-warning border border-status-warning/40"
                        : userItem.role === "TEACHER"
                        ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/40"
                        : "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40"
                    )}
                  >
                    {userItem.role === "ADMIN" ? (
                      <Shield className="w-5 h-5" />
                    ) : (
                      userItem.full_name.slice(0, 1)
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      {userItem.full_name}
                      {userItem.role === "ADMIN" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-status-warning/20 text-status-warning font-black">
                          مسؤول
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-muted block" dir="ltr">
                      @{userItem.username} • {userItem.phone}
                    </span>
                  </div>
                </div>

                {/* Role Pill */}
                <div className="col-span-4 text-center">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold inline-block",
                      userItem.role === "ADMIN"
                        ? "bg-status-warning/20 text-status-warning border border-status-warning/40"
                        : userItem.role === "TEACHER"
                        ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/40"
                        : "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40"
                    )}
                  >
                    {getRoleTitle(userItem.role)}
                  </span>
                </div>

                {/* Instant Role Selector */}
                <div className="col-span-3 text-left">
                  <select
                    value={userItem.role}
                    onChange={(e) =>
                      handleRoleChange(userItem.id, e.target.value as UserRole)
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-surface border border-border text-foreground text-xs font-bold focus:outline-none focus:border-brand-cyan cursor-pointer"
                  >
                    <option value="ADMIN">مدير (ADMIN)</option>
                    <option value="TEACHER">معلم (TEACHER)</option>
                    <option value="STUDENT">طالب (STUDENT)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-cyan" />
                إضافة مستخدم جديد وتحديد صلاحياته
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  الاسم الرباعي الكامل
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أ. سالم محمد باوزير"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    اسم المستخدم (Login)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="salem2026"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    placeholder="777123456"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  صلاحية الدخول والنظام
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                >
                  <option value="TEACHER">معلم (صلاحية التدريس والتصحيح)</option>
                  <option value="ADMIN">مدير المدرسة (صلاحية كاملة للإدارة)</option>
                  <option value="STUDENT">طالب (صلاحية التعلم وحل الواجبات)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  كلمة المرور الأولية
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-cyan text-background font-bold shadow-glow"
                >
                  إنشاء الحساب والصلاحية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNavigation user={admin} />
    </div>
  );
}
