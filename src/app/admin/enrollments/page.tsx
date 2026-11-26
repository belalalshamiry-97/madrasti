"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Users,
  Search,
  CheckCircle2,
  ArrowRightLeft,
  UserPlus,
  GraduationCap,
  Layers,
  Phone,
  X,
  AlertCircle,
  Loader2,
  Edit3,
  RefreshCw,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import {
  createUserInDB,
  getEnrolledStudentsFromDB,
  updateStudentAction,
  EnrolledStudentData,
} from "@/lib/services/users-service";
import {
  getGradeLevelsFromDB,
  getSectionsFromDB,
  AcademicGradeData,
  AcademicSectionData,
} from "@/lib/services/academic-service";
import { getActiveUser } from "@/lib/user-store";

export default function AdminEnrollmentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>({
    full_name: "مدير المدرسة",
    role: "ADMIN",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<EnrolledStudentData[]>([]);
  const [gradesList, setGradesList] = useState<AcademicGradeData[]>([]);
  const [sectionsList, setSectionsList] = useState<AcademicSectionData[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [sectionFilter, setSectionFilter] = useState("ALL");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Register State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("123456");
  const [newPhone, setNewPhone] = useState("");
  const [newGradeId, setNewGradeId] = useState("");
  const [newSectionId, setNewSectionId] = useState("");

  // Modal Edit / Transfer State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<EnrolledStudentData | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editGradeId, setEditGradeId] = useState("");
  const [editSectionId, setEditSectionId] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [dbStudents, dbGrades, dbSections] = await Promise.all([
        getEnrolledStudentsFromDB(),
        getGradeLevelsFromDB(),
        getSectionsFromDB(),
      ]);

      setStudents(dbStudents);
      setGradesList(dbGrades);
      setSectionsList(dbSections);

      if (dbGrades.length > 0) {
        setNewGradeId(dbGrades[0].id);
        const matching = dbSections.filter((s) => s.grade_level_id === dbGrades[0].id);
        if (matching.length > 0) {
          setNewSectionId(matching[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load enrollment data:", err);
      showToast("تعذر جلب بيانات الطلاب والقيد من Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const active = getActiveUser("ADMIN");
    if (active) setAdminUser(active);
    loadAllData();
  }, []);

  const handleRegisterGradeChange = (gradeId: string) => {
    setNewGradeId(gradeId);
    const matching = sectionsList.filter((s) => s.grade_level_id === gradeId);
    if (matching.length > 0) {
      setNewSectionId(matching[0].id);
    } else {
      setNewSectionId("");
    }
  };

  const handleOpenRegisterModal = () => {
    setNewName("");
    setNewUsername(`std${Math.floor(1000 + Math.random() * 9000)}`);
    setNewPassword("123456");
    setNewPhone("");
    if (gradesList.length > 0) {
      setNewGradeId(gradesList[0].id);
      const matching = sectionsList.filter((s) => s.grade_level_id === gradesList[0].id);
      if (matching.length > 0) setNewSectionId(matching[0].id);
    }
    setModalError(null);
    setIsRegisterModalOpen(true);
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!newName.trim() || !newUsername.trim()) {
      setModalError("يرجى إدخال اسم الطالب واسم المستخدم/رقم القيد.");
      return;
    }

    if (!newSectionId) {
      setModalError("يرجى اختيار شعبة دراسية صالحة للطالب.");
      return;
    }

    const cleanUsername = newUsername.trim().toLowerCase();
    const cleanPwd = newPassword.trim() || "123456";

    if (cleanPwd.length < 6) {
      setModalError("كلمة المرور قصيرة: تشترط منصة Supabase كلمة مرور من 6 خانات أو أحرف على الأقل.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createUserInDB({
        full_name: newName.trim(),
        username: cleanUsername,
        password: cleanPwd,
        role: "STUDENT",
        grade_id: newGradeId,
        section_id: newSectionId,
        phone: newPhone.trim() || "770000000",
        status: "active",
      });

      if (!result.success) {
        setModalError(result.error || "فشل تسجيل الطالب في قاعدة البيانات.");
        return;
      }

      showToast(
        `✅ تم تسجيل وقيد الطالب "${newName.trim()}" في Supabase بنجاح! وربطه تلقائياً بمواد شعبته.`
      );
      setIsRegisterModalOpen(false);
      await loadAllData();
    } catch (err: any) {
      setModalError(err.message || "حدث خطأ غير متوقع أثناء تسجيل الطالب.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditStudent = (student: EnrolledStudentData) => {
    setEditingStudent(student);
    setEditFullName(student.full_name);
    setEditPhone(student.phone || "");
    setEditIsActive(student.is_active);

    const targetGradeId = student.grade_level_id || (gradesList.length > 0 ? gradesList[0].id : "");
    setEditGradeId(targetGradeId);

    const matching = sectionsList.filter((s) => s.grade_level_id === targetGradeId);
    if (student.section_id && matching.some((s) => s.id === student.section_id)) {
      setEditSectionId(student.section_id);
    } else if (matching.length > 0) {
      setEditSectionId(matching[0].id);
    } else {
      setEditSectionId("");
    }

    setModalError(null);
    setIsEditModalOpen(true);
  };

  const handleEditGradeChange = (gradeId: string) => {
    setEditGradeId(gradeId);
    const matching = sectionsList.filter((s) => s.grade_level_id === gradeId);
    if (matching.length > 0) {
      setEditSectionId(matching[0].id);
    } else {
      setEditSectionId("");
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    if (!editFullName.trim()) {
      setModalError("اسم الطالب مطلوب ولا يمكن تركه فارغاً.");
      return;
    }

    if (!editSectionId) {
      setModalError("يرجى اختيار الشعبة الدراسية المنقول إليها الطالب.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const res = await updateStudentAction({
        student_id: editingStudent.id,
        full_name: editFullName.trim(),
        phone: editPhone.trim(),
        section_id: editSectionId,
        is_active: editIsActive,
      });

      if (!res.success) {
        setModalError(res.error || "فشل تحديث بيانات الطالب.");
        return;
      }

      showToast(`✅ تم تحديث بيانات ونقل شعبة الطالب "${editFullName.trim()}" بنجاح في Supabase!`);
      setIsEditModalOpen(false);
      setEditingStudent(null);
      await loadAllData();
    } catch (err: any) {
      setModalError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone && s.phone.includes(searchTerm));
    const matchesGrade = gradeFilter === "ALL" || s.grade_name === gradeFilter;
    const matchesSection = sectionFilter === "ALL" || s.section_name === sectionFilter;
    return matchesSearch && matchesGrade && matchesSection;
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader user={adminUser} onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={adminUser} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
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
                تسجيل وقيد الطلاب وتوزيع الشعب (Supabase)
              </h1>
              <p className="text-xs text-muted">
                إدارة تسجيل الطلاب وربطهم تلقائياً بمواد شعبهم الأكاديمية مع إمكانية النقل وتعديل البيانات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenRegisterModal}
              className="px-4 py-2 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center gap-1.5 shadow-glow hover:brightness-110 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>تسجيل طالب جديد وقيده</span>
            </button>
            <button
              onClick={loadAllData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground transition-colors"
              title="تحديث البيانات من Supabase"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-brand-cyan" : ""}`} />
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
              placeholder="البحث باسم الطالب أو رقم القيد أو الهاتف..."
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
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
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
              {Array.from(new Set(sectionsList.map((s) => s.name))).map((secName) => (
                <option key={secName} value={secName}>
                  شعبة {secName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Enrolled Students Table */}
        <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden">
          <div className="p-5 border-b border-border/80 flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-cyan" />
              الطلاب المقيدون فعلياً في قاعدة البيانات
            </h3>
            <span className="text-xs text-muted font-bold">
              {filtered.length} طلاب مسجلين
            </span>
          </div>

          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
              <p className="text-xs text-muted">جاري تحميل سجلات الطلاب من Supabase...</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <div className="p-12 text-center text-muted text-xs space-y-2">
                  <p>لا يوجد طلاب مسجلون يطابقون شروط البحث.</p>
                  <p className="text-[11px]">يمكنك تسجيل طالب جديد وتعيين صفه وشعبته مباشرة.</p>
                </div>
              ) : (
                filtered.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-secondary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-secondary border border-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold text-sm shrink-0">
                        {student.full_name ? student.full_name.charAt(0) : "ط"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">
                            {student.full_name}
                          </h4>
                          {!student.is_active && (
                            <span className="px-2 py-0.5 rounded-md bg-status-danger/10 text-status-danger text-[10px] font-bold">
                              معطل
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted">
                          رقم القيد: <strong className="text-brand-cyan font-mono" dir="ltr">@{student.username}</strong> • {student.grade_name || "غير محدد"} • هاتف: {student.phone || "لا يوجد"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs self-end sm:self-auto">
                      <span className="px-3 py-1.5 rounded-xl bg-surface-secondary border border-border font-bold text-brand-cyan">
                        {student.section_name ? `شعبة ${student.section_name}` : "بدون شعبة"}
                      </span>

                      <button
                        onClick={() => handleOpenEditStudent(student)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground font-semibold transition-colors"
                        title="تعديل البيانات ونقل الشعبة"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-brand-teal" />
                        <span>تعديل ونقل</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <DeveloperFooter />
      </main>

      {/* MODAL: REGISTER NEW STUDENT */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 sm:p-7 rounded-3xl border border-border shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-base font-bold text-foreground">
                  تسجيل طالب جديد في Supabase
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsRegisterModalOpen(false);
                  setModalError(null);
                }}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-2xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  الاسم الرباعي الكامل للطالب *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عبد الله ناصر باعباد"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    اسم المستخدم / رقم القيد *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="student10"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-mono focus:outline-none focus:border-brand-cyan"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    كلمة المرور *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    placeholder="123456"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (modalError) setModalError(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-mono focus:outline-none focus:border-brand-cyan"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  رقم هاتف الطالب / ولي الأمر
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

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    الصف الدراسي *
                  </label>
                  <select
                    required
                    value={newGradeId}
                    onChange={(e) => handleRegisterGradeChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                  >
                    {gradesList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    الشعبة التابعة للصف *
                  </label>
                  <select
                    required
                    value={newSectionId}
                    onChange={(e) => setNewSectionId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                  >
                    {sectionsList
                      .filter((s) => !newGradeId || s.grade_level_id === newGradeId)
                      .map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          شعبة {sec.name} {sec.track_name ? `(${sec.track_name})` : ""}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-muted">
                عند تسجيل الطالب، سيرتبط فوراً بكافة مواد ومعلمي الشعبة المحددة.
              </p>

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
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري القيد في Supabase...</span>
                    </>
                  ) : (
                    <span>تأكيد قيد الطالب</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / TRANSFER STUDENT */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface p-6 sm:p-7 rounded-3xl border border-border shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-teal" />
                <h3 className="text-base font-bold text-foreground">
                  تعديل بيانات الطالب ونقل الشعبة
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingStudent(null);
                  setModalError(null);
                }}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-2xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-surface-secondary border border-border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted">اسم المستخدم:</span>
                <span className="font-mono font-bold text-brand-cyan">@{editingStudent.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">الشعبة الحالية:</span>
                <span className="font-bold text-foreground">
                  {editingStudent.grade_name || "غير محدد"} - شعبة {editingStudent.section_name || "غير محدد"}
                </span>
              </div>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">
                  الاسم الرباعي للطالب *
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  رقم هاتف الطالب / ولي الأمر
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-mono focus:outline-none focus:border-brand-teal"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    الصف الدراسي *
                  </label>
                  <select
                    required
                    value={editGradeId}
                    onChange={(e) => handleEditGradeChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-teal"
                  >
                    {gradesList.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    الشعبة المنقول إليها *
                  </label>
                  <select
                    required
                    value={editSectionId}
                    onChange={(e) => setEditSectionId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-teal"
                  >
                    {sectionsList
                      .filter((s) => !editGradeId || s.grade_level_id === editGradeId)
                      .map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          شعبة {sec.name} {sec.track_name ? `(${sec.track_name})` : ""}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-teal focus:ring-0"
                />
                <label htmlFor="editIsActive" className="text-foreground font-medium cursor-pointer">
                  حساب الطالب نشط ويمكنه الدخول للمنصة
                </label>
              </div>

              <p className="text-[11px] text-muted leading-relaxed">
                نقل الطالب إلى شعبة جديدة يحدّث تلقائياً قائمة مواده ومعلميه في حسابه، مع الحفاظ الكامل على كافة سجلات درجاته السابقة وواجباته.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-teal text-background font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري التحديث في Supabase...</span>
                    </>
                  ) : (
                    <span>تأكيد التعديل والنقل</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNavigation user={adminUser} />
    </div>
  );
}
