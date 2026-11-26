"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  Save,
  Send,
  UploadCloud,
  FileText,
  Video,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { validateFile, formatBytes } from "@/lib/storage";
import { getActiveUser } from "@/lib/user-store";
import { createLessonInDB, getNextLessonNumberFromDB } from "@/lib/services/lessons-service";
import { getTeacherCoursesFromDB } from "@/lib/services/academic-service";
import { uploadFileAction } from "@/lib/services/storage-service";

export default function NewLessonPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const params = useParams();
  const initialCourseId = params?.id as string;

  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId || "");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  // Form States
  const [lessonNumber, setLessonNumber] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [videoUrl, setVideoUrl] = useState("");

  // Attached files
  const [attachedFiles, setAttachedFiles] = useState<
    { file: File; name: string; size: number; ext: string }[]
  >([]);
  const [fileError, setFileError] = useState<string | null>(null);

  // Scheduled Session States
  const [hasSession, setHasSession] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("جلسة شرح وتطبيق عملي");
  const [sessionDate, setSessionDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [locationOrRoom, setLocationOrRoom] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadInitial() {
      const active = getActiveUser("TEACHER");
      setTeacher(active);

      try {
        const dbCourses = await getTeacherCoursesFromDB(active.id || active.username);
        setAssignedCourses(dbCourses || []);

        let targetId = initialCourseId;
        const exists = (dbCourses || []).some((c: any) => c.id === targetId);
        if (!exists && dbCourses && dbCourses.length > 0) {
          targetId = dbCourses[0].id;
        }

        setSelectedCourseId(targetId);
        const match = (dbCourses || []).find((c: any) => c.id === targetId);
        setSelectedCourse(match || null);

        if (targetId) {
          const nextNum = await getNextLessonNumberFromDB(targetId);
          setLessonNumber(nextNum);
        }
      } catch (err) {
        console.error("Error loading courses for lesson:", err);
      }
    }
    loadInitial();
  }, [initialCourseId]);

  const handleCourseChange = async (newId: string) => {
    setSelectedCourseId(newId);
    const match = assignedCourses.find((c) => c.id === newId);
    setSelectedCourse(match || null);
    try {
      const nextNum = await getNextLessonNumberFromDB(newId);
      setLessonNumber(nextNum);
    } catch {}
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const validation = validateFile({ name: file.name, size: file.size });

    if (!validation.isValid) {
      setFileError(validation.error || "الملف غير صالح.");
      return;
    }

    setAttachedFiles((prev) => [
      ...prev,
      {
        file,
        name: file.name,
        size: file.size,
        ext: validation.extension || "pdf",
      },
    ]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (targetStatus: "draft" | "published") => {
    if (!selectedCourseId) {
      setFileError("يرجى اختيار مقرر دراسي أولاً، أو مراجعة الإدارة لإسناد مواد لك.");
      return;
    }
    if (!title.trim()) {
      setFileError("يرجى إدخال عنوان الدرس.");
      return;
    }

    setIsSubmitting(true);
    setStatus(targetStatus);
    setFileError(null);

    // 1. Upload files to Supabase Storage
    const materials: any[] = [];
    for (const f of attachedFiles) {
      try {
        const formData = new FormData();
        formData.append("file", f.file);
        formData.append("bucket", "course-materials");
        formData.append("folder", selectedCourseId);

        const uploadRes = await uploadFileAction(formData);
        if (!uploadRes.success) {
          setIsSubmitting(false);
          setFileError(`فشل رفع الملف (${f.name}): ${uploadRes.error}`);
          return;
        }

        materials.push({
          title: f.name,
          material_type: f.ext === "pdf" ? "pdf" : "document",
          file_path: uploadRes.filePath,
          file_size_bytes: f.size,
        });
      } catch (uploadErr: any) {
        setIsSubmitting(false);
        setFileError(`خطأ أثناء رفع الملف (${f.name}): ${uploadErr.message}`);
        return;
      }
    }

    if (videoUrl && videoUrl.trim()) {
      materials.push({
        title: "رابط فيديو المحاضرة",
        material_type: "video_link",
        external_url: videoUrl.trim(),
      });
    }

    const res = await createLessonInDB({
      class_subject_id: selectedCourseId,
      lesson_number: lessonNumber,
      title: title.trim(),
      description: description.trim() || undefined,
      objectives: objectives.trim() || undefined,
      content_html: contentHtml.trim() || undefined,
      status: targetStatus,
      materials,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setFileError(res.error || "فشل حفظ الدرس في قاعدة البيانات.");
      return;
    }

    setSuccessMessage(
      targetStatus === "published"
        ? "✅ تم نشر الدرس بنجاح للطلاب وحفظه في قاعدة البيانات Supabase!"
        : "✅ تم حفظ مسودة الدرس في Supabase بنجاح!"
    );

    setTimeout(() => {
      router.push(`/teacher/courses/${selectedCourseId}/lessons`);
    }, 1500);
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
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href={selectedCourseId ? `/teacher/courses/${selectedCourseId}/lessons` : "/teacher/courses"}
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">
              إنشاء درس جديد
            </h1>
            <p className="text-xs text-brand-teal mt-0.5">
              {selectedCourse ? `${selectedCourse.name} — ${selectedCourse.grade} (${selectedCourse.section})` : "يرجى اختيار المقرر"}
            </p>
          </div>
          <div className="w-6" />
        </div>

        {fileError && (
          <div className="p-4 rounded-2xl bg-status-danger/15 border border-status-danger/30 text-status-danger text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-brand-teal/15 border border-brand-teal/30 text-brand-teal text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* 1. Basic Lesson Details */}
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
            <h3 className="text-base font-bold text-foreground pb-2 border-b border-border/80">
              البيانات الأساسية للدرس
            </h3>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                مقرر التدريس والشعبة المستهدفة <span className="text-status-danger">*</span>
              </label>
              {assignedCourses.length === 0 ? (
                <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs">
                  لا توجد مقررات دراسية مسندة إليك حالياً. يرجى مراجعة إدارة المدرسة.
                </div>
              ) : (
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
                >
                  {assignedCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.grade} ({c.section}) [رمز: {c.code}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  رقم الدرس / المحاضرة
                </label>
                <input
                  type="number"
                  min={1}
                  value={lessonNumber}
                  onChange={(e) => setLessonNumber(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  عنوان الدرس
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Lecture 5 : Routing Protocols & RIP"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal placeholder-muted/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                وصف موجز للمحاضرة
              </label>
              <textarea
                rows={2}
                placeholder="نبذة مختصرة عن موضوع المحاضرة وأهميتها..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal placeholder-muted/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                الأهداف التعليمية (Learning Objectives)
              </label>
              <textarea
                rows={2}
                placeholder="في نهاية هذا الدرس سيكون الطالب قادراً على..."
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal placeholder-muted/60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                الشرح والمحتوى النصي
              </label>
              <textarea
                rows={5}
                placeholder="اكتب الشرح التعليمي، النقاط الرئيسية، والتعليمات الموجهة للطلاب..."
                value={contentHtml}
                onChange={(e) => setContentHtml(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal placeholder-muted/60"
              />
            </div>
          </div>

          {/* 2. Media & Materials Upload */}
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
            <h3 className="text-base font-bold text-foreground pb-2 border-b border-border/80">
              رفع ملفات ومستندات الدرس
            </h3>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-border/80 rounded-2xl p-6 text-center hover:border-brand-teal/50 transition-colors bg-surface-secondary/40">
              <UploadCloud className="w-10 h-10 text-brand-teal mx-auto mb-2" />
              <p className="text-sm font-bold text-foreground mb-1">
                اضغط لاختيار ملف المحاضرة
              </p>
              <p className="text-xs text-muted mb-4">
                يدعم صيغ PDF، Word (DOCX)، PowerPoint (PPTX)، وصور JPG/PNG حتى 25 ميجابايت.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-teal/20 text-brand-teal border border-brand-teal/30 text-xs font-bold cursor-pointer hover:bg-brand-teal/30 transition-colors">
                <span>استعراض الملفات من جهازك</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.pptx,.ppt,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {fileError && (
              <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Attached Files List */}
            {attachedFiles.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-muted">
                  الملفات المرفقة بالدرس:
                </p>
                {attachedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface-secondary flex items-center justify-between border border-border"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-brand-cyan" />
                      <span className="text-xs font-bold text-foreground truncate max-w-[250px]" dir="ltr">
                        {file.name}
                      </span>
                      <span className="text-[11px] text-muted">
                        ({formatBytes(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-muted hover:text-status-danger p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Video Link */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-brand-teal" />
                رابط فيديو المحاضرة المسجلة (YouTube أو رابط سحابي)
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal placeholder-muted/60"
                dir="ltr"
              />
            </div>
          </div>

          {/* 3. Class Session Scheduling */}
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-cyan" />
                جدولة جلسة / حصة دراسية مرتبطة
              </h3>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSession}
                  onChange={(e) => setHasSession(e.target.checked)}
                  className="rounded text-brand-teal focus:ring-0"
                />
                تضمين حصة دراسية
              </label>
            </div>

            {hasSession && (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    عنوان الجلسة
                  </label>
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      تاريخ الجلسة
                    </label>
                    <input
                      type="date"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      وقت البدء
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      وقت الانتهاء
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      مكان الحصة أو القاعة
                    </label>
                    <input
                      type="text"
                      value={locationOrRoom}
                      onChange={(e) => setLocationOrRoom(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      رابط البث أو الاجتماع (Google Meet / Zoom)
                    </label>
                    <input
                      type="url"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit("draft")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface hover:bg-surface-secondary border border-border text-foreground text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-status-warning" />
              حفظ كمسودة
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit("published")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-teal to-brand-cyan text-background text-sm font-bold shadow-glow hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              <Send className="w-4 h-4 rotate-180" />
              {isSubmitting ? "جاري النشر..." : "نشر الدرس للطلاب الآن"}
            </button>
          </div>
        </form>
      </main>

      <BottomNavigation user={teacher} />
    </div>
  );
}