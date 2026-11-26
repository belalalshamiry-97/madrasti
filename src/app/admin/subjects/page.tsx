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
  Layers,
  AlertCircle,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { getProfilesFromDB } from "@/lib/services/users-service";
import {
  getSubjectsFromDB,
  getClassSubjectsFromDB,
  getSectionsFromDB,
  getSemestersFromDB,
  getGradeLevelsFromDB,
  createSubjectAction,
  updateSubjectAction,
  deleteSubjectAction,
  assignTeacherToSubjectAction,
  updateClassSubjectTeacherAction,
  deleteClassSubjectAction,
  SubjectData,
  ClassSubjectAssignment,
  AcademicSectionData,
  SemesterData,
  AcademicGradeData,
} from "@/lib/services/academic-service";
import { Profile } from "@/types/database.types";
import { getActiveUser } from "@/lib/user-store";

export default function AdminSubjectsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>({
    full_name: "مدير المدرسة",
    role: "ADMIN",
  });

  const [activeTab, setActiveTab] = useState<"subjects" | "assignments">("subjects");

  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [assignments, setAssignments] = useState<ClassSubjectAssignment[]>([]);
  const [sections, setSections] = useState<AcademicSectionData[]>([]);
  const [grades, setGrades] = useState<AcademicGradeData[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("ALL");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectData | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditAssignModalOpen, setIsEditAssignModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ClassSubjectAssignment | null>(null);
  const [editAssignTeacherId, setEditAssignTeacherId] = useState("");

  const [subjectToDelete, setSubjectToDelete] = useState<SubjectData | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<ClassSubjectAssignment | null>(null);

  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectType, setSubjectType] = useState<"theory" | "practical" | "both">("theory");
  const [subjectDesc, setSubjectDesc] = useState("");

  const [assignSemesterId, setAssignSemesterId] = useState("");
  const [assignGradeId, setAssignGradeId] = useState("");
  const [assignSectionId, setAssignSectionId] = useState("");
  const [assignSubjectId, setAssignSubjectId] = useState("");
  const [assignTeacherId, setAssignTeacherId] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [dbSubjects, dbAssignments, dbSections, dbGrades, dbSemesters, dbTeachers] =
        await Promise.all([
          getSubjectsFromDB(),
          getClassSubjectsFromDB(),
          getSectionsFromDB(),
          getGradeLevelsFromDB(),
          getSemestersFromDB(),
          getProfilesFromDB("TEACHER"),
        ]);

      setSubjects(dbSubjects);
      setAssignments(dbAssignments);
      setSections(dbSections);
      setGrades(dbGrades);
      setSemesters(dbSemesters);
      setTeachers(dbTeachers);

      if (dbSemesters.length > 0) {
        const activeSem = dbSemesters.find((s) => s.is_active) || dbSemesters[0];
        setAssignSemesterId(activeSem.id);
      }
      if (dbGrades.length > 0) {
        setAssignGradeId(dbGrades[0].id);
        const gradeSecs = dbSections.filter((s) => s.grade_level_id === dbGrades[0].id);
        if (gradeSecs.length > 0) setAssignSectionId(gradeSecs[0].id);
      } else if (dbSections.length > 0) {
        setAssignSectionId(dbSections[0].id);
      }
      if (dbSubjects.length > 0) setAssignSubjectId(dbSubjects[0].id);
      if (dbTeachers.length > 0) setAssignTeacherId(dbTeachers[0].id);
    } catch (err) {
      console.error("Failed to load academic data from Supabase:", err);
      showToast("تعذر جلب البيانات من قاعدة البيانات.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const active = getActiveUser("ADMIN");
    if (active) setAdminUser(active);
    loadAllData();
  }, []);

  const handleOpenAddSubject = () => {
    setSubjectName("");
    setSubjectCode(`SUB-${Math.floor(100 + Math.random() * 900)}`);
    setSubjectType("theory");
    setSubjectDesc("");
    setModalError(null);
    setIsAddSubjectModalOpen(true);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim() || !subjectCode.trim()) {
      setModalError("اسم المقرر ورمزه مطلوبان.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    const res = await createSubjectAction(
      subjectName.trim(),
      subjectCode.trim(),
      subjectType,
      subjectDesc.trim()
    );

    setIsSubmitting(false);

    if (!res.success) {
      setModalError(res.error || "فشل إنشاء المقرر.");
      return;
    }

    showToast(`✅ تمت إضافة مادة "${subjectName.trim()}" إلى Supabase بنجاح!`);
    setIsAddSubjectModalOpen(false);
    await loadAllData();
  };

  const handleOpenEditSubject = (sub: SubjectData) => {
    setEditingSubject(sub);
    setSubjectName(sub.name);
    setSubjectCode(sub.code);
    setSubjectType(
      sub.subject_type === "practical" ? "practical" : sub.subject_type === "both" ? "both" : "theory"
    );
    setSubjectDesc(sub.description || "");
    setModalError(null);
    setIsEditSubjectModalOpen(true);
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !subjectName.trim() || !subjectCode.trim()) {
      setModalError("اسم المقرر ورمزه مطلوبان.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    const res = await updateSubjectAction(
      editingSubject.id,
      subjectName.trim(),
      subjectCode.trim(),
      subjectType,
      subjectDesc.trim()
    );

    setIsSubmitting(false);

    if (!res.success) {
      setModalError(res.error || "فشل تعديل المقرر.");
      return;
    }

    showToast(`✅ تم تعديل مادة "${subjectName.trim()}" بنجاح في Supabase!`);
    setIsEditSubjectModalOpen(false);
    setEditingSubject(null);
    await loadAllData();
  };

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return;
    setIsSubmitting(true);
    setModalError(null);

    const res = await deleteSubjectAction(subjectToDelete.id);
    setIsSubmitting(false);

    if (!res.success) {
      setModalError(res.error || "فشل حذف المادة.");
      return;
    }

    showToast(`✅ تم حذف مادة "${subjectToDelete.name}" من Supabase بنجاح!`);
    setSubjectToDelete(null);
    await loadAllData();
  };

  const handleGradeChangeInAssign = (gradeId: string) => {
    setAssignGradeId(gradeId);
    const matching = sections.filter((s) => s.grade_level_id === gradeId);
    if (matching.length > 0) {
      setAssignSectionId(matching[0].id);
    } else {
      setAssignSectionId("");
    }
  };

  const handleOpenAssignModal = () => {
    setModalError(null);
    if (semesters.length > 0) {
      const activeSem = semesters.find((s) => s.is_active) || semesters[0];
      setAssignSemesterId(activeSem.id);
    }
    if (grades.length > 0) {
      const firstGrade = grades[0];
      setAssignGradeId(firstGrade.id);
      const matchingSecs = sections.filter((s) => s.grade_level_id === firstGrade.id);
      if (matchingSecs.length > 0) {
        setAssignSectionId(matchingSecs[0].id);
      } else if (sections.length > 0) {
        setAssignSectionId(sections[0].id);
      }
    } else if (sections.length > 0) {
      setAssignSectionId(sections[0].id);
    }
    if (subjects.length > 0) setAssignSubjectId(subjects[0].id);
    if (teachers.length > 0) setAssignTeacherId(teachers[0].id);
    setIsAssignModalOpen(true);
  };

  const handleOpenEditAssignment = (assign: ClassSubjectAssignment) => {
    setEditingAssignment(assign);
    setEditAssignTeacherId(assign.teacher_id);
    setModalError(null);
    setIsEditAssignModalOpen(true);
  };

  const handleUpdateAssignmentTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment || !editAssignTeacherId) {
      setModalError("يرجى اختيار المعلم الجديد.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    const res = await updateClassSubjectTeacherAction(editingAssignment.id, editAssignTeacherId);
    setIsSubmitting(false);

    if (!res.success) {
      setModalError(res.error || "فشل تحديث المعلم المسند.");
      return;
    }

    showToast(`✅ تم تحديث معلم مادة "${editingAssignment.subject_name}" بنجاح في Supabase!`);
    setIsEditAssignModalOpen(false);
    setEditingAssignment(null);
    await loadAllData();
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignSectionId || !assignSubjectId || !assignTeacherId || !assignSemesterId) {
      setModalError("يرجى اختيار الشعبة، والمادة، والمعلم، والفصل الدراسي.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    const res = await assignTeacherToSubjectAction(
      assignSectionId,
      assignSubjectId,
      assignTeacherId,
      assignSemesterId
    );

    setIsSubmitting(false);

    if (!res.success) {
      setModalError(res.error || "فشل حفظ الإسناد.");
      return;
    }

    showToast("✅ تم إسناد المقرر للمعلم والشعبة بنجاح في Supabase!");
    setIsAssignModalOpen(false);
    await loadAllData();
  };

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    setIsSubmitting(true);

    const res = await deleteClassSubjectAction(assignmentToDelete.id);
    setIsSubmitting(false);

    if (!res.success) {
      showToast(res.error || "فشل إلغاء الإسناد.");
      return;
    }

    showToast("✅ تم إلغاء إسناد المادة بنجاح وحفظ التغيير في Supabase!");
    setAssignmentToDelete(null);
    await loadAllData();
  };

  const filteredSubjects = subjects.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.section_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade =
      selectedGradeFilter === "ALL" ? true : a.grade_name.includes(selectedGradeFilter);
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader user={adminUser} onOpenSidebar={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={adminUser} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
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
                <BookOpen className="w-6 h-6 text-brand-teal" />
                إدارة المقررات الدراسية وإسناد المعلمين
              </h1>
              <p className="text-xs text-muted">
                إدارة دليل المواد في Supabase وتوزيع الحصص التدريسية على الكادر التعليمي والشعب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "subjects" ? (
              <button
                onClick={handleOpenAddSubject}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-cyan text-background text-xs font-bold shadow-glow hover:brightness-110 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>إضافة مقرر جديد</span>
              </button>
            ) : (
              <button
                onClick={handleOpenAssignModal}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-teal text-background text-xs font-bold shadow-glow hover:brightness-110 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>إسناد مقرر لمعلم وشعبة</span>
              </button>
            )}
          </div>
        </div>

        {toastMessage && (
          <div className="p-4 rounded-2xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface border border-border">
          <button
            onClick={() => setActiveTab("subjects")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "subjects"
                ? "bg-brand-cyan text-background shadow-glow"
                : "text-muted hover:text-foreground"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>دليل المقررات الدراسية ({subjects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "assignments"
                ? "bg-brand-teal text-background shadow-glow"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>إسنادات التدريس للشعب والمعلمين ({assignments.length})</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute right-3.5 top-3 text-muted" />
            <input
              type="text"
              placeholder={
                activeTab === "subjects"
                  ? "البحث في المقررات بالاسم أو الرمز..."
                  : "البحث باسم المادة، المعلم، أو الشعبة..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan placeholder:text-muted"
            />
          </div>

          {activeTab === "assignments" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-muted shrink-0" />
              <select
                value={selectedGradeFilter}
                onChange={(e) => setSelectedGradeFilter(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs font-bold focus:outline-none focus:border-brand-cyan"
              >
                <option value="ALL">جميع الصفوف الثانوية</option>
                <option value="الأول">الأول الثانوي</option>
                <option value="الثاني">الثاني الثانوي</option>
                <option value="الثالث">الثالث الثانوي</option>
              </select>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="p-16 text-center rounded-3xl bg-surface border border-border space-y-3">
            <Loader2 className="w-8 h-8 text-brand-cyan animate-spin mx-auto" />
            <p className="text-xs text-muted">جاري تحميل البيانات الأكاديمية الحقيقية من Supabase...</p>
          </div>
        ) : activeTab === "subjects" ? (
          <div className="space-y-4">
            {filteredSubjects.length === 0 ? (
              <div className="p-16 text-center rounded-3xl bg-surface border border-border space-y-3">
                <BookOpen className="w-12 h-12 text-muted mx-auto opacity-40" />
                <h3 className="text-sm font-bold text-foreground">لا توجد مقررات دراسية مطابقة</h3>
                <p className="text-xs text-muted">
                  يمكنك إضافة مقررات جديدة وحفظها مباشرة في قاعدة البيانات.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-5 rounded-3xl bg-surface border border-border hover:border-brand-cyan/40 transition-all shadow-card space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center font-bold">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground">{sub.name}</h3>
                            <span className="text-[11px] font-mono text-brand-cyan">{sub.code}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            sub.subject_type === "practical"
                              ? "bg-brand-teal/15 text-brand-teal border-brand-teal/30"
                              : sub.subject_type === "both"
                              ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                              : "bg-surface-secondary text-foreground border-border"
                          }`}
                        >
                          {sub.subject_type === "practical"
                            ? "عملي"
                            : sub.subject_type === "both"
                            ? "نظري وعملي"
                            : "نظري"}
                        </span>
                      </div>

                      {sub.description && (
                        <p className="text-xs text-muted mt-2.5 line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] text-muted">
                        مسند لـ (
                        {assignments.filter((a) => a.subject_id === sub.id).length}) شعبة
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditSubject(sub)}
                          className="p-1.5 rounded-lg bg-surface-secondary hover:bg-surface text-muted hover:text-foreground transition-colors"
                          title="تعديل المقرر"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSubjectToDelete(sub);
                            setModalError(null);
                          }}
                          className="p-1.5 rounded-lg bg-status-danger/10 hover:bg-status-danger/20 text-status-danger transition-colors"
                          title="حذف المقرر"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.length === 0 ? (
              <div className="p-16 text-center rounded-3xl bg-surface border border-border space-y-3">
                <Layers className="w-12 h-12 text-muted mx-auto opacity-40" />
                <h3 className="text-sm font-bold text-foreground">لا توجد إسنادات تدريس مسجلة</h3>
                <p className="text-xs text-muted">
                  قم بإسناد المقررات الدراسية إلى المعلمين والشعب لتظهر في لوحة كل معلم.
                </p>
                <button
                  onClick={handleOpenAssignModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-teal text-background text-xs font-bold shadow-glow"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>إسناد مقرر الآن</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
                <table className="w-full text-right text-xs">
                  <thead className="bg-surface-secondary border-b border-border text-muted font-bold">
                    <tr>
                      <th className="py-3 px-4">المقرر الدراسي</th>
                      <th className="py-3 px-4">رمز المقرر</th>
                      <th className="py-3 px-4">الصف والشعبة</th>
                      <th className="py-3 px-4">المعلم المسند</th>
                      <th className="py-3 px-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredAssignments.map((assign) => (
                      <tr key={assign.id} className="hover:bg-surface-secondary/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          {assign.subject_name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-brand-cyan">
                          {assign.subject_code}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-foreground">
                            {assign.grade_name}
                          </span>
                          <span className="text-muted mr-1.5">({assign.section_name})</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center font-bold text-[10px]">
                              {assign.teacher_name.charAt(0)}
                            </div>
                            <span className="font-bold text-foreground">{assign.teacher_name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditAssignment(assign)}
                              className="p-1.5 rounded-lg bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal transition-colors"
                              title="تعديل المعلم المسند"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setAssignmentToDelete(assign)}
                              className="p-1.5 rounded-lg bg-status-danger/10 hover:bg-status-danger/20 text-status-danger transition-colors"
                              title="إلغاء الإسناد"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: ADD SUBJECT */}
      {isAddSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface border border-border w-full max-w-lg rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-base font-bold text-foreground">إضافة مقرر دراسي جديد لـ Supabase</h3>
              </div>
              <button
                onClick={() => setIsAddSubjectModalOpen(false)}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-2xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubject} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">اسم المقرر الدراسي *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الرياضيات التطبيقية، إدارة الشبكات..."
                  value={subjectName}
                  onChange={(e) => {
                    setSubjectName(e.target.value);
                    if (modalError) setModalError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">رمز المقرر (Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="NET-301"
                    value={subjectCode}
                    onChange={(e) => {
                      setSubjectCode(e.target.value);
                      if (modalError) setModalError(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-mono uppercase focus:outline-none focus:border-brand-cyan"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">نوع المادة الدراسية</label>
                  <select
                    value={subjectType}
                    onChange={(e: any) => setSubjectType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="theory">نظري</option>
                    <option value="practical">عملي</option>
                    <option value="both">نظري وعملي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">وصف المقرر وأهدافه</label>
                <textarea
                  rows={2}
                  placeholder="وصف مختصر للمقرر والمهارات المكتسبة..."
                  value={subjectDesc}
                  onChange={(e) => setSubjectDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-cyan text-background font-bold flex items-center gap-1.5 shadow-glow hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ في Supabase...</span>
                    </>
                  ) : (
                    <span>حفظ المقرر في Supabase</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SUBJECT */}
      {isEditSubjectModalOpen && editingSubject && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface border border-border w-full max-w-lg rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-teal" />
                <h3 className="text-base font-bold text-foreground">تعديل بيانات المقرر الدراسي</h3>
              </div>
              <button
                onClick={() => setIsEditSubjectModalOpen(false)}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-2xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSubject} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">اسم المقرر الدراسي *</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => {
                    setSubjectName(e.target.value);
                    if (modalError) setModalError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">رمز المقرر (Code) *</label>
                  <input
                    type="text"
                    required
                    value={subjectCode}
                    onChange={(e) => {
                      setSubjectCode(e.target.value);
                      if (modalError) setModalError(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-mono uppercase focus:outline-none focus:border-brand-teal"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">نوع المادة الدراسية</label>
                  <select
                    value={subjectType}
                    onChange={(e: any) => setSubjectType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-teal"
                  >
                    <option value="theory">نظري</option>
                    <option value="practical">عملي</option>
                    <option value="both">نظري وعملي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">الوصف والأهداف</label>
                <textarea
                  rows={2}
                  value={subjectDesc}
                  onChange={(e) => setSubjectDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditSubjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-teal text-background font-bold flex items-center gap-1.5 shadow-glow hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري تحديث Supabase...</span>
                    </>
                  ) : (
                    <span>حفظ التعديلات</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN SUBJECT TO TEACHER & SECTION */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface border border-border w-full max-w-lg rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-brand-teal" />
                <h3 className="text-base font-bold text-foreground">إسناد مقرر دراسي لمعلم وشعبة</h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-2xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">الفصل الدراسي *</label>
                <select
                  required
                  value={assignSemesterId}
                  onChange={(e) => setAssignSemesterId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-teal"
                >
                  {semesters.map((sem) => (
                    <option key={sem.id} value={sem.id}>
                      {sem.name} {sem.year_name ? `• ${sem.year_name}` : ""} {sem.is_active ? "(النشط)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">الصف الدراسي *</label>
                  <select
                    required
                    value={assignGradeId}
                    onChange={(e) => handleGradeChangeInAssign(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-teal"
                  >
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">الشعبة الدراسية *</label>
                  <select
                    required
                    value={assignSectionId}
                    onChange={(e) => setAssignSectionId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-teal"
                  >
                    {sections
                      .filter((s) => !assignGradeId || s.grade_level_id === assignGradeId)
                      .map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name} {sec.track_name ? `(${sec.track_name})` : ""}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">المقرر الدراسي (من Supabase) *</label>
                <select
                  required
                  value={assignSubjectId}
                  onChange={(e) => setAssignSubjectId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-teal"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">المعلم المسؤول عن التدريس *</label>
                <select
                  required
                  value={assignTeacherId}
                  onChange={(e) => setAssignTeacherId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-teal"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} (@{t.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-teal text-background font-bold flex items-center gap-1.5 shadow-glow hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري حفظ الإسناد في Supabase...</span>
                    </>
                  ) : (
                    <span>تأكيد الإسناد الرسمي</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ASSIGNMENT (CHANGE TEACHER) */}
      {isEditAssignModalOpen && editingAssignment && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface border border-border w-full max-w-lg rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-teal" />
                <h3 className="text-base font-bold text-foreground">تعديل المعلم المسند للمقرر</h3>
              </div>
              <button
                onClick={() => setIsEditAssignModalOpen(false)}
                className="p-1 rounded-xl text-muted hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-2xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-surface-secondary border border-border space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted">المادة الدراسية:</span>
                <span className="font-bold text-foreground">{editingAssignment.subject_name} ({editingAssignment.subject_code})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">الصف والشعبة:</span>
                <span className="font-bold text-foreground">{editingAssignment.grade_name} - شعبة {editingAssignment.section_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">الفصل الدراسي:</span>
                <span className="font-bold text-foreground">
                  {semesters.find((s) => s.id === editingAssignment.semester_id)?.name || "الفصل الحالي"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">المعلم الحالي:</span>
                <span className="font-bold text-brand-cyan">{editingAssignment.teacher_name}</span>
              </div>
            </div>

            <form onSubmit={handleUpdateAssignmentTeacher} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-foreground mb-1">اختيار المعلم الجديد *</label>
                <select
                  required
                  value={editAssignTeacherId}
                  onChange={(e) => setEditAssignTeacherId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-bold focus:outline-none focus:border-brand-teal"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} (@{t.username})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted mt-1.5">
                  تغيير المعلم يحافظ على جميع الدروس والواجبات والاختبارات المرتبطة بالمقرر، وتظهر المادة فوراً للمعلم الجديد ولجميع طلاب الشعبة.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-teal text-background font-bold flex items-center gap-1.5 shadow-glow hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري تحديث المعلم...</span>
                    </>
                  ) : (
                    <span>تأكيد تغيير المعلم</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE SUBJECT MODAL */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface border border-border w-full max-w-md rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 text-status-danger">
              <div className="w-10 h-10 rounded-2xl bg-status-danger/15 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">تأكيد حذف المقرر الدراسي</h3>
                <p className="text-xs text-muted">هذا الإجراء سيحذف المادة من قاعدة البيانات نهائياً.</p>
              </div>
            </div>

            {modalError && (
              <div className="p-3 rounded-2xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <p className="text-xs text-foreground bg-surface-secondary p-3 rounded-2xl border border-border">
              هل أنت متأكد من رغبتك في حذف مادة: <strong className="text-brand-cyan">{subjectToDelete.name}</strong> ({subjectToDelete.code})؟
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubjectToDelete(null)}
                className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteSubject}
                className="px-5 py-2 rounded-xl bg-status-danger text-white text-xs font-bold hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <span>نعم، حذف المقرر</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ASSIGNMENT MODAL */}
      {assignmentToDelete && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface border border-border w-full max-w-md rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 text-status-danger">
              <div className="w-10 h-10 rounded-2xl bg-status-danger/15 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">إلغاء إسناد التدريس</h3>
                <p className="text-xs text-muted">سيتم إزالة ارتباط المعلم بهذه الشعبة والمادة.</p>
              </div>
            </div>

            <p className="text-xs text-foreground bg-surface-secondary p-3 rounded-2xl border border-border leading-relaxed">
              هل أنت متأكد من إلغاء إسناد مادة <strong className="text-brand-teal">{assignmentToDelete.subject_name}</strong> للمعلم <strong className="text-brand-cyan">{assignmentToDelete.teacher_name}</strong> في {assignmentToDelete.grade_name} ({assignmentToDelete.section_name})؟
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssignmentToDelete(null)}
                className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground text-xs"
              >
                تراجع
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteAssignment}
                className="px-5 py-2 rounded-xl bg-status-danger text-white text-xs font-bold hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الإلغاء...</span>
                  </>
                ) : (
                  <span>نعم، إلغاء الإسناد</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeveloperFooter />
      <BottomNavigation user={adminUser} />
    </div>
  );
}
