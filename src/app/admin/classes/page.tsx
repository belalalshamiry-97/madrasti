"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Layers,
  PlusCircle,
  Users,
  CheckCircle2,
  Trash2,
  GraduationCap,
  Sparkles,
  X,
  Plus,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { MOCK_USERS } from "@/lib/mock-data";
import {
  getStoredGrades,
  saveStoredGrade,
  deleteStoredGrade,
  getStoredSections,
  saveStoredSection,
  deleteStoredSection,
  AcademicGrade,
  AcademicSection,
} from "@/lib/academic-store";

export default function AdminClassesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const admin = MOCK_USERS.admin;

  const [grades, setGrades] = useState<AcademicGrade[]>([]);
  const [sections, setSections] = useState<AcademicSection[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setGrades(getStoredGrades());
    setSections(getStoredSections());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modal 1: Add New Grade / Class
  const [isAddGradeModalOpen, setIsAddGradeModalOpen] = useState(false);
  const [newGradeName, setNewGradeName] = useState("");
  const [newGradeStage, setNewGradeStage] = useState("المرحلة الثانوية");
  const [newGradeDescription, setNewGradeDescription] = useState("");
  const [newGradeTracks, setNewGradeTracks] = useState("علمي، أدبي");

  // Modal 2: Add New Section
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("الشعبة (ج)");
  const [selectedSectionGrade, setSelectedSectionGrade] = useState("الثالث الثانوي");
  const [newSectionTrack, setNewSectionTrack] = useState("علمي");
  const [newSectionCapacity, setNewSectionCapacity] = useState(30);

  const handleCreateGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradeName.trim()) return;

    const newGradeObj: AcademicGrade = {
      id: `grade-${Date.now()}`,
      name: newGradeName.trim(),
      stage: newGradeStage.trim() || "المرحلة الثانوية",
      description: newGradeDescription.trim() || "مرحلة دراسية جديدة",
      tracks: newGradeTracks.split("،").map((t) => t.trim()).filter(Boolean),
    };

    saveStoredGrade(newGradeObj);
    setGrades(getStoredGrades());
    setIsAddGradeModalOpen(false);
    setNewGradeName("");
    setNewGradeDescription("");
    showToast(`تمت إضافة الصف الدراسي الجديد "${newGradeObj.name}" بنجاح!`);
  };

  const handleDeleteGrade = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف الصف الدراسي "${name}"؟`)) {
      deleteStoredGrade(id);
      setGrades(getStoredGrades());
      showToast(`تم حذف الصف الدراسي "${name}".`);
    }
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    const newSectionObj: AcademicSection = {
      id: `sec-${Date.now()}`,
      name: newSectionName.trim(),
      grade: selectedSectionGrade,
      track: newSectionTrack,
      capacity: newSectionCapacity,
      enrolled: 0,
    };

    saveStoredSection(newSectionObj);
    setSections(getStoredSections());
    setIsAddSectionModalOpen(false);
    showToast(`تمت إضافة "${newSectionObj.name}" إلى ${newSectionObj.grade} بنجاح!`);
  };

  const handleDeleteSection = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف شعبة "${name}"؟`)) {
      deleteStoredSection(id);
      setSections(getStoredSections());
      showToast(`تم حذف شعبة "${name}".`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader user={admin} onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={admin} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                <Layers className="w-6 h-6 text-status-warning" />
                إدارة الصفوف والمراحل والشعب الدراسية
              </h1>
              <p className="text-xs text-muted">
                إمكانية إضافة صفوف دراسية جديدة للمدرسة وتوزيع الشعب والمسارات الاستيعابية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddGradeModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-status-warning text-black font-black text-xs flex items-center gap-1.5 shadow-glow hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صف دراسي جديد</span>
            </button>
            <button
              onClick={() => setIsAddSectionModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center gap-1.5 shadow-glow hover:brightness-110 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة شعبة جديدة</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Dynamic Grades Grid Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-cyan" />
              الصفوف والمراحل الدراسية المعتمدة بالمنصة ({grades.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {grades.map((g) => {
              const gradeSections = sections.filter((s) => s.grade === g.name);
              return (
                <div
                  key={g.id}
                  className="p-5 rounded-3xl bg-surface border border-border shadow-card hover:border-status-warning/40 transition-all space-y-2 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] text-muted block">{g.stage}</span>
                      <h4 className="text-base font-black text-foreground">{g.name}</h4>
                    </div>
                    {/* Delete grade button (for custom added grades) */}
                    {g.id.startsWith("grade-") && !["grade-1", "grade-2", "grade-3"].includes(g.id) && (
                      <button
                        onClick={() => handleDeleteGrade(g.id, g.name)}
                        className="p-1 rounded-lg text-muted hover:text-status-danger transition-colors"
                        title="حذف هذا الصف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted">{g.description}</p>
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-cyan">
                      {gradeSections.length} شعب دراسية
                    </span>
                    <span className="text-[11px] text-muted">
                      {g.tracks.join(" • ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sections Table */}
        <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden">
          <div className="p-5 border-b border-border/80 flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-cyan" />
              قائمة الشعب الدراسية المقيدة بالصفوف
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

                <div className="flex items-center gap-4 text-xs text-muted self-end sm:self-auto">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-brand-cyan" />
                    القدرة الاستيعابية: <strong className="text-foreground">{section.enrolled}</strong> / {section.capacity} طالب
                  </span>

                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-brand-teal/15 text-brand-teal">
                    شعبة نشطة
                  </span>

                  <button
                    onClick={() => handleDeleteSection(section.id, section.name)}
                    className="p-1.5 rounded-lg bg-surface-secondary hover:bg-status-danger/20 text-muted hover:text-status-danger transition-colors"
                    title="حذف الشعبة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DeveloperFooter />
      </main>

      {/* Modal 1: Add New Grade */}
      {isAddGradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-status-warning" />
                إضافة صف دراسي جديد للمدرسة
              </h3>
              <button
                onClick={() => setIsAddGradeModalOpen(false)}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGrade} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  اسم الصف الدراسي الجديد
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الرابع الإعدادي أو الصف المتقدم"
                  value={newGradeName}
                  onChange={(e) => setNewGradeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  المرحلة التعليمية
                </label>
                <input
                  type="text"
                  placeholder="مثال: المرحلة الثانوية العامة"
                  value={newGradeStage}
                  onChange={(e) => setNewGradeStage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  المسارات المعتمدة في هذا الصف (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  placeholder="مثال: علمي، أدبي، تكنولوجي"
                  value={newGradeTracks}
                  onChange={(e) => setNewGradeTracks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  وصف مختصر للصف
                </label>
                <textarea
                  rows={2}
                  placeholder="تفاصيل إضافية عن هذا الصف..."
                  value={newGradeDescription}
                  onChange={(e) => setNewGradeDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddGradeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-status-warning text-black font-black shadow-glow"
                >
                  حفظ الصف الدراسي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add New Section */}
      {isAddSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-brand-cyan" />
                إضافة شعبة دراسية جديدة
              </h3>
              <button
                onClick={() => setIsAddSectionModalOpen(false)}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  الصف الدراسي التابع له الشعبة
                </label>
                <select
                  value={selectedSectionGrade}
                  onChange={(e) => setSelectedSectionGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                >
                  {grades.map((g) => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    اسم الشعبة
                  </label>
                  <input
                    type="text"
                    required
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="الشعبة (ج)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    المسار الدراسي
                  </label>
                  <select
                    value={newSectionTrack}
                    onChange={(e) => setNewSectionTrack(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="علمي">علمي</option>
                    <option value="أدبي">أدبي</option>
                    <option value="عام">عام</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  القدرة الاستيعابية (عدد الطلاب)
                </label>
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={newSectionCapacity}
                  onChange={(e) => setNewSectionCapacity(parseInt(e.target.value) || 30)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddSectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-cyan text-background font-bold shadow-glow"
                >
                  حفظ الشعبة
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
