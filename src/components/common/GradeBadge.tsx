import React from "react";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface GradeBadgeProps {
  score?: number | null;
  maxScore: number;
  className?: string;
}

export function GradeBadge({ score, maxScore, className }: GradeBadgeProps) {
  const isGraded = score !== undefined && score !== null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-border bg-surface",
        className
      )}
    >
      <Award className="w-3.5 h-3.5 text-brand-cyan" />
      <span>
        {isGraded ? (
          <strong className="text-brand-cyan font-bold">{score}</strong>
        ) : (
          <span className="text-muted">الدرجة القصوى:</span>
        )}
        {" / "}
        <span className="text-foreground">{maxScore}</span>
      </span>
    </div>
  );
}
