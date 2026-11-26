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
  Shield,
  Info,
} from "lucide-react";
import { setSessionRole } from "@/lib/auth-actions";
import { UserRole } from "@/types/database.types";
import { setActiveUser } from "@/lib/user-store";
import { getSchoolInfo } from "@/lib/school-store";
import { createClient } from "@/lib/supabase/client";
import { loginWithSupabase } from "@/lib/services/auth-service";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schoolTitle, setSchoolTitle] = useState("ثانوية مدرستي النموذجية");

  React.useEffect(() => {
    async function loadSchoolSettings() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from("school_settings").select("school_name").limit(1).maybeSingle();
        if (data?.school_name) {
          setSchoolTitle(data.school_name);
        } else {
          const info = getSchoolInfo();
          setSchoolTitle(info.school_name);
        }
      } catch {
        const info = getSchoolInfo();
        setSchoolTitle(info.school_name);
      }
    }
    loadSchoolSettings();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanUser = username.trim();
      const authResult = await loginWithSupabase(cleanUser, password);

      if (!authResult.success || !authResult.user) {
        setError(authResult.error || "بيانات الدخول غير صحيحة.");
        setLoading(false);
        return;
      }

      const user = authResult.user;
      setActiveUser({
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        role: user.role,
        phone: user.phone || "",
        permissions: [],
        status: user.is_active ? "active" : "suspended",
        password: "",
      });

      // Route strictly based on user's actual database role
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else if (user.role === "TEACHER") {
        router.push("/teacher");
      } else {
        router.push("/student");
      }

      router.refresh();
    } catch {
      setError("حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoUsername: string, demoPass: string = "") => {
    setUsername(demoUsername);
    setPassword(demoPass);
    setError(null);
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
          بوابة التعلّم الإلكتروني — {schoolTitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface py-8 px-6 shadow-card rounded-3xl border border-border sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-sm font-semibold">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                اسم المستخدم (Username)
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
                  placeholder="مثال: admin أو teacher1 أو حسابك المسجل"
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
                  placeholder="كلمة المرور الخاصة بك..."
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
                  setError("ملاحظة: لاستعادة أو إعادة تعيين كلمة المرور، يرجى التواصل مع إدارة المدرسة.");
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
              {loading ? "جاري التحقق والدخول..." : "تسجيل الدخول"}
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-8 pt-6 border-t border-border/80 space-y-3">
            <div className="p-3 rounded-2xl bg-surface-secondary/70 border border-border text-[11px] text-muted space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Info className="w-3.5 h-3.5 text-brand-cyan" />
                <span>حسابات المنصة المسجلة للفحص السريع:</span>
              </div>
              <p>• المدير: <strong className="text-foreground font-mono">admin</strong> (كلمة المرور: <span className="text-brand-cyan font-mono">admin123456</span>)</p>
              <p>• الطالب: <strong className="text-brand-cyan font-mono">ahmed2026</strong> (كلمة المرور: <span className="text-brand-cyan font-mono">Password123!</span>)</p>
              <p>• المعلم: <strong className="text-brand-teal font-mono">alala1997</strong> (أدخل كلمة المرور الخاصة بحسابك)</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("admin", "admin123456")}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-secondary hover:bg-brand-cyan/15 hover:border-brand-cyan/40 border border-border text-foreground transition-all"
              >
                <Shield className="w-4 h-4 text-brand-cyan mb-1" />
                <span className="text-[11px] font-bold">دخول المدير</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("alala1997", "")}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-secondary hover:bg-brand-teal/15 hover:border-brand-teal/40 border border-border text-foreground transition-all"
              >
                <BookOpen className="w-4 h-4 text-brand-teal mb-1" />
                <span className="text-[11px] font-bold">حساب المعلم</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("ahmed2026", "Password123!")}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-secondary hover:bg-brand-cyan/15 hover:border-brand-cyan/40 border border-border text-foreground transition-all"
              >
                <UserCheck className="w-4 h-4 text-brand-cyan mb-1" />
                <span className="text-[11px] font-bold">دخول الطالب</span>
              </button>
            </div>
          </div>

          <DeveloperFooter />
        </div>
      </div>
    </div>
  );
}
