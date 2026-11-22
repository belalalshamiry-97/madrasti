"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Bell,
  Moon,
  Globe,
  Shield,
  Smartphone,
  Save,
  CheckCircle2,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS } from "@/lib/mock-data";

export default function SettingsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const student = MOCK_USERS.student1;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);
  const [gradesAlerts, setGradesAlerts] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader
        user={student}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={student}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-secondary text-brand-cyan flex items-center justify-center font-bold border border-border">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">الإعدادات والتفضيلات</h1>
              <p className="text-xs text-muted">
                إدارة خيارات التنبيهات، المظهر، وخصوصية الحساب
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center gap-1.5 hover:brightness-110 shadow-glow transition-all"
          >
            <Save className="w-4 h-4" />
            {isSaved ? "تم الحفظ!" : "حفظ التفضيلات"}
          </button>
        </div>

        {/* Notifications Settings */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-cyan" />
            تفضيلات الإشعارات والتنبيهات
          </h3>

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
                <span className="text-muted text-[11px]">إشعار فوري عند قيام المعلم باعتماد درجاتك</span>
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
                <span className="text-muted text-[11px]">الوضع الداكن الافتراضي (Dark Mode)</span>
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
      </main>

      <BottomNavigation user={student} />
    </div>
  );
}
