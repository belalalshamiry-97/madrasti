"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Users,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRightLeft,
  UserPlus,
  GraduationCap,
  Layers,
  Phone,
  X,
  Filter,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { MOCK_USERS } from "@/lib/mock-data";
import { getStoredGrades, AcademicGrade } from "@/lib/academic-store";

interface EnrolledStudent {
  id: string;
  name: string;
  username: string;
  grade: string;
  track: string;
  section: string;
  phone: string;
  enrollmentDate: string;
  status: "active" | "suspended";
}

export default function AdminEnrollmentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const admin = MOCK_USERS.admin;

  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [gradesList, setGradesList] = useState<AcademicGrade[]>([]);

  useEffect(() => {
    const list = getStoredGrades();
    setGradesList(list);
    if (list.length > 0) {
      setNewGrade(list[0].name);
    }
  }, []);

  const [students, setStudents] = useState<EnrolledStudent[]>([
    { id: "1", name: "عمر أحمد بافضل", username: "student1", grade: "الثالث الثانوي", track: "علمي", section: "الشعبة (أ)", phone: "777888999", enrollmentDate: "2026-09-01", status: "active" },
    { id: "2", name: "سارة خالد الكثيري", username: "student2", grade: "الثالث الثانوي", track: "علمي", section: "الشعبة (أ)", phone: "777999000", enrollmentDate: "2026-09-01", status: "active" },
    { id: "3", name: "محمد ياسين اليافعي", username: "student3", grade: "الثالث الثانوي", track: "علمي", section: "الشعبة (ب)", phone: "777666555", enrollmentDate: "2026-09-02", status: "active" },
    { id: "4", name: "أروى عبد الله بارحيم", username: "student4", grade: "الثاني الثانوي", track: "أدبي", section: "الشعبة (أ)", phone: "777444333", enrollmentDate: "2026-09-03", status: "active" },
    { id: "5", name: "خالد سعيد العامري", username: "student5", grade: "الأول الثانوي", track: "عام", section: "الشعبة (أ)", phone: "777222111", enrollmentDate: "2026-09-05", status: "active" },
    { id: "6", name: "فاطمة سالم باوزير", username: "student6", grade: "الأول الثانوي", track: "عام", section: "الشعبة (ب)", phone: "777123456", enrollmentDate: "2026-09-05", status: "active" },
  ]);

  // Modal State for Registering New Student to Any Grade
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newGrade, setNewGrade] = useState("الأول الثانوي");
  const [newTrack, setNewTrack] = useState("عام");
  const [newSection, setNewSection] = useState("الشعبة (أ)");
  const [newPhone, setNewPhone] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim()) return;

    const newStudent: EnrolledStudent = {
      id: `std-${Date.now()}`,
      name: newName.trim(),
      username: newUsername.trim(),
      grade: newGrade,
      track: newGrade === "الأول الثانوي" ? "عام" : newTrack,
      section: newSection,
      phone: newPhone.trim() || "770000000",
      enrollmentDate: new Date().toISOString().split("T")[0],
      status: "active",
    };

    setStudents((prev) => [newStudent, ...prev]);
    setIsRegisterModalOpen(false);
    setNewName("");
    setNewUsername("");
    setNewPhone("");
    showToast(`تم تسجيل الطالب "${newStudent.name}" في ${newStudent.grade} (${newStudent.section}) بنجاح!`);
  };

  const handleReassign = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextSec = s.section === "الشعبة (أ)" ? "الشعبة (ب)" : "الشعبة (أ)";
          return { ...s, section: nextSec };
        }
        return s;
      })
    );
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.includes(searchTerm) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === "ALL" || s.grade === gradeFilter;
    const matchesSection = sectionFilter === "ALL" || s.section === sectionFilter;
    return matchesSearch && matchesGrade && matchesSection;
  });

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
                <Users className="w-6 h-6 text-brand-cyan" />
                تسجيل وقيد الطلاب وتوزيع الشعب
              </h1>
              <p className="text-xs text-muted">
                إمكانية تسجيل طالب جديد لأي صف دراسي وتوزيعه على الشعب الأكاديمية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center gap-1.5 shadow-glow hover:brightness-110 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>تسجيل طالب جديد لأي صف</span>
            </button>
            <button
              onClick={() => alert("محاكاة استيراد ملف CSV: تم استيراد وتوزيع قائمة الطلاب بنجاح!")}
              className="px-3.5 py-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-brand-teal" />
              <span className="hidden sm:inline">استيراد CSV</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="البحث باسم الطالب أو رقم القيد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-surface border border-border text-foreground focus:outline-none focus:border-brand-cyan"
            />
          </div>

          <div>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-foreground font-semibold focus:outline-none focus:border-brand-cyan"
            >
              <option value="ALL">جميع الصفوف الدراسية</option>
              {gradesList.map((g) => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border text-foreground font-semibold focus:outline-none focus:border-brand-cyan"
            >
              <option value="ALL">جميع الشعب الدراسية</option>
              <option value="الشعبة (أ)">الشعبة (أ)</option>
              <option value="الشعبة (ب)">الشعبة (ب)</option>
            </select>
          </div>
        </div>

        {/* Enrolled Students Table */}
        <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden">
          <div className="p-5 border-b border-border/80 flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-cyan" />
              الطلاب المقيدون بالمنصة
            </h3>
            <span className="text-xs text-muted font-bold">
              {filtered.length} طلاب مسجلين
            </span>
          </div>

          <div className="divide-y divide-border/60">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-muted text-xs">
                لا يوجد طلاب مطابقين لمعايير البحث.
              </div>
            ) : (
              filtered.map((student) => (
                <div
                  key={student.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-secondary border border-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold text-sm shrink-0">
                      {student.name.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {student.name}
                      </h4>
                      <span className="text-xs text-muted">
                        رقم القيد: <strong className="text-brand-cyan font-mono" dir="ltr">@{student.username}</strong> • {student.grade} ({student.track}) • هاتف: {student.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs self-end sm:self-auto">
                    <span className="px-3 py-1 rounded-xl bg-surface-secondary border border-border font-bold text-brand-cyan">
                      {student.section}
                    </span>

                    <button
                      onClick={() => handleReassign(student.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground font-semibold transition-colors"
                      title="نقل إلى شعبة أخرى"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-brand-teal" />
                      <span>تبديل الشعبة</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DeveloperFooter />
      </main>

      {/* Register New Student Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 sm:p-7 rounded-3xl border border-border shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-base font-bold text-foreground">
                  تسجيل طالب جديد لأي صف
                </h3>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  الاسم الرباعي الكامل للطالب
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عبد الله ناصر بن محفوظ"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    رقم القيد / اسم المستخدم
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="student7"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-mono focus:outline-none focus:border-brand-cyan"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    رقم هاتف ولي الأمر
                  </label>
                  <input
                    type="text"
                    placeholder="777123456"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-mono focus:outline-none focus:border-brand-cyan"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    الصف الدراسي المطلوب
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                  >
                    {gradesList.map((g) => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    المسار والشعبة
                  </label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="الشعبة (أ)">الشعبة (أ)</option>
                    <option value="الشعبة (ب)">الشعبة (ب)</option>
                    <option value="الشعبة (ج)">الشعبة (ج)</option>
                  </select>
                </div>
              </div>

              {newGrade !== "الأول الثانوي" && (
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    المسار الأكاديمي
                  </label>
                  <select
                    value={newTrack}
                    onChange={(e) => setNewTrack(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="علمي">مسار علمي</option>
                    <option value="أدبي">مسار أدبي</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-cyan text-background font-bold shadow-glow"
                >
                  تأكيد قيد الطالب
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
