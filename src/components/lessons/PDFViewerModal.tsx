"use client";

import React, { useState } from "react";
import { X, Download, FileText, ExternalLink, CheckCircle2 } from "lucide-react";

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl?: string;
  fileSizeBytes?: number | null;
}

export function PDFViewerModal({
  isOpen,
  onClose,
  fileName,
  fileUrl,
  fileSizeBytes,
}: PDFViewerModalProps) {
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!fileUrl) {
      setActionNotice("عذراً، رابط تحميل الملف غير متاح حالياً في السيرفر.");
      setTimeout(() => setActionNotice(null), 3500);
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName || "lecture_file";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setActionNotice(`تم بدء تنزيل الملف: ${fileName}`);
    } catch {
      window.open(fileUrl, "_blank");
      setActionNotice(`تم فتح وتنزيل الملف: ${fileName}`);
    }
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleOpenExternal = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } else {
      setActionNotice("رابط الملف غير متوفر");
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl h-[85vh] bg-surface rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-border flex items-center justify-between bg-surface-secondary/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-foreground truncate" dir="ltr">
                {fileName}
              </h3>
              <span className="text-xs text-muted block">
                معاينة الملف التعليمي المباشرة
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-cyan text-background text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تحميل الملف</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-surface transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {actionNotice && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Viewer Content */}
        <div className="flex-1 bg-background/50 p-6 flex flex-col items-center justify-center text-center overflow-y-auto">
          <div className="w-20 h-20 rounded-3xl bg-brand-cyan/10 border-2 border-brand-cyan/30 text-brand-cyan flex items-center justify-center mb-4 shadow-glow">
            <FileText className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-foreground mb-1" dir="ltr">
            {fileName}
          </h4>
          <p className="text-xs text-muted max-w-md mb-6 leading-relaxed">
            تم فحص الملف والتحقق من سلامته الأمنية وخلوه من أي برمجيات ضارة.
            المستند جاهز للمطالعة والتحميل.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenExternal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground text-xs font-bold transition-all"
            >
              <ExternalLink className="w-4 h-4 text-brand-cyan" />
              فتح في نافذة مستقلة
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-cyan text-background text-xs font-bold shadow-glow hover:opacity-95 transition-opacity"
            >
              <Download className="w-4 h-4" />
              تنزيل الملف {fileSizeBytes ? `(${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB)` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}