"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  Clock,
  Calendar,
  Award,
  UploadCloud,
  Camera,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  Trash2,
  Download,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { StatusBadge } from "@/components/common/StatusBadge";
import { GradeBadge } from "@/components/common/GradeBadge";
import { MOCK_USERS, MOCK_ASSIGNMENTS } from "@/lib/mock-data";
import { validateFile, formatBytes } from "@/lib/storage";
import { getActiveUser } from "@/lib/user-store";
import {
  getStoredSubmissions,
  saveStoredSubmission,
  AssignmentSubmission,
} from "@/lib/submission-store";

export default function StudentAssignmentDetailsPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [student, setStudent] = useState(MOCK_USERS.student1);
  const params = useParams();
  const assignmentId = params?.id as string;

  const assignment =
    MOCK_ASSIGNMENTS.find((a) => a.id === assignmentId) || MOCK_ASSIGNMENTS[0];

  const [existingSubmission, setExistingSubmission] = useState<AssignmentSubmission | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [solutionFiles, setSolutionFiles] = useState<{ name: string; size: number }[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const [submissionStatus, setSubmissionStatus] = useState<
    "not_started" | "draft" | "submitted" | "graded"
  >("not_started");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const active = getActiveUser("STUDENT");
    setStudent(active);

    const allSubs = getStoredSubmissions();
    const found = allSubs.find(
      (s) =>
        (s.assignment_id === assignment.id || s.assignment_title === assignment.title) &&
        (s.student_id === active.id || s.student_username.toLowerCase() === active.username.toLowerCase())
    );

    if (found) {
      setExistingSubmission(found);
      setAnswerText(found.answer_text || "");
      setSolutionFiles(found.files || []);
      setSubmissionStatus(found.status === "graded" ? "graded" : "submitted");
    }
  }, [assignment.id, assignment.title]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const validation = validateFile({ name: file.name, size: file.size });

    if (!validation.isValid) {
      setFileError(validation.error || "الملف غير صالح.");
      return;
    }

    setSolutionFiles((prev) => [
      ...prev,
      { name: file.name, size: file.size },
    ]);
  };

  const removeFile = (idx: number) => {
    setSolutionFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveDraft = () => {
    setSubmissionStatus("draft");
    alert("تم حفظ مسودة إجابتك بنجاح على الخادم. يمكنك العودة وإكمالها لاحقاً.");
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() && solutionFiles.length === 0) {
      alert("يرجى كتابة نص الإجابة أو إرفاق ملف/صورة حل الواجب.");
      return;
    }

    setIsSubmitting(true);
    const nowFormatted = new Date().toLocaleString("ar-YE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newSub: AssignmentSubmission = {
      id: existingSubmission?.id || `sub-${Date.now()}`,
      assignment_id: assignment.id,
      assignment_title: assignment.title,
      course_name: assignment.course_name,
      grade: student.grade || "الثالث الثانوي",
      student_id: student.id,
      student_name: student.full_name,
      student_username: student.username,
      attempt_number: (existingSubmission?.attempt_number || 0) + 1,
      answer_text: answerText.trim(),
      status: "submitted",
      submitted_at: nowFormatted,
      files: solutionFiles.map((f) => ({ name: f.name, size: f.size, url: "#" })),
      max_score: 10,
      score: null,
      feedback_notes: null,
    };

    saveStoredSubmission(newSub);
    setExistingSubmission(newSub);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionStatus("submitted");
      setSuccessMessage(
        `تم تأكيد إرسال حل الواجب بنجاح إلى المعلم المصحح! وقت الرفع: ${nowFormatted}`
      );
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader
        user={student}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={student}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header with Back button */}
        <div className="flex items-center justify-between">
          <Link
            href="/student/assignments"
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">
              تفاصيل التكليف وتسليم الحل
            </h1>
            <p className="text-xs text-brand-cyan mt-0.5">
              {assignment.course_name}
            </p>
          </div>
          <div className="w-6" />
        </div>

        {/* Hero Card */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-brand-cyan font-bold">
                  {assignment.course_name}
                </span>
                <span className="text-muted text-xs">•</span>
                <span className="text-xs text-muted">م. بلال الشميري</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-foreground">
                {assignment.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge
                type={
                  submissionStatus === "graded"
                    ? "completed"
                    : submissionStatus === "submitted"
                    ? "pending"
                    : assignment.status || "late"
                }
                label={
                  submissionStatus === "graded"
                    ? "تم التصحيح"
                    : submissionStatus === "submitted"
                    ? "تم التسليم"
                    : submissionStatus === "draft"
                    ? "مسودة"
                    : "متأخر"
                }
              />
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted leading-relaxed border-t border-border/80 pt-3">
            {assignment.instructions}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted border-t border-border/50">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-status-warning font-semibold">
                <Clock className="w-4 h-4" />
                الموعد النهائي: {assignment.due_date}
              </span>
            </div>
            <GradeBadge maxScore={assignment.max_score} />
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-brand-teal/15 border border-brand-teal/30 text-brand-teal text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Teacher Graded Result & Feedback Box (If Graded) */}
        {existingSubmission?.status === "graded" && (
          <div className="p-6 rounded-3xl bg-brand-teal/10 border border-brand-teal/30 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-brand-teal flex items-center gap-2">
                <Award className="w-5 h-5" />
                نتيجة التصحيح والتقييم
              </h3>
              <span className="text-lg font-black text-brand-teal">
                {existingSubmission.score} / {assignment.max_score}
              </span>
            </div>

            <p className="text-xs text-foreground bg-surface p-3.5 rounded-xl border border-border leading-relaxed">
              <strong>ملاحظات المعلم:</strong> {existingSubmission.feedback_notes}
            </p>

            <div className="flex items-center justify-between text-[11px] text-muted pt-1">
              <span>المصحح: {existingSubmission.grader_name}</span>
              <span>تاريخ التصحيح: {existingSubmission.graded_at}</span>
            </div>
          </div>
        )}

        {/* Student Submission Form */}
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
            <h3 className="text-base font-bold text-foreground pb-2 border-b border-border/80 flex items-center justify-between">
              <span>إجابتك وحل التكليف</span>
              {submissionStatus === "submitted" && (
                <span className="text-xs text-brand-teal font-normal flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  تم استلام الحل بنجاح
                </span>
              )}
            </h3>

            {/* Answer Text Area */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                كتابة نص الإجابة والشرح
              </label>
              <textarea
                rows={5}
                placeholder="اكتب إجابتك هنا، أو لخص خطوات الحل التي قمت بها..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                disabled={submissionStatus === "graded"}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-sm focus:outline-none focus:border-brand-cyan placeholder-muted/60 disabled:opacity-75"
              />
            </div>

            {/* File Upload & Camera Capture Zone */}
            {submissionStatus !== "graded" && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  إرفاق ملفات الحل أو تصوير الدفتر عبر الكاميرا
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Button */}
                  <label className="p-4 rounded-2xl bg-surface-secondary/70 border border-dashed border-border hover:border-brand-cyan/50 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                    <UploadCloud className="w-7 h-7 text-brand-cyan mb-1.5" />
                    <span className="text-xs font-bold text-foreground">
                      رفع ملف PDF أو مستند
                    </span>
                    <span className="text-[10px] text-muted mt-0.5">
                      حتى 25 ميجابايت
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  </label>

                  {/* Phone Camera Capture Button */}
                  <label className="p-4 rounded-2xl bg-surface-secondary/70 border border-dashed border-border hover:border-brand-teal/50 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                    <Camera className="w-7 h-7 text-brand-teal mb-1.5" />
                    <span className="text-xs font-bold text-foreground">
                      تصوير الحل بكاميرا الهاتف
                    </span>
                    <span className="text-[10px] text-muted mt-0.5">
                      التقاط صورة مباشرة للدفتر
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {fileError && (
                  <p className="text-xs text-status-danger mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {fileError}
                  </p>
                )}
              </div>
            )}

            {/* Attached Solution Files List */}
            {solutionFiles.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-muted">
                  الملفات المرفقة مع الحل:
                </p>
                {solutionFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface-secondary flex items-center justify-between border border-border"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCheck className="w-4 h-4 text-brand-teal shrink-0" />
                      <span className="text-xs font-bold text-foreground truncate max-w-[250px]" dir="ltr">
                        {file.name}
                      </span>
                      <span className="text-[11px] text-muted shrink-0">
                        ({formatBytes(file.size)})
                      </span>
                    </div>

                    {submissionStatus !== "graded" && (
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-muted hover:text-status-danger p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {submissionStatus !== "graded" && (
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface hover:bg-surface-secondary border border-border text-foreground text-sm font-semibold transition-colors"
              >
                <Save className="w-4 h-4 text-status-warning" />
                حفظ كمسودة
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-background text-sm font-bold shadow-glow hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                <Send className="w-4 h-4 rotate-180" />
                {isSubmitting ? "جاري الإرسال..." : "إرسال الحل النهائي"}
              </button>
            </div>
          )}
        </form>
      </main>

      <BottomNavigation user={student} />
    </div>
  );
}