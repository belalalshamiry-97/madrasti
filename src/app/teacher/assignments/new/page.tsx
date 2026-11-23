"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Send,
  Save,
  FileCheck,
  Calendar,
  Clock,
  Award,
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS, MOCK_COURSES, MOCK_LESSONS } from "@/lib/mock-data";
import { validateFile, formatBytes } from "@/lib/storage";
import { getActiveUser } from "@/lib/user-store";
import { getClassSubjectsFromDB, ClassSubjectAssignment } from "@/lib/services/academic-service";
import { createAssignmentInDB } from "@/lib/services/assignments-service";

export default function TeacherNewAssignmentPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teacher, setTeacher] = useState(MOCK_USERS.teacher1);
  const [availableClasses, setAvailableClasses] = useState<ClassSubjectAssignment[]>([]);

  // Form states
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [assignmentType, setAssignmentType] = useState<"assignment" | "activity">("assignment");
  const [maxScore, setMaxScore] = useState<number>(10);
  const [openDate, setOpenDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16)
  );
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [allowLateSubmissions, setAllowLateSubmissions] = useState(true);
  const [allowResubmissions, setAllowResubmissions] = useState(true);

  // Attached files by teacher
  const [attachments, setAttachments] = useState<{ name: string; size: number }[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const active = getActiveUser("TEACHER");
    setTeacher(active);

    async function loadData() {
      const classes = await getClassSubjectsFromDB();
      setAvailableClasses(classes);
      if (classes.length > 0) {
        setSelectedCourseId(classes[0].id);
      }
    }
    loadData();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const validation = validateFile({ name: file.name, size: file.size });

    if (!validation.isValid) {
      setFileError(validation.error || "الملف غير صالح.");
      return;
    }

    setAttachments((prev) => [...prev, { name: file.name, size: file.size }]);
  };

  const removeFile = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim() || !instructions.trim()) {
      setErrorMessage("يرجى ملء عنوان التكليف والتعليمات المطلوبة للطلاب.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAssignmentInDB({
        class_subject_id: selectedCourseId,
        lesson_id: selectedLessonId || undefined,
        title: title.trim(),
        instructions: instructions.trim(),
        assignment_type: assignmentType,
        max_score: maxScore,
        open_date: openDate ? new Date(openDate).toISOString() : new Date().toISOString(),
        due_date: dueDate ? new Date(dueDate).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString(),
        max_attempts: maxAttempts,
        allow_late_submissions: allowLateSubmissions,
        allow_resubmissions: allowResubmissions,
        attachments: attachments.map((a) => ({
          name: a.name,
          file_path: `assignments/${a.name}`,
          file_size_bytes: a.size,
        })),
      });

      if (!res.success) {
        setErrorMessage(res.error || "تعذر حفظ التكليف في قاعدة البيانات.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage("تم إنشاء التكليف ونشره في قاعدة البيانات للطلاب بنجاح!");
      setTimeout(() => {
        router.push("/teacher");
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء حفظ التكليف.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader
        user={teacher}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={teacher}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/teacher"
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">
              إنشاء واجب / نشاط جديد
            </h1>
            <p className="text-xs text-brand-teal mt-0.5">
              تحديد الشروط ومواعيد التسليم والدرجات
            </p>
          </div>
          <div className="w-6" />
        </div>

        {successMessage && (
          <div className="p-4 rounded-2xl bg-brand-teal/15 border border-brand-teal/30 text-brand-teal text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Target Course & Lesson */}
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
            <h3 className="text-base font-bold text-foreground pb-2 border-b border-border/80">
              المادة والدرس المرتبط
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  المادة والشعبة الدراسية
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
                >
                  {availableClasses.length > 0 ? (
                    availableClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.subject_name} — {c.section_name} ({c.grade_name})
                      </option>
                    ))
                  ) : (
                    MOCK_COURSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.subject?.name} — شعبة (أ)
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  الدرس المرتبط (اختياري)
                </label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
                >
                  <option value="">غير مرتبط بدرس محدد</option>
                  {MOCK_LESSONS.map((l) => (
                    <option key={l.id} value={l.id}>
                      المحاضرة {l.lesson_number}: {l.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Assignment Details */}
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
            <h3 className="text-base font-bold text-foreground pb-2 border-b border-border/80">
              بيانات التكليف والتعليمات
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  عنوان الواجب / النشاط
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تكليف 3 — إعداد خادم DNS ومناطق التحليل"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal placeholder-muted/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  نوع التكليف
                </label>
                <select
                  value={assignmentType}
                  onChange={(e) => setAssignmentType(e.target.value as "assignment" | "activity")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
                >
                  <option value="assignment">واجب دراسي (تكليف)</option>
                  <option value="activity">نشاط صفي / بحثي</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                تعليمات المعلم وشروط الحل
              </label>
              <textarea
                rows={4}
                required
                placeholder="اكتب بالتفصيل المطلوب من الطالب إنجازه، صيغ الحل المقبولة، وكيفية التقييم..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal placeholder-muted/60"
              />
            </div>

            {/* Reference File Attachment */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                إرفاق ملف مرجعي أو نموذج أسئلة (PDF / Word)
              </label>
              <div className="border border-dashed border-border rounded-xl p-4 text-center bg-surface-secondary/40">
                <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-teal/20 text-brand-teal border border-brand-teal/30 text-xs font-bold cursor-pointer hover:bg-brand-teal/30 transition-colors">
                  <UploadCloud className="w-4 h-4" />
                  <span>اختيار ملف مرفق</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.jpg,.png"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {fileError && (
                <p className="text-xs text-status-danger mt-1.5">{fileError}</p>
              )}

              {attachments.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-surface-secondary flex items-center justify-between text-xs border border-border"
                    >
                      <span className="font-semibold text-foreground truncate max-w-[250px]" dir="ltr">
                        {file.name} ({formatBytes(file.size)})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-muted hover:text-status-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Deadlines, Scoring & Policies */}
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
            <h3 className="text-base font-bold text-foreground pb-2 border-b border-border/80">
              المواعيد والدرجات وسياسات التسليم
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-brand-cyan" />
                  الدرجة القصوى
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  step={0.5}
                  value={maxScore}
                  onChange={(e) => setMaxScore(parseFloat(e.target.value) || 10)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-status-warning" />
                  موعد الاستحقاق والتسليم
                </label>
                <input
                  type="datetime-local"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  عدد محاولات التسليم
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
                />
              </div>
            </div>

            {/* Checkbox Policies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-secondary border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowLateSubmissions}
                  onChange={(e) => setAllowLateSubmissions(e.target.checked)}
                  className="rounded text-brand-teal focus:ring-0"
                />
                <span className="text-xs font-semibold text-foreground">
                  السماح بالتسليم المتأخر (مع وضع شارة "متأخر")
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-secondary border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowResubmissions}
                  onChange={(e) => setAllowResubmissions(e.target.checked)}
                  className="rounded text-brand-teal focus:ring-0"
                />
                <span className="text-xs font-semibold text-foreground">
                  السماح بإعادة التسليم بعد ملاحظات المعلم
                </span>
              </label>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-brand-teal to-brand-cyan text-background text-sm font-bold shadow-glow hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              <Send className="w-4 h-4 rotate-180" />
              {isSubmitting ? "جاري الحفظ والنشر..." : "نشر الواجب للطلاب"}
            </button>
          </div>
        </form>
      </main>

      <BottomNavigation user={teacher} />
    </div>
  );
}