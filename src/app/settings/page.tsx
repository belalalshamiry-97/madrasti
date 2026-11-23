"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Bell,
  Moon,
  School,
  Save,
  CheckCircle2,
  ChevronRight,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Loader2,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { MOCK_USERS } from "@/lib/mock-data";
import { getActiveUser } from "@/lib/user-store";
import { getSchoolInfo, saveSchoolInfoAsync, syncSchoolInfoFromDB, SchoolInfo } from "@/lib/school-store";

export default function SettingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(MOCK_USERS.admin);

  // School Settings State
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    school_name: "ثانوية مدرستي النموذجية",
    address: "حضرموت — المكلا — شارع المعلمين",
    contact_phone: "+967-783085075",
    contact_email: "info@madrasti.school",
    academic_year: "2026-2027",
    current_term: "الفصل الدراسي الأول",
  });

  // Personal preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);
  const [gradesAlerts, setGradesAlerts] = useState(true);
  const [isSchoolSaved, setIsSchoolSaved] = useState(false);
  const [isSavingSchool, setIsSavingSchool] = useState(false);
  const [isPrefSaved, setIsPrefSaved] = useState(false);

  useEffect(() => {
    const active = getActiveUser();
    setCurrentUser(active);
    setSchoolInfo(getSchoolInfo());
    
    // Fetch authoritative settings from Supabase
    syncSchoolInfoFromDB().then((dbInfo) => {
      if (dbInfo) setSchoolInfo(dbInfo);
    });
  }, []);

  const handleSaveSchoolSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolInfo.school_name.trim() || isSavingSchool) return;

    setIsSavingSchool(true);
    try {
      await saveSchoolInfoAsync(schoolInfo);
      setIsSchoolSaved(true);
      setTimeout(() => setIsSchoolSaved(false), 3500);
    } finally {
      setIsSavingSchool(false);
    }
  };

  const handleSavePreferences = () => {
    setIsPrefSaved(true);
    setTimeout(() => setIsPrefSaved(false), 2000);
  };

  const isAdmin = currentUser.role === "ADMIN";

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
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <Link
              href={isAdmin ? "/admin" : currentUser.role === "TEACHER" ? "/teacher" : "/student"}
              className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-cyan" />
                إعدادات المنصة والمدرسة
              </h1>
              <p className="text-xs text-muted">
                {isAdmin
                  ? "إدارة بيانات وهوية المدرسة، اسم المؤسسة التعليمية، وخيارات النظام العامة"
                  : "إدارة خيارات التنبيهات، المظهر، وتفضيلات الحساب"}
              </p>
            </div>
          </div>
        </div>

        {/* ADMIN EXCLUSIVE: School Identity & Name Customization */}
        {isAdmin && (
          <form
            onSubmit={handleSaveSchoolSettings}
            className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-status-warning/15 text-status-warning flex items-center justify-center font-bold">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    هوية وبيانات المدرسة الأساسية (خاص بالمدير)
                  </h3>
                  <p className="text-xs text-muted">
                    تغيير اسم المدرسة وتحديث بياناتها الرسمية التي تظهر في كامل أرجاء المنصة والشهادات
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingSchool}
                className="px-5 py-2.5 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow hover:brightness-110 transition-all shrink-0 disabled:opacity-50"
              >
                {isSavingSchool ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSavingSchool ? "جاري الحفظ..." : "حفظ وتطبيق اسم المدرسة"}</span>
              </button>
            </div>

            {/* Success Toast */}
            {isSchoolSaved && (
              <div className="p-3.5 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>تم تحديث اسم المدرسة وبياناتها بنجاح! تم تطبيق الاسم الجديد في كافة شاشات المنصة.</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* School Name Input */}
              <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-brand-cyan/30 space-y-2">
                <label className="block text-xs font-black text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-status-warning" />
                  اسم المدرسة الرسمي (يظهر في الهيدر، القائمة الجانبية، والتقارير)
                </label>
                <input
                  type="text"
                  required
                  value={schoolInfo.school_name}
                  onChange={(e) =>
                    setSchoolInfo({ ...schoolInfo, school_name: e.target.value })
                  }
                  placeholder="مثال: ثانوية النهضة النموذجية للبنين"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-foreground font-bold text-sm focus:outline-none focus:border-brand-cyan shadow-inner"
                />
                <span className="text-[11px] text-muted block">
                  معاينة فورية: <strong className="text-brand-cyan">{schoolInfo.school_name || "منصة مدرستي"}</strong>
                </span>
              </div>

              {/* Grid for Additional School Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    العام الدراسي الحالي
                  </label>
                  <input
                    type="text"
                    value={schoolInfo.academic_year}
                    onChange={(e) =>
                      setSchoolInfo({ ...schoolInfo, academic_year: e.target.value })
                    }
                    placeholder="2026-2027"
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    الفصل الدراسي النشط
                  </label>
                  <input
                    type="text"
                    value={schoolInfo.current_term}
                    onChange={(e) =>
                      setSchoolInfo({ ...schoolInfo, current_term: e.target.value })
                    }
                    placeholder="الفصل الدراسي الأول"
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-muted" />
                    رقم هاتف إدارة المدرسة
                  </label>
                  <input
                    type="text"
                    value={schoolInfo.contact_phone}
                    onChange={(e) =>
                      setSchoolInfo({ ...schoolInfo, contact_phone: e.target.value })
                    }
                    placeholder="+967-5-123456"
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-muted" />
                    البريد الإلكتروني الرسمي
                  </label>
                  <input
                    type="email"
                    value={schoolInfo.contact_email}
                    onChange={(e) =>
                      setSchoolInfo({ ...schoolInfo, contact_email: e.target.value })
                    }
                    placeholder="info@madrasti.school"
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-muted" />
                  عنوان ومقر المدرسة
                </label>
                <input
                  type="text"
                  value={schoolInfo.address}
                  onChange={(e) =>
                    setSchoolInfo({ ...schoolInfo, address: e.target.value })
                  }
                  placeholder="المحافظة — المديرية — اسم الشارع"
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>
          </form>
        )}

        {/* Read-only School Badge for Teachers/Students */}
        {!isAdmin && (
          <div className="p-5 rounded-3xl bg-surface border border-border flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center font-bold">
              <School className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-muted block">المؤسسة التعليمية:</span>
              <h3 className="text-base font-black text-foreground">
                {schoolInfo.school_name}
              </h3>
              <span className="text-xs text-muted block mt-0.5">
                {schoolInfo.address} • {schoolInfo.academic_year} ({schoolInfo.current_term})
              </span>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-cyan" />
              تفضيلات الإشعارات والتنبيهات
            </h3>
            <button
              onClick={handleSavePreferences}
              className="px-3.5 py-1.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-xs font-semibold text-foreground transition-colors"
            >
              {isPrefSaved ? "تم الحفظ!" : "حفظ التفضيلات"}
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-surface-secondary cursor-pointer">
              <div>
                <span className="font-bold text-foreground block">تفعيل التنبيهات الفورية (Push Notifications)</span>
                <span className="text-muted text-[11px]">استقبال التنبيهات عند نشر الدروس أو الإعلانات</span>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="rounded bg-surface border-border text-brand-cyan w-4 h-4 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-surface-secondary cursor-pointer">
              <div>
                <span className="font-bold text-foreground block">تنبيهات مواعيد استحقاق الواجبات</span>
                <span className="text-muted text-[11px]">تذكير تلقائي قبل موعد تسليم التكليف بـ 24 ساعة</span>
              </div>
              <input
                type="checkbox"
                checked={assignmentAlerts}
                onChange={(e) => setAssignmentAlerts(e.target.checked)}
                className="rounded bg-surface border-border text-brand-cyan w-4 h-4 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-surface-secondary cursor-pointer">
              <div>
                <span className="font-bold text-foreground block">إشعارات رصد الدرجات والتصحيح</span>
                <span className="text-muted text-[11px]">إشعار فوري عند اعتماد الدرجات</span>
              </div>
              <input
                type="checkbox"
                checked={gradesAlerts}
                onChange={(e) => setGradesAlerts(e.target.checked)}
                className="rounded bg-surface border-border text-brand-cyan w-4 h-4 focus:ring-0"
              />
            </label>
          </div>
        </div>

        {/* Appearance & Language */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Moon className="w-4 h-4 text-brand-cyan" />
            المظهر واللغة
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-secondary">
              <div>
                <span className="font-bold text-foreground block">السمة البصرية (Theme)</span>
                <span className="text-muted text-[11px]">الوضع الداكن المعتمد (Dark Palette)</span>
              </div>
              <span className="px-3 py-1 rounded-xl bg-surface border border-border text-brand-cyan font-bold text-xs">
                مفعّل تلقائياً
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-secondary">
              <div>
                <span className="font-bold text-foreground block">لغة النظام</span>
                <span className="text-muted text-[11px]">اللغة العربية الفصحى (RTL)</span>
              </div>
              <span className="px-3 py-1 rounded-xl bg-surface border border-border text-brand-teal font-bold text-xs">
                العربية
              </span>
            </div>
          </div>
        </div>

        <DeveloperFooter />
      </main>

      <BottomNavigation user={currentUser} />
    </div>
  );
}
