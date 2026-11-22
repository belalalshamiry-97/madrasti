"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RotateCcw, GraduationCap, BookOpen } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="max-w-md w-full p-8 rounded-3xl bg-surface border border-border shadow-card space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-status-danger/20 text-status-danger flex items-center justify-center mx-auto">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-brand-cyan mb-2">
            <GraduationCap className="w-5 h-5" />
            <span className="font-extrabold text-sm">منصة مدرستي</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground">
            أنت غير متصل بالإنترنت
          </h1>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            تعذّر الاتصال بخادم المنصة. لا تقلق، بإمكانك تصفح المواد والدروس المحفوظة مسبقاً في ذاكرة جهازك.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border text-xs text-muted text-right space-y-2">
          <h4 className="font-bold text-foreground flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-brand-cyan" />
            ما الذي يمكنك القيام به دون اتصال؟
          </h4>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            <li>مراجعة ملفات PDF والدروس المحفوظة في ذاكرة التخزين المؤقت.</li>
            <li>كتابة مسودات حلول الواجبات وحفظها على هاتفك.</li>
            <li>الاطلاع على جدول المحاضرات ومواعيد التسليم المسجلة.</li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center gap-1.5 hover:brightness-110 shadow-glow transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة المحاولة
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-surface-secondary text-muted hover:text-foreground text-xs font-semibold border border-border transition-colors"
          >
            الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
