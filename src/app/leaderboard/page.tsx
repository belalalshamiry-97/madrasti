"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Sparkles,
  TrendingUp,
  Award,
  Crown,
  ChevronRight,
  Filter,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function LeaderboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const student = MOCK_USERS.student1;

  const [activeTrack, setActiveTrack] = useState<"sci3" | "lit3" | "grade2" | "grade1">("sci3");

  const studentsList = [
    { rank: 1, name: "سارة خالد الكثيري", gpa: "99.2%", score: "496 / 500", track: "ثالث ثانوي • علمي 1", badge: "المركز الأول" },
    { rank: 2, name: "عمر أحمد بافضل", gpa: "98.5%", score: "492.5 / 500", track: "ثالث ثانوي • علمي 1", badge: "المركز الثاني" },
    { rank: 3, name: "ريم علي العمودي", gpa: "97.8%", score: "489 / 500", track: "ثالث ثانوي • علمي 1", badge: "المركز الثالث" },
    { rank: 4, name: "محمد خالد العامري", gpa: "96.4%", score: "482 / 500", track: "ثالث ثانوي • علمي 1" },
    { rank: 5, name: "عبد الله محمد بن يحيى", gpa: "95.9%", score: "479.5 / 500", track: "ثالث ثانوي • علمي 1" },
    { rank: 6, name: "نور عبد الله باحارثة", gpa: "95.1%", score: "475.5 / 500", track: "ثالث ثانوي • علمي 1" },
    { rank: 7, name: "فاطمة صالح باوزير", gpa: "94.2%", score: "471 / 500", track: "ثالث ثانوي • علمي 1" },
  ];

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

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue to-status-warning text-background flex items-center justify-center font-bold shadow-glow">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">لوحة الشرف وقائمة الأوائل</h1>
              <p className="text-xs text-muted">
                أوائل طلاب ثانوية مدرستي للفصل الدراسي الأول 2026-2027
              </p>
            </div>
          </div>
        </div>

        {/* Podium: Top 3 Students */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-4 pb-2">
          {/* Rank 2 (Silver) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-brand-cyan/40 text-center space-y-2 order-1 shadow-card relative">
            <div className="w-12 h-12 rounded-2xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-black text-base mx-auto">
              2
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
              {studentsList[1].name}
            </h4>
            <span className="block text-sm sm:text-lg font-black text-brand-cyan">
              {studentsList[1].gpa}
            </span>
            <span className="text-[10px] text-muted block">
              {studentsList[1].track}
            </span>
          </div>

          {/* Rank 1 (Gold - Elevated) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-surface border-2 border-status-warning text-center space-y-3 order-2 shadow-2xl relative -translate-y-2">
            <div className="w-14 h-14 rounded-2xl bg-status-warning/20 text-status-warning flex items-center justify-center font-black text-xl mx-auto shadow-glow">
              <Crown className="w-7 h-7" />
            </div>
            <h4 className="text-sm sm:text-base font-black text-foreground truncate">
              {studentsList[0].name}
            </h4>
            <span className="block text-lg sm:text-2xl font-black text-status-warning">
              {studentsList[0].gpa}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-brand-teal block">
              {studentsList[0].score}
            </span>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-border text-center space-y-2 order-3 shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-surface-secondary text-foreground flex items-center justify-center font-black text-base mx-auto border border-border">
              3
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
              {studentsList[2].name}
            </h4>
            <span className="block text-sm sm:text-lg font-black text-foreground">
              {studentsList[2].gpa}
            </span>
            <span className="text-[10px] text-muted block">
              {studentsList[2].track}
            </span>
          </div>
        </div>

        {/* Full Leaderboard Table */}
        <div className="p-4 sm:p-6 rounded-3xl bg-surface border border-border shadow-card space-y-3">
          <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border">
            كافة الطلاب المتفوقين في الشعبة:
          </h3>

          <div className="space-y-2.5">
            {studentsList.map((st) => (
              <div
                key={st.rank}
                className={cn(
                  "p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors",
                  st.rank <= 3
                    ? "bg-surface-secondary/70 border-brand-cyan/30"
                    : "bg-surface-secondary/40 border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0",
                      st.rank === 1
                        ? "bg-status-warning text-background font-black"
                        : st.rank === 2
                        ? "bg-brand-cyan text-background font-black"
                        : st.rank === 3
                        ? "bg-brand-teal text-background font-black"
                        : "bg-surface text-muted border border-border"
                    )}
                  >
                    {st.rank}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      {st.name}
                    </h4>
                    <span className="text-[11px] text-muted block">
                      {st.track}
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-xs sm:text-sm font-black text-brand-cyan block">
                    {st.gpa}
                  </span>
                  <span className="text-[10px] text-muted block">
                    {st.score || "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNavigation user={student} />
    </div>
  );
}
