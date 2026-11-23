"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  BookOpen,
  PlusCircle,
  Edit3,
  Trash2,
  UserCheck,
  CheckCircle2,
  X,
  Save,
  Users,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { MOCK_USERS } from "@/lib/mock-data";
import { getStoredUsers, AppUser } from "@/lib/user-store";
import {
  getStoredSubjects,
  saveStoredSubject,
  deleteStoredSubject,
  getStoredGrades,
  SubjectAssignment,
} from "@/lib/academic-store";
import { getProfilesFromDB } from "@/lib/services/users-service";
import {
  getSubjectsFromDB,
  getGradeLevelsFromDB,
  createSubjectAction,
} from "@/lib/services/academic-service";

export default function AdminSubjectsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const admin = MOCK_USERS.admin;

  const [subjects, setSubjects] = useState<SubjectAssignment[]>([]);
  const [teachersList, setTeachersList] = useState<AppUser[]>([]);
  const [gradesList, setGradesList] = useState<string[]>([]);

  const loadData = async () => {
    try {
      const [teachers, dbSubjects, dbGrades] = await Promise.all([
        getProfilesFromDB("TEACHER"),
        getSubjectsFromDB(),
        getGradeLevelsFromDB(),
      ]);

      if (teachers && teachers.length > 0) {
        setTeachersList(
          teachers.map((t) => ({
            id: t.id,
            full_name: t.full_name,
            username: t.username,
            role: "TEACHER",
            phone: t.phone || "",
            password: "",
            permissions: [],
            status: "active",
          }))
        );
        setNewTeacher(teachers[0].full_name);
      }

      if (dbGrades && dbGrades.length > 0) {
        setGradesList(dbGrades.map((g) => g.name));
      }

      if (dbSubjects && dbSubjects.length > 0) {
        setSubjects(
          dbSubjects.map((s, idx) => ({
            id: s.id,
            name: s.name,
            code: s.code,
            type: s.subject_type === "practical" ? "practical" : "theory",
            grade: idx < 4 ? "الثالث الثانوي" : idx < 6 ? "الأول الثانوي" : "الثاني الثانوي",
            section: "الشعبة (أ)",
            teacherName: teachers[idx % Math.max(1, teachers.length)]?.full_name || "م. بلال الشميري",
          }))
        );
      } else {
        setSubjects(getStoredSubjects());
      }
    } catch {
      setSubjects(getStoredSubjects());
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"theory" | "practical">("theory");
  const [newGrade, setNewGrade] = useState("الثالث الثانوي");
  const [newTeacher, setNewTeacher] = useState("");
  const [newSection, setNewSection] = useState("الشعبة (أ)");

  // Edit Modal State
  const [editingSubject, setEditingSubject] = useState<SubjectAssignment | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editType, setEditType] = useState<"theory" | "practical">("theory");
  const [editGrade, setEditGrade] = useState("");
  const [editTeacher, setEditTeacher] = useState("");
  const [editSection, setEditSection] = useState("");

  // Feedback Alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const teacherToAssign = newTeacher || (teachersList[0]?.full_name || "م. بلال الشميري");
    const code = newCode.trim() || `SUB-${Math.floor(100 + Math.random() * 900)}`;

    const res = await createSubjectAction(newName.trim(), code, newType);
    if (!res.success) {
      showToast(res.error || "فشل إضافة المادة.");
      return;
    }

    await loadData();
    setIsAddModalOpen(false);
    setNewName("");
    setNewCode("");
    showToast(`✅ تمت إضافة مادة "${newName.trim()}" وحفظها في Supabase بنجاح!`);
  };

  const handleOpenEdit = (sub: SubjectAssignment) => {
    setEditingSubject(sub);
    setEditName(sub.name);
    setEditCode(sub.code);
    setEditType(sub.type);
    setEditGrade(sub.grade);
    setEditTeacher(sub.teacherName);
    setEditSection(sub.section);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !editName.trim()) return;

    const updated: SubjectAssignment = {
      ...editingSubject,
      name: editName.trim(),
      code: editCode.trim(),
      type: editType,
      grade: editGrade,
      teacherName: editTeacher,
      section: editSection,
    };

    saveStoredSubject(updated);
    setSubjects(getStoredSubjects());
    showToast(`تم تعديل المادة وإسنادها إلى "${editTeacher}" بنجاح!`);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف مقرر "${name}" نهائياً من النظام؟`)) {
      deleteStoredSubject(id);
      setSubjects(getStoredSubjects());
      showToast(`تم حذف مقرر "${name}" بنجاح.`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader user={admin} onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={admin} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Breadcrumb */}
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
                <BookOpen className="w-6 h-6 text-brand-cyan" />
                المواد الدراسية وإسناد المعلمين
              </h1>
              <p className="text-xs text-muted">
                إدارة المقررات، الرموز، وإسناد كل مادة للمعلم المعتمد والشعب الدراسية
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-cyan text-background text-xs font-bold shadow-glow hover:brightness-110 flex items-center justify-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة مادة وإسناد معلم</span>
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Subjects List */}
        <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden">
          <div className="p-5 border-b border-border/80 flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-cyan" />
              المقررات الدراسية النشطة
            </h3>
            <span className="text-xs text-muted font-bold">
              {subjects.length} مقررات مسجلة
            </span>
          </div>

          <div className="divide-y divide-border/60">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-secondary text-brand-cyan flex items-center justify-center font-bold text-sm shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">
                        {sub.name}
                      </h4>
                      <StatusBadge
                        type={sub.type}
                        label={sub.type === "theory" ? "نظري" : "عملي"}
                      />
                    </div>
                    <span className="text-xs text-muted">
                      رمز المقرر: <strong className="text-foreground">{sub.code}</strong> • {sub.grade}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted self-end sm:self-auto">
                  <div className="text-right">
                    <span className="flex items-center gap-1.5 text-foreground font-semibold">
                      <UserCheck className="w-3.5 h-3.5 text-brand-teal" />
                      المعلم المسند: <strong className="text-brand-cyan">{sub.teacherName}</strong>
                    </span>
                    <span className="text-[11px] text-muted block mt-0.5">
                      الشعب: {sub.section}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="p-2 rounded-xl bg-surface-secondary hover:bg-brand-cyan/20 text-brand-cyan transition-colors"
                      title="تعديل اسم وبيانات المادة أو إسناد معلم آخر"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(sub.id, sub.name)}
                      className="p-2 rounded-xl bg-surface-secondary hover:bg-status-danger/20 text-status-danger transition-colors"
                      title="حذف المقرر"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DeveloperFooter />
      </main>

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-cyan" />
                تعديل المادة وإسناد المعلم
              </h3>
              <button
                onClick={() => setEditingSubject(null)}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  اسم المادة
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    رمز المقرر
                  </label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    نوع المادة
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="theory">نظري</option>
                    <option value="practical">عملي</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Teachers Dropdown */}
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  إسناد إلى معلم (يحتوي جميع المعلمين المضافين بالمنصة)
                </label>
                <select
                  value={editTeacher}
                  onChange={(e) => setEditTeacher(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                >
                  {teachersList.map((t) => (
                    <option key={t.id} value={t.full_name}>
                      {t.full_name} (@{t.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    الصف الدراسي
                  </label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                  >
                    {gradesList.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    الشعبة المسندة
                  </label>
                  <input
                    type="text"
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-cyan text-background font-bold shadow-glow flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-brand-cyan" />
                إضافة مادة دراسية وإسنادها لمعلم
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  اسم المادة
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فيزياء الحركة الموجية"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    رمز المادة
                  </label>
                  <input
                    type="text"
                    placeholder="PHY-201"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    نوع المادة
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="theory">نظري</option>
                    <option value="practical">عملي</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Teachers Dropdown: Reads all registered teachers! */}
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  إسناد لمعلم (جميع المعلمين المسجلين)
                </label>
                <select
                  value={newTeacher}
                  onChange={(e) => setNewTeacher(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                >
                  {teachersList.length === 0 ? (
                    <option value="">لا يوجد معلمون مسجلون حالياً</option>
                  ) : (
                    teachersList.map((t) => (
                      <option key={t.id} value={t.full_name}>
                        {t.full_name} (@{t.username})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    الصف الدراسي
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                  >
                    {gradesList.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    الشعبة المستهدفة
                  </label>
                  <input
                    type="text"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-cyan text-background font-bold shadow-glow"
                >
                  إنشاء المادة وإسنادها
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
