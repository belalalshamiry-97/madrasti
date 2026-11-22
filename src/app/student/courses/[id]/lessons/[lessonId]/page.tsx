"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  Download,
  Link as LinkIcon,
  Video,
  Clock,
  Calendar,
  MapPin,
  FileText,
  FileCheck,
  MessageCircle,
  HelpCircle,
  Plus,
  Eye,
  Send,
  X,
  CheckCircle2,
  User,
  ShieldCheck,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PDFViewerModal } from "@/components/lessons/PDFViewerModal";
import {
  MOCK_USERS,
  MOCK_COURSES,
  MOCK_LESSONS,
  MOCK_SESSIONS,
  MOCK_ASSIGNMENTS,
  MOCK_LESSON_QUESTIONS,
  MockLessonQuestion,
} from "@/lib/mock-data";

export default function LessonDetailsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const student = MOCK_USERS.student1;
  const params = useParams();
  const courseId = params?.id as string;
  const lessonId = params?.lessonId as string;

  const course =
    MOCK_COURSES.find((c) => c.id === courseId) || MOCK_COURSES[0];
  const lesson =
    MOCK_LESSONS.find((l) => l.id === lessonId) || MOCK_LESSONS[2];

  // Interactive Q&A state
  const [questions, setQuestions] = useState<MockLessonQuestion[]>(MOCK_LESSON_QUESTIONS);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [askSuccess, setAskSuccess] = useState(false);

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const newQ: MockLessonQuestion = {
      id: `q-${Date.now()}`,
      lesson_id: lesson.id,
      student_name: student.full_name,
      question_text: questionText.trim(),
      created_at: "الآن",
      answers: [],
    };

    setQuestions((prev) => [newQ, ...prev]);
    setQuestionText("");
    setAskSuccess(true);

    setTimeout(() => {
      setAskSuccess(false);
      setIsAskModalOpen(false);
    }, 1200);
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
        {/* Top Header with Back button */}
        <div className="flex items-center justify-between">
          <Link
            href={`/student/courses/${course.id}`}
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">تفاصيل المحاضرة</h1>
          <div className="w-6" />
        </div>

        {/* Lesson Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-tr from-brand-blue to-brand-cyan p-5 sm:p-6 text-background shadow-glow space-y-2">
          <span className="text-xs font-semibold block text-background/80">
            {course.subject?.name}
          </span>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-background/20 text-background backdrop-blur">
            المحاضرة {lesson.lesson_number}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-background pt-1">
            {lesson.title}
          </h2>
          {lesson.description && (
            <p className="text-xs sm:text-sm text-background/90 pt-1 leading-relaxed">
              {lesson.description}
            </p>
          )}
        </div>

        {/* 1. الوسائط (Media Files & Video Links) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-cyan" />
              الوسائط والمستندات
            </h3>
            <span className="text-xs text-muted font-bold px-2 py-0.5 rounded-md bg-surface border border-border">
              2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* PDF File Card */}
            <div
              onClick={() => setIsPdfModalOpen(true)}
              className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between gap-3 shadow-card hover:border-brand-cyan/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-secondary text-brand-cyan flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-cyan/20 text-brand-cyan">
                      ملف
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground truncate max-w-[200px]" dir="ltr">
                    Network_Administration_Lecture_2_DHCP_.pdf
                  </h4>
                  <span className="text-[11px] text-muted block mt-0.5">
                    ملف • 1.0 MB
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPdfModalOpen(true);
                }}
                className="p-2 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan transition-colors"
                title="معاينة الملف"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Video / URL Link Card */}
            <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between gap-3 shadow-card hover:border-brand-teal/40 transition-all">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-secondary text-brand-teal flex items-center justify-center shrink-0">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-teal/20 text-brand-teal">
                      رابط
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground truncate max-w-[200px]">
                    ملف تسجيل المحاضرة
                  </h4>
                  <span className="text-[11px] text-muted block mt-0.5">
                    رابط فيديو مسجل
                  </span>
                </div>
              </div>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-brand-teal/15 hover:bg-brand-teal/25 text-brand-teal transition-colors"
                title="فتح الرابط"
              >
                <Video className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* 2. الجلسات الدراسية (Class Sessions) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-cyan" />
              الجلسات الدراسية
            </h3>
            <span className="text-xs text-muted font-bold px-2 py-0.5 rounded-md bg-surface border border-border">
              1
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-border shadow-card space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-foreground">
                  جلسة تعويضية
                </h4>
                <div className="mt-1">
                  <StatusBadge type="scheduled" label="مجدولة" />
                </div>
              </div>

              {/* Date Box on Top Right */}
              <div className="text-center bg-surface-secondary px-3.5 py-2 rounded-xl border border-border">
                <span className="block text-lg font-black text-foreground leading-none">
                  07
                </span>
                <span className="text-[11px] text-muted block mt-0.5">Nov</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted" />
                <span>2026/11/07</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted" />
                <span>10:00 AM – 12:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted" />
                <span>القاعة: 403</span>
              </div>
            </div>

            <a
              href="https://meet.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan font-bold text-xs transition-colors"
            >
              <Video className="w-4 h-4" />
              الانضمام للاجتماع
            </a>
          </div>
        </section>

        {/* 3. التكاليف (Assignments) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-status-warning" />
              التكاليف
            </h3>
            <span className="text-xs text-muted font-bold px-2 py-0.5 rounded-md bg-surface border border-border">
              1
            </span>
          </div>

          <Link
            href="/student/assignments"
            className="block p-5 rounded-2xl bg-surface hover:bg-surface-secondary border border-border hover:border-brand-cyan/40 shadow-card transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-foreground">
                  تكليف 2
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <StatusBadge type="assignment" label="تكليف" />
                  <StatusBadge type="late" label="متأخر" />
                </div>
              </div>

              {/* Due Date Box */}
              <div className="text-center bg-surface-secondary px-3.5 py-2 rounded-xl border border-border">
                <span className="block text-lg font-black text-foreground leading-none">
                  21
                </span>
                <span className="text-[11px] text-muted block mt-0.5">Nov</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-status-warning" />
                2026/11/21 11:55 AM
              </span>
              <span className="font-semibold text-foreground">
                الدرجة القصوى: 10
              </span>
            </div>
          </Link>
        </section>

        {/* 4. الأسئلة والمناقشات (Q&A Interactive Section) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-brand-cyan" />
              الأسئلة والمناقشات حول الدرس
            </h3>
            <button
              onClick={() => setIsAskModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-cyan text-background text-xs font-bold shadow-glow hover:brightness-110 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              طرح سؤال للمعلم
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-surface border border-border text-center space-y-3">
              <HelpCircle className="w-8 h-8 text-muted mx-auto" />
              <p className="text-sm font-semibold text-muted">
                لم يتم طرح أسئلة حول هذه المحاضرة بعد
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-surface border border-border shadow-card space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-surface-secondary text-brand-cyan flex items-center justify-center font-bold text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        {q.student_name}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted">{q.created_at}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-surface-secondary/40 p-3 rounded-xl border border-border/40">
                    {q.question_text}
                  </p>

                  {/* Answers */}
                  {q.answers.length > 0 ? (
                    <div className="pt-2 pl-2 space-y-2">
                      {q.answers.map((ans) => (
                        <div
                          key={ans.id}
                          className="p-3.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-brand-cyan" />
                              <span className="text-xs font-bold text-foreground">
                                {ans.responder_name}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-cyan/20 text-brand-cyan">
                                {ans.responder_role}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted">
                              {ans.created_at}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/90 leading-relaxed">
                            {ans.answer_text}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="pt-1 flex items-center gap-1 text-[11px] text-status-warning">
                      <Clock className="w-3.5 h-3.5" />
                      <span>بانتظار مراجعة ورد المعلم...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Ask Question Modal */}
      {isAskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-brand-cyan" />
                طرح سؤال حول المحاضرة
              </h3>
              <button
                onClick={() => setIsAskModalOpen(false)}
                className="p-1 rounded-xl text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {askSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-brand-teal mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-foreground">تم إرسال سؤالك للمعلم بنجاح!</h4>
                <p className="text-xs text-muted">ستصلك إشعار فوري عند قيام المعلم بالرد.</p>
              </div>
            ) : (
              <form onSubmit={handleAskQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    اكتب سؤالك واستفسارك للمعلم
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="اكتب ما استشكل عليك في هذه المحاضرة..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAskModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground text-xs font-semibold transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-brand-cyan text-background text-xs font-bold hover:brightness-110 shadow-glow transition-all"
                  >
                    إرسال السؤال
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <PDFViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        fileName="Network_Administration_Lecture_2_DHCP_.pdf"
        fileSizeBytes={1048576}
      />

      <BottomNavigation user={student} />
    </div>
  );
}
