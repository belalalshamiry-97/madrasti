"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  QrCode,
  Download,
  Printer,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS } from "@/lib/mock-data";

export default function IdCardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const student = MOCK_USERS.student1;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert("جارٍ حفظ وتنزيل البطاقة المدرسية الرقمية...");
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

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-cyan text-background flex items-center justify-center font-bold shadow-glow">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">البطاقة المدرسية الإلكترونية</h1>
              <p className="text-xs text-muted">
                الهوية الرقمية المعتمدة لطلاب ثانوية مدرستي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-xs font-semibold text-brand-cyan flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              تنزيل
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center gap-1.5 hover:brightness-110 shadow-glow transition-all"
            >
              <Printer className="w-4 h-4" />
              طباعة
            </button>
          </div>
        </div>

        {/* Holographic ID Card Widget */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] border-2 border-brand-cyan/40 p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Top Holographic Strip */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-teal animate-pulse"></div>

          {/* Card Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center text-background font-bold shadow-glow">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-foreground text-sm tracking-wide">
                  ثانوية مدرستي النموذجية
                </h3>
                <span className="text-[10px] text-brand-cyan block">
                  بطاقة هوية طالب منتظم
                </span>
              </div>
            </div>

            <div className="text-left" dir="ltr">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
                2026 - 2027
              </span>
            </div>
          </div>

          {/* Card Body: Student Photo + Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-surface-secondary border-2 border-brand-cyan/60 flex items-center justify-center text-brand-cyan font-black text-4xl shadow-glow">
                ع
              </div>
              <span className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-brand-teal text-background">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            <div className="flex-1 space-y-3 text-center sm:text-right">
              <div>
                <span className="text-[11px] text-muted block">اسم الطالب الرباعي:</span>
                <h2 className="text-lg font-black text-foreground">
                  {student.full_name}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted block text-[11px]">الرقم الأكاديمي:</span>
                  <span className="font-mono font-bold text-brand-cyan text-sm">2026-0101</span>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">المرحلة والمسار:</span>
                  <span className="font-bold text-foreground">ثالث ثانوي (علمي - 1)</span>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">تاريخ الإصدار:</span>
                  <span className="font-bold text-foreground" dir="ltr">01/09/2026</span>
                </div>
                <div>
                  <span className="text-muted block text-[11px]">صلاحية البطاقة:</span>
                  <span className="font-bold text-brand-teal" dir="ltr">30/06/2027</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer: Barcode & QR Code */}
          <div className="pt-4 border-t border-border/80 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-muted block">رمز التحقق الإلكتروني للمرور:</span>
              <div className="flex items-center gap-1 font-mono text-[10px] text-foreground/80 tracking-widest">
                |||| | ||||| || |||| ||| |||||
              </div>
            </div>

            <div className="p-2 rounded-xl bg-surface border border-border flex items-center gap-2">
              <QrCode className="w-8 h-8 text-brand-cyan" />
              <span className="text-[10px] text-muted hidden sm:inline">مسح ضوئي</span>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation user={student} />
    </div>
  );
}
