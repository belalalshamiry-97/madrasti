"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Layers,
  PlusCircle,
  Users,
  CheckCircle2,
  Trash2,
  Building,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS } from "@/lib/mock-data";

export default function AdminClassesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const admin = MOCK_USERS.admin;

  const [sections, setSections] = useState([
    { id: "1", name: "الشعبة (أ)", grade: "الثالث الثانوي", track: "علمي", capacity: 30, enrolled: 28 },
    { id: "2", name: "الشعبة (ب)", grade: "الثالث الثانوي", track: "علمي", capacity: 30, enrolled: 26 },
    { id: "3", name: "الشعبة (أ)", grade: "الثاني الثانوي", track: "علمي", capacity: 32, enrolled: 30 },
    { id: "4", name: "الشعبة (ب)", grade: "الثاني الثانوي", track: "أدبي", capacity: 25, enrolled: 22 },
    { id: "5", name: "الشعبة (أ)", grade: "الأول الثانوي", track: "عام", capacity: 35, enrolled: 34 },
    { id: "6", name: "الشعبة (ب)", grade: "الأول الثانوي", track: "عام", capacity: 35, enrolled: 32 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("الشعبة (ج)");
  const [newGrade, setNewGrade] = useState("الثالث الثانوي");
  const [newTrack, setNewTrack] = useState("علمي");
  const [newCapacity, setNewCapacity] = useState(30);

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    setSections((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newSectionName,
        grade: newGrade,
        track: newTrack,
        capacity: newCapacity,
        enrolled: 0,
      },
    ]);
    setIsModalOpen(false);
    alert("تمت إضافة الشعبة بنجاح!");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader
        user={admin}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={admin}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">
              إدارة الصفوف والشعب الدراسية
            </h1>
            <p className="text-xs text-status-warning mt-0.5">
              تهيئة الفصول، المسارات، والقدرة الاستيعابية
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-cyan text-background text-xs font-bold shadow-glow hover:opacity-90 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة شعبة</span>
          </button>
        </div>

        {/* Grade Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-1">
            <span className="text-xs text-muted block">المرحلة الأولى</span>
            <h3 className="text-lg font-bold text-foreground">الأول الثانوي</h3>
            <p className="text-xs text-brand-cyan">المسار العام المشترك (شعبتان)</p>
          </div>
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-1">
            <span className="text-xs text-muted block">المرحلة الثانية</span>
            <h3 className="text-lg font-bold text-foreground">الثاني الثانوي</h3>
            <p className="text-xs text-brand-teal">المسار العلمي والأدبي (شعبتان)</p>
          </div>
          <div className="p-5 rounded-2xl bg-surface border border-border space-y-1">
            <span className="text-xs text-muted block">المرحلة الثالثة</span>
            <h3 className="text-lg font-bold text-foreground">الثالث الثانوي</h3>
            <p className="text-xs text-status-warning">الشهادة الثانوية العامة (شعبتان)</p>
          </div>
        </div>

        {/* Sections Table */}
        <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden">
          <div className="p-5 border-b border-border/80 flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-cyan" />
              الشعب الدراسية الحالية
            </h3>
            <span className="text-xs text-muted font-bold">
              {sections.length} شعب معتمدة
            </span>
          </div>

          <div className="divide-y divide-border/60">
            {sections.map((section) => (
              <div
                key={section.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-secondary text-brand-cyan flex items-center justify-center font-bold text-sm shrink-0">
                    {section.name.replace(/[^أ-ي]/g, "") || "ش"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {section.grade} — {section.name}
                    </h4>
                    <span className="text-xs text-muted">
                      المسار: <strong className="text-brand-teal">{section.track}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-muted self-end sm:self-auto">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-brand-cyan" />
                    المقيدون: <strong className="text-foreground">{section.enrolled}</strong> / {section.capacity}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-brand-teal/15 text-brand-teal">
                    نشطة
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Section Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-2xl max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-foreground pb-2 border-b border-border">
              إضافة شعبة دراسية جديدة
            </h3>
            <form onSubmit={handleAddSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  اسم الشعبة
                </label>
                <input
                  type="text"
                  required
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  الصف الدراسي
                </label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-cyan"
                >
                  <option value="الأول الثانوي">الأول الثانوي</option>
                  <option value="الثاني الثانوي">الثاني الثانوي</option>
                  <option value="الثالث الثانوي">الثالث الثانوي</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  المسار الدراسي
                </label>
                <select
                  value={newTrack}
                  onChange={(e) => setNewTrack(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-cyan"
                >
                  <option value="علمي">علمي</option>
                  <option value="أدبي">أدبي</option>
                  <option value="عام">عام</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  القدرة الاستيعابية (عدد الطلاب)
                </label>
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(parseInt(e.target.value) || 30)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary hover:bg-surface text-foreground font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-cyan text-background font-bold shadow-glow"
                >
                  إضافة الشعبة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNavigation user={admin} />
    </div>
  );
}