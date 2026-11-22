"use client";

import React from "react";
import { Code2, Phone, MessageCircle, Heart, ShieldCheck } from "lucide-react";

interface DeveloperFooterProps {
  className?: string;
}

export function DeveloperFooter({ className = "" }: DeveloperFooterProps) {
  return (
    <footer className={`w-full py-6 mt-8 border-t border-border/80 text-center text-xs space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-2 text-muted">
        <span className="flex items-center gap-1.5 font-medium">
          <Code2 className="w-4 h-4 text-brand-cyan" />
          تم تصميم وبناء وتطوير المنصة بواسطة:
        </span>
        <span className="font-bold text-foreground bg-surface-secondary px-3 py-1 rounded-full border border-brand-cyan/30 text-brand-cyan shadow-sm flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" />
          المهندس بلال الشميري
        </span>
      </div>

      <div className="flex items-center justify-center gap-4 text-muted pt-1">
        <a
          href="tel:783085075"
          className="flex items-center gap-1.5 hover:text-brand-cyan transition-colors font-mono font-bold text-xs"
          dir="ltr"
          title="اتصال هاتفي"
        >
          <Phone className="w-3.5 h-3.5 text-brand-teal" />
          +967 783085075
        </a>

        <span className="text-border">•</span>

        <a
          href="https://wa.me/967783085075"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-brand-teal transition-colors font-bold text-xs text-brand-teal"
          title="محادثة واتساب"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          تواصل عبر واتساب
        </a>
      </div>

      <p className="text-[11px] text-muted/60 pt-0.5">
        ثانوية مدرستي LMS — جميع حقوق الملكية والتطوير محفوظة © 2026-2027
      </p>
    </footer>
  );
}
