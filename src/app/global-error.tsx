"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalRootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Root Error:", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-[#0b101b] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#131c2e] border border-white/10 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              حدث خطأ في النظام
            </h2>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              حدث خطأ أثناء تحميل واجهة التطبيق. اضغط أدناه لإعادة تشغيل الصفحة بأمان.
            </p>
          </div>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة تحميل المنصة</span>
          </button>
        </div>
      </body>
    </html>
  );
}
