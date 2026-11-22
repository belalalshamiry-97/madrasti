import React from "react";
import { cn } from "@/lib/utils";

export type BadgeType =
  | "theory"
  | "practical"
  | "scheduled"
  | "late"
  | "assignment"
  | "activity"
  | "completed"
  | "pending"
  | "new";

interface StatusBadgeProps {
  type: BadgeType | string;
  label?: string;
  className?: string;
}

export function StatusBadge({ type, label, className }: StatusBadgeProps) {
  const getBadgeConfig = () => {
    switch (type) {
      case "theory":
        return {
          text: label || "نظري",
          classes: "bg-[#0EA5E9]/20 text-[#38BDF8] border border-[#0EA5E9]/30",
        };
      case "practical":
        return {
          text: label || "عملي",
          classes: "bg-[#2CB6A3]/20 text-[#2CB6A3] border border-[#2CB6A3]/30",
        };
      case "scheduled":
        return {
          text: label || "مجدولة",
          classes: "bg-[#0EA5E9]/20 text-[#38BDF8] border border-[#0EA5E9]/30",
        };
      case "late":
        return {
          text: label || "متأخر",
          classes: "bg-[#EF4444]/20 text-[#F87171] border border-[#EF4444]/30",
        };
      case "assignment":
        return {
          text: label || "تكليف",
          classes: "bg-[#0EA5E9]/20 text-[#38BDF8] border border-[#0EA5E9]/30",
        };
      case "activity":
        return {
          text: label || "نشاط",
          classes: "bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30",
        };
      case "completed":
        return {
          text: label || "مكتمل",
          classes: "bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/30",
        };
      case "pending":
        return {
          text: label || "قيد الانتظار",
          classes: "bg-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/30",
        };
      case "new":
        return {
          text: label || "جديد",
          classes: "bg-[#EF4444] text-white font-bold animate-pulse",
        };
      default:
        return {
          text: label || type,
          classes: "bg-[#243449] text-[#94A3B8]",
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-semibold rounded-md select-none transition-all",
        config.classes,
        className
      )}
    >
      {config.text}
    </span>
  );
}
