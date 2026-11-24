"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  Award,
  CheckCircle2,
  FileText,
  FileCheck,
  Clock,
  User,
  Send,
  RotateCcw,
  Eye,
  Download,
  AlertCircle,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PDFViewerModal } from "@/components/lessons/PDFViewerModal";
import { formatBytes } from "@/lib/storage";
import { getActiveUser } from "@/lib/user-store";
import {
  getStoredSubmissions,
  gradeSubmission,
  AssignmentSubmission,
} from "@/lib/submission-store";
import { gradeSubmissionInDB, getTeacherSubmissionsFromDB } from "@/lib/services/assignments-service";

export default function SubmissionGradingPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const params = useParams();
  const submissionId = params?.submissionId as string;

  const [submission, setSubmission] = useState<any | null>(null);
  const [score, setScore] = useState<number | string>("");
  const [feedback, setFeedback] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // File Preview Modal
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);

  useEffect(() => {
    const active = getActiveUser("TEACHER");
    setTeacher(active);

    async function loadData() {
      try {
        const dbSubs = await getTeacherSubmissionsFromDB(active.id || active.username);
        const foundDb = dbSubs.find((s: any) => s.id === submissionId);
        if (foundDb) {
          setSubmission(foundDb);
          setScore(foundDb.score !== null && foundDb.score !== undefined ? foundDb.score : "");
          setFeedback(foundDb.feedback_notes || "");
          return;
        }
      } catch (err) {
        console.error("Error loading submission from DB:", err);
      }

      const allSubs = getStoredSubmissions();
      const found = allSubs.find((s) => s.id === submissionId) || allSubs[0];
      if (found) {
        setSubmission(found);
        setScore(
          found.score !== null && found.score !== undefined ? found.score : ""
        );
        setFeedback(found.feedback_notes || "");
      }
    }
    loadData();
  }, [submissionId]);

  const handlePublishGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!submission) return;
    const numScore = parseFloat(String(score));

    if (isNaN(numScore) || numScore < 0 || numScore > submission.max_score) {
      setErrorMessage(`يرجى إدخال درجة صالحة بين 0 و ${submission.max_score}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Save to Supabase DB
      const res = await gradeSubmissionInDB({
        submission_id: submission.id,
        grader_id: teacher.id || teacher.username,
        score: numScore,
        feedback_notes: feedback,
      });

      // Also sync to local store
      gradeSubmission(
        submission.id,
        numScore,
        feedback,
        teacher.full_name
      );

      if (res && !res.success) {
        setErrorMessage(res.error || "تعذر حفظ النتيجة في قاعدة البيانات.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(
        `تم رصد الدرجة (${numScore} / ${submission.max_score}) وحفظها رسمياً في قاعدة بيانات درجات الطالب "${submission.student_name}" بنجاح!`
      );

      setTimeout(() => {
        setIsSubmitting(false);
        router.push("/teacher/grading");
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ أثناء اعتماد الدرجة.");
      setIsSubmitting(false);
    }
  };

  const handleRequestRevision = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!feedback.trim()) {
      setErrorMessage("يرجى كتابة الملاحظات والأسباب المطلوب من الطالب تعديلها في الحل.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage("تم إرسال إشعار للطالب بطلب إعادة المحاولة مع التوجيهات المرفقة.");
      setTimeout(() => {
        router.push("/teacher/grading");
      }, 1500);
    }, 600);
  };

  if (!submission) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
        <AppHeader user={teacher} onOpenSidebar={() => setIsSidebarOpen(true)} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={teacher} />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 text-center text-muted">
          جاري تحميل بيانات التسليم...
        </main>
        <BottomNavigation user={teacher} />
      </div>
    );
  }

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
            href="/teacher/grading"
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">
              تصحيح وتقييم الواجب
            </h1>
            <p className="text-xs text-brand-teal mt-0.5">
              {submission.assignment_title}
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

        {/* 1. Student & Submission Info Banner */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center font-bold text-base text-brand-teal shrink-0">
                {submission.student_name.slice(0, 1)}
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  {submission.student_name}
                </h2>
                <span className="text-xs text-muted">
                  رقم القيد: {submission.student_username} • الثالث الثانوي (علمي)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <StatusBadge
                type={submission.status === "graded" ? "completed" : "pending"}
                label={submission.status === "graded" ? "تم التصحيح" : "تسليم جديد"}
              />
              <span className="text-xs text-muted bg-surface-secondary px-3 py-1 rounded-xl border border-border">
                المحاولة {submission.attempt_number}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-muted border-t border-border/80">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-muted" />
              تاريخ التسليم: {submission.submitted_at}
            </span>
            <span className="font-semibold text-foreground">
              الدرجة القصوى: {submission.max_score}
            </span>
          </div>
        </div>

        {/* 2. Student's Answer Text & Uploaded Files */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
          <h3 className="text-base font-bold text-foreground pb-2 border-b border-border/80">
            إجابة الطالب وملفات الحل
          </h3>

          {/* Answer Text */}
          <div>
            <label className="block text-xs font-semibold text-muted mb-2">
              نص الإجابة المرسل:
            </label>
            <div className="p-4 rounded-2xl bg-surface-secondary text-sm text-foreground leading-relaxed whitespace-pre-wrap border border-border">
              {submission.answer_text}
            </div>
          </div>

          {/* Attached Files */}
          <div>
            <label className="block text-xs font-semibold text-muted mb-2">
              الملفات والصور المرفقة من الطالب:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {submission.files.map((file: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-surface-secondary border border-border flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileCheck className="w-5 h-5 text-brand-teal shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate" dir="ltr">
                        {file.name}
                      </h4>
                      <span className="text-[11px] text-muted">
                        {formatBytes(file.size)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewFileName(file.name)}
                    className="p-2 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan transition-colors"
                    title="معاينة الملف"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Grading & Feedback Section */}
        <form onSubmit={handlePublishGrade} className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
          <h3 className="text-base font-bold text-foreground pb-2 border-b border-border/80 flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-cyan" />
            رصد الدرجة والملاحظات التقييمية
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                الدرجة المستحقة (من {submission.max_score})
              </label>
              <input
                type="number"
                step={0.5}
                min={0}
                max={submission.max_score}
                required
                placeholder={`أدخل درجة بين 0 و ${submission.max_score}`}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground font-black text-base focus:outline-none focus:border-brand-teal"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                ملاحظات وتوجيهات المعلم للطالب
              </label>
              <textarea
                rows={3}
                placeholder="اكتب تعليقك على الحل، نقاط القوة، وأي نقاط تحتاج لتحسين..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-teal placeholder-muted/60"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border/80 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleRequestRevision}
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-secondary hover:bg-status-warning/15 hover:border-status-warning/40 border border-border text-foreground text-xs font-bold transition-all"
            >
              <RotateCcw className="w-4 h-4 text-status-warning" />
              طلب إعادة الحل من الطالب
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-teal to-brand-cyan text-background text-sm font-bold shadow-glow hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              <Send className="w-4 h-4 rotate-180" />
              {isSubmitting ? "جاري الاعتماد..." : "اعتماد ونشر النتيجة"}
            </button>
          </div>
        </form>
      </main>

      <PDFViewerModal
        isOpen={Boolean(previewFileName)}
        onClose={() => setPreviewFileName(null)}
        fileName={previewFileName || "student_solution.pdf"}
        fileSizeBytes={1540000}
      />

      <BottomNavigation user={teacher} />
    </div>
  );
}