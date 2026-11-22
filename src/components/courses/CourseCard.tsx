import React from "react";
import Link from "next/link";
import { BookOpen, Network, ShieldCheck, Code2, Calculator, ChevronLeft } from "lucide-react";
import { ClassSubject } from "@/types/database.types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: ClassSubject & {
    lessons_count?: number;
    assignments_count?: number;
    progress_percentage?: number;
  };
  basePath?: string;
  className?: string;
}

export function CourseCard({
  course,
  basePath = "/student/courses",
  className,
}: CourseCardProps) {
  const getSubjectIcon = (iconName?: string | null) => {
    switch (iconName) {
      case "Network":
        return Network;
      case "ShieldCheck":
        return ShieldCheck;
      case "Code2":
        return Code2;
      case "Calculator":
        return Calculator;
      default:
        return BookOpen;
    }
  };

  const Icon = getSubjectIcon(course.subject?.icon_name);
  const subjectType = course.subject?.subject_type || "theory";

  return (
    <Link
      href={`${basePath}/${course.id}`}
      className={cn(
        "group relative block p-4 sm:p-5 rounded-2xl bg-surface hover:bg-surface-secondary border border-border hover:border-brand-cyan/40 transition-all duration-200 shadow-card",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Right side (RTL): Icon & Subject Name */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-surface-secondary group-hover:bg-brand-cyan/10 border border-border group-hover:border-brand-cyan/30 flex items-center justify-center text-brand-cyan transition-colors shrink-0">
            <Icon className="w-6 h-6" />
          </div>

          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-brand-cyan transition-colors truncate">
              {course.subject?.name}
            </h3>
            {course.teacher && (
              <p className="text-xs text-muted truncate mt-0.5">
                المعلم: {course.teacher.full_name}
              </p>
            )}
          </div>
        </div>

        {/* Left side: Type Badge & Navigation chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge
            type={subjectType}
            label={subjectType === "theory" ? "نظري" : "عملي"}
          />
          <ChevronLeft className="w-5 h-5 text-muted group-hover:text-brand-cyan group-hover:-translate-x-1 transition-all" />
        </div>
      </div>

      {/* Progress or Quick Stats (if provided) */}
      {(course.lessons_count !== undefined || course.progress_percentage !== undefined) && (
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-4">
            {course.lessons_count !== undefined && (
              <span>{course.lessons_count} محاضرات / دروس</span>
            )}
            {course.assignments_count !== undefined && (
              <span>{course.assignments_count} تكاليف</span>
            )}
          </div>
          {course.progress_percentage !== undefined && (
            <span className="font-semibold text-brand-cyan">
              {course.progress_percentage}% إنجاز
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
