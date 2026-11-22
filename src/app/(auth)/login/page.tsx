"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
  UserCheck,
} from "lucide-react";
import { setSessionRole } from "@/lib/auth-actions";
import { UserRole } from "@/types/database.types";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanUser = username.trim().toLowerCase();

      // Check role mapping
      let role: UserRole = "STUDENT";
      if (cleanUser === "admin") {
        // Enforce password for admin
        if (password.length < 4) {
          setError("يرجى إدخال كلمة مرور الإدارة الصحيحة.");
          setLoading(false);
          return;
        }
        role = "ADMIN";
      } else if (cleanUser.includes("teacher")) {
        role = "TEACHER";
      }

      await setSessionRole(role);

      if (role === "ADMIN") router.push("/admin");
      else if (role === "TEACHER") router.push("/teacher");
      else router.push("/student");

      router.refresh();
    } catch {
      setError("حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: "STUDENT" | "TEACHER") => {
    setLoading(true);
    await setSessionRole(role);
    if (role === "TEACHER") router.push("/teacher");
    else router.push("/student");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center text-background shadow-glow">
            <GraduationCap className="w-9 h-9" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          منصة مدرستي
        </h2>
        <p className="mt-2 text-center text-sm text-muted">
          بوابة التعلّم الإلكتروني — ثانوية مدرستي النموذجية
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface py-8 px-6 shadow-card rounded-3xl border border-border sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                اسم المستخدم أو رقم الطالب
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted">
                  <User className="h-5 h-5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="مثال: student1 أو teacher1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pr-11 pl-4 py-3 bg-surface-secondary border border-border rounded-xl text-foreground placeholder-muted/60 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                كلمة المرور
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted">
                  <Lock className="h-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-11 pl-11 py-3 bg-surface-secondary border border-border rounded-xl text-foreground placeholder-muted/60 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">المنصة مخصصة لمنسوبي المدرسة</span>
              <a
                href="#help"
                onClick={(e) => {
                  e.preventDefault();
                  alert("يرجى مراجعة إدارة المدرسة لإعادة تعيين كلمة المرور الخاصة بك.");
                }}
                className="text-brand-cyan hover:underline font-medium"
              >
                نسيت كلمة المرور؟
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-background bg-gradient-to-r from-brand-cyan to-brand-blue hover:opacity-95 shadow-glow transition-all disabled:opacity-50"
            >
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </form>

          {/* Quick Access Bar for Students and Teachers only */}
          <div className="mt-8 pt-6 border-t border-border/80">
            <p className="text-xs text-center font-medium text-muted mb-3">
              الدخول السريع بحساب تجريبي:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemo("STUDENT")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-surface-secondary hover:bg-brand-cyan/15 hover:border-brand-cyan/40 border border-border text-foreground transition-all"
              >
                <UserCheck className="w-5 h-5 text-brand-cyan mb-1" />
                <span className="text-xs font-semibold">حساب طالب</span>
                <span className="text-[10px] text-muted">عمر بافضل</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("TEACHER")}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-surface-secondary hover:bg-brand-teal/15 hover:border-brand-teal/40 border border-border text-foreground transition-all"
              >
                <BookOpen className="w-5 h-5 text-brand-teal mb-1" />
                <span className="text-xs font-semibold">حساب معلم</span>
                <span className="text-[10px] text-muted">م. بلال الشميري</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}