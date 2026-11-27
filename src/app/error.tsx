"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js app-level caught error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-surface border border-border shadow-2xl text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-status-danger/10 border border-status-danger/30 text-status-danger flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-black text-foreground">
            حدث خطأ غير متوقع في الصفحة
          </h2>
          <p className="text-xs text-muted mt-2 leading-relaxed">
            تم استدراك الخطأ بنجاح للحفاظ على سلامة الجلسة والبيانات. يمكنك إعادة محاولة تحميل الصفحة أو الانتقال للرئيسية.
          </p>
          {error?.message && (
            <p className="mt-3 p-2.5 rounded-xl bg-surface-secondary text-[11px] font-mono text-status-danger/80 truncate" dir="ltr">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center justify-center gap-2 shadow-glow hover:brightness-110 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>الصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
