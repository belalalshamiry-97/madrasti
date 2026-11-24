"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, FileCheck, MessageSquare, User } from "lucide-react";
import { Profile } from "@/types/database.types";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  user?: Profile | null;
}

export function BottomNavigation({ user }: BottomNavigationProps) {
  const pathname = usePathname();
  const userRole = user?.role || "STUDENT";

  const getHomeLink = () => {
    switch (userRole) {
      case "ADMIN":
        return "/admin";
      case "TEACHER":
        return "/teacher";
      case "STUDENT":
      default:
        return "/student";
    }
  };

  const navItems = [
    { label: "الرئيسية", href: getHomeLink(), icon: Home },
    {
      label: "موادي",
      href: userRole === "TEACHER" ? "/teacher/courses" : "/student/courses",
      icon: BookOpen,
    },
    {
      label: "واجباتي",
      href: userRole === "TEACHER" ? "/teacher/grading" : "/student/assignments",
      icon: FileCheck,
    },
    { label: "الرسائل", href: "/messages", icon: MessageSquare },
    { label: "حسابي", href: "/profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur border-t border-border px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all",
                isActive
                  ? "text-brand-cyan font-bold"
                  : "text-muted hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-transform",
                  isActive && "scale-110 bg-brand-cyan/15 text-brand-cyan"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
