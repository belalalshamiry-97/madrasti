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
  Loader2,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DeveloperFooter } from "@/components/common/DeveloperFooter";
import { validateFile, formatBytes } from "@/lib/storage";
import { getActiveUser } from "@/lib/user-store";
import { getTeacherCoursesFromDB } from "@/lib/services/academic-service";
import { getLessonsForCourseFromDB } from "@/lib/services/lessons-service";
import { createAssignmentInDB } from "@/lib/services/assignments-service";
import { uploadFileAction } from "@/lib/services/storage-service";

export default function TeacherNewAssignmentPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teacher, setTeacher] = useState<any>({
    full_name: "المعلم",
    role: "TEACHER",
  });

  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);

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
  const [attachments, setAttachments] = useState<
    { file: File; name: string; size: number }[]
  >([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Load teacher assigned courses
  useEffect(() => {
    const active = getActiveUser("TEACHER");
    if (active) setTeacher(active);

    async function loadTeacherCourses() {
      setIsLoadingClasses(true);
      try {
        const teacherId = active?.id || active?.username;
        if (teacherId) {
          const courses = await getTeacherCoursesFromDB(teacherId);
          setAvailableClasses(courses || []);
          if (courses && courses.length > 0) {
            setSelectedCourseId(courses[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load teacher courses:", err);
      } finally {
        setIsLoadingClasses(false);
      }
    }

    loadTeacherCourses();
  }, []);

  // 2. Load lessons for selected course whenever selectedCourseId changes
  useEffect(() => {
    if (!selectedCourseId) {
      setCourseLessons([]);
      setSelectedLessonId("");
      return;
    }

    async function loadLessons() {
      setIsLoadingLessons(true);
      try {
        const lessons = await getLessonsForCourseFromDB(selectedCourseId);
        setCourseLessons(lessons || []);
        // Reset selected lesson when course changes
        setSelectedLessonId("");
      } catch (err) {
        console.error("Failed to load lessons for course:", err);
        setCourseLessons([]);
      } finally {
        setIsLoadingLessons(false);
      }
    }

    loadLessons();
  }, [selectedCourseId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const validation = validateFile({ name: file.name, size: file.size });

    if (!validation.isValid) {
      setFileError(validation.error || "الملف غير صالح.");
      return;
    }

    setAttachments((prev) => [...prev, { file, name: file.name, size: file.size }]);
  };

  const removeFile = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedCourseId) {
      setErrorMessage("يرجى اختيار المادة والشعبة الدراسية للتكليف.");
      return;
    }

    if (!title.trim() || !instructions.trim()) {
      setErrorMessage("يرجى ملء عنوان التكليف والتعليمات المطلوبة للطلاب.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload attached files to Supabase Storage in 'assignments' bucket
      const uploadedAttachments: { name: string; file_path: string; file_size_bytes: number }[] = [];

      for (const a of attachments) {
        const formData = new FormData();
        formData.append("file", a.file);
        formData.append("bucket", "assignments");
        formData.append("folder", selectedCourseId);

        const uploadRes = await uploadFileAction(formData);
        if (!uploadRes.success || !uploadRes.filePath) {
          setIsSubmitting(false);
          setErrorMessage(`فشل رفع ملف التكليف (${a.name}): ${uploadRes.error}`);
          return;
        }

        uploadedAttachments.push({
          name: a.name,
          file_path: uploadRes.filePath,
          file_size_bytes: a.size,
        });
      }

      // 2. Create assignment record in DB with real references
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
        attachments: uploadedAttachments,
      });

      if (!res.success) {
        setErrorMessage(res.error || "تعذر حفظ التكليف في قاعدة البيانات.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage("تم إنشاء التكليف وإرفاق الملفات ونشره بنجاح لجميع طلاب الشعبة في Supabase!");
      setTimeout(() => {
        router.push("/teacher");
      }, 1500);
    } catch (err: any) {
      console.error("Error creating assignment:", err);
      setErrorMessage(err.message || "حدث خطأ غير متوقع أثناء حفظ التكليف.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader user={teacher} onOpenSidebar={() => setIsSidebarOpen(true)} />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={teacher} />

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
              إنشاء واجب / تكليف دراسي جديد
            </h1>
            <p className="text-xs text-brand-teal mt-0.5">
              ربط التكليف بالمقرر والدرس والملفات في قاعدة بيانات Supabase
            </p>
          </div>
          <div className="w-6" />
        </div>

        {successMessage && (
          <div className="p-4 rounded-2xl bg-brand-teal/15 border border-brand-teal/30 text-brand-teal text-sm flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-sm flex items-center gap-3 animate-in fade-in">
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
                  المادة والشعبة المسندة لك <span className="text-status-danger">*</span>
                </label>
                {isLoadingClasses ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-secondary text-xs text-muted">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-teal" />
                    <span>جاري تحميل مقرراتك المسندة...</span>
                  </div>
                ) : availableClasses.length === 0 ? (
                  <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs">
                    لا توجد مواد مسندة لك حالياً. يرجى مراجعة إدارة المدرسة لإسناد مواد وشعب لك.
                  </div>
                ) : (
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm font-semibold focus:outline-none focus:border-brand-teal"
                  >
                    {availableClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.section} ({c.grade})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  الدرس أو المحاضرة المرتبطة (اختياري)
                </label>
                {isLoadingLessons ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-secondary text-xs text-muted">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-teal" />
                    <span>جاري جلب دروس المقرر...</span>
                  </div>
                ) : (
                  <select
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm font-semibold focus:outline-none focus:border-brand-teal"
                  >
                    <option value="">غير مرتبط بدرس محدد (تكليف عام للمقرر)</option>
                    {courseLessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        المحاضرة {l.lesson_number}: {l.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* 2. Assignment Details */}
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
            <h3 className="text-base font-bold text-foreground pb-2 border-b border-border/80">
              بيانات التكليف والتعليمات
            </h3>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                عنوان التكليف أو الواجب <span className="text-status-danger">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: الواجب الأسبوعي الأول في خوارزميات التوجيه"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                تعليمات ومتطلبات الحل بالتفصيل <span className="text-status-danger">*</span>
              </label>
              <textarea
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="اكتب هنا الأسئلة المطلوبة بالتفصيل، والشروط والملاحظات التي يجب على الطالب اتباعها عند رفع الحل..."
                className="w-full p-4 rounded-2xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  نوع التكليف
                </label>
                <select
                  value={assignmentType}
                  onChange={(e) => setAssignmentType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-teal"
                >
                  <option value="assignment">واجب دراسي منزلي</option>
                  <option value="activity">نشاط فصلي / بحثي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  الدرجة القصوى
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  عدد المحاولات المسموح بها
                </label>
                <select
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-teal"
                >
                  <option value={1}>محاولة واحدة فقط</option>
                  <option value={2}>محاولتان</option>
                  <option value={3}>3 محاولات</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  تاريخ فتح التسليم
                </label>
                <input
                  type="date"
                  value={openDate}
                  onChange={(e) => setOpenDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  الموعد النهائي للتسليم (Due Date) <span className="text-status-danger">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-teal font-sans"
                />
              </div>
            </div>
          </div>

          {/* 3. Attachments */}
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
            <h3 className="text-base font-bold text-foreground pb-2 border-b border-border/80">
              ملفات ونماذج التكليف المرفقة (PDF, DOCX, صور)
            </h3>

            {fileError && (
              <div className="p-3.5 rounded-xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            <div className="border-2 border-dashed border-border/80 hover:border-brand-teal/50 rounded-2xl p-6 text-center transition-colors">
              <UploadCloud className="w-10 h-10 text-muted mx-auto mb-2" />
              <p className="text-xs text-foreground font-semibold mb-1">
                اسحب وأفلت ملف ورقة التكليف أو اضغط للاختيار
              </p>
              <p className="text-[11px] text-muted mb-4">
                الملفات المدعومة: PDF, DOCX, PPTX والصور (الحد الأقصى 25 ميجابايت)
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-xs font-bold text-foreground cursor-pointer transition-all">
                <span>اختيار ملف من الجهاز</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                />
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-muted">الملفات المحددة للرفع:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface-secondary border border-border flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-brand-teal shrink-0" />
                        <span className="font-semibold text-foreground truncate max-w-[180px]" dir="ltr">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-muted shrink-0">
                          ({formatBytes(file.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 rounded-lg hover:bg-status-danger/20 text-muted hover:text-status-danger transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submission Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-muted hover:text-foreground text-xs font-bold transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableClasses.length === 0}
              className="px-6 py-2.5 rounded-xl bg-brand-cyan text-background text-xs font-bold flex items-center gap-2 shadow-glow hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري رفع الملفات ونشر التكليف...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>نشر التكليف للطلاب الآن</span>
                </>
              )}
            </button>
          </div>
        </form>

        <DeveloperFooter />
      </main>

      <BottomNavigation user={teacher} />
    </div>
  );
}