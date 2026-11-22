"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  Shield,
  KeyRound,
  CheckCircle2,
  Calendar,
  BookOpen,
  GraduationCap,
  Save,
  MapPin,
  Lock,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS } from "@/lib/mock-data";

export default function ProfilePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(MOCK_USERS.student1);

  React.useEffect(() => {
    const match = document.cookie.match(new RegExp("(^| )madrasti_session_role=([^;]+)"));
    const role = match ? match[2] : "STUDENT";
    if (role === "TEACHER") setCurrentUser(MOCK_USERS.teacher1);
    else if (role === "ADMIN") setCurrentUser(MOCK_USERS.admin);
    else setCurrentUser(MOCK_USERS.student1);
  }, []);

  const [phone, setPhone] = useState(currentUser.phone || "777888999");
  const [email, setEmail] = useState("student1@madrasti.school");
  const [address, setAddress] = useState("المكلا — حي السلام");
  const [isSaved, setIsSaved] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert("كلمة المرور الجديدة غير متطابقة.");
      return;
    }
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSuccess(false), 2500);
  };

  const getRoleLabel = (role: string) => {
    if (role === "ADMIN") return "مدير المدرسة";
    if (role === "TEACHER") return "معلم معتمد";
    return "طالب — ثالث ثانوي (علمي)";
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader
        user={currentUser}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={currentUser}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Profile Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-card flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-blue to-brand-cyan text-background flex items-center justify-center font-black text-3xl shadow-glow shrink-0">
            {currentUser.full_name.slice(0, 1)}
          </div>

          <div className="flex-1 text-center sm:text-right space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                {currentUser.full_name}
              </h1>
              <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 self-center sm:self-auto">
                {getRoleLabel(currentUser.role)}
              </span>
            </div>

            <p className="text-xs text-muted">
              اسم المستخدم: <span className="font-mono text-foreground font-bold">{currentUser.username}</span> • الرقم الأكاديمي: <span className="font-mono text-foreground font-bold">2026-0101</span>
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
                تاريخ التسجيل: 01 سبتمبر 2026
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" />
                الحالة: حساب نشط ومعتمد
              </span>
            </div>
          </div>
        </div>

        {/* Edit Personal Information Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-brand-cyan" />
              البيانات الشخصية وبيانات التواصل
            </h3>
            {isSaved && (
              <span className="text-xs font-bold text-brand-teal flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                تم حفظ التعديلات بنجاح!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  رقم الهاتف الشخصي / واتساب
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs font-mono focus:outline-none focus:border-brand-cyan"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  البريد الإلكتروني المعتمد
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs font-mono focus:outline-none focus:border-brand-cyan"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                عنوان السكن
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center gap-1.5 hover:brightness-110 shadow-glow transition-all"
              >
                <Save className="w-4 h-4" />
                حفظ البيانات
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-status-warning" />
              تغيير كلمة المرور
            </h3>
            {passwordSuccess && (
              <span className="text-xs font-bold text-brand-teal flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                تم تحديث كلمة المرور بنجاح!
              </span>
            )}
          </div>

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Lock className="w-4 h-4 text-status-warning" />
                تحديث كلمة المرور
              </button>
            </div>
          </form>
        </div>
      </main>

      <BottomNavigation user={currentUser} />
    </div>
  );
}
