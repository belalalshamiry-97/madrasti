"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS, MOCK_QUIZZES, MOCK_QUIZ_QUESTIONS } from "@/lib/mock-data";
import { QuizQuestion } from "@/types/database.types";
import { cn } from "@/lib/utils";

export default function StudentQuizTakingPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const student = MOCK_USERS.student1;
  const params = useParams();
  const quizId = params?.id as string;

  const quiz = MOCK_QUIZZES.find((q) => q.id === quizId) || MOCK_QUIZZES[0];
  const questions = MOCK_QUIZ_QUESTIONS;

  // Quiz state: "intro" | "taking" | "submitted"
  const [quizState, setQuizState] = useState<"intro" | "taking" | "submitted">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(quiz.duration_minutes * 60);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Result state
  const [score, setScore] = useState(0);

  // Timer countdown
  useEffect(() => {
    if (quizState !== "taking") return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = () => {
    // Calculate score
    let calculatedScore = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        calculatedScore += q.points;
      }
    });

    setScore(calculatedScore);
    setIsConfirmModalOpen(false);
    setQuizState("submitted");
  };

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isTimeCritical = secondsRemaining < 120; // less than 2 mins

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

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Intro Screen */}
        {quizState === "intro" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-cyan/20 text-brand-cyan">
                {quiz.course_name}
              </span>
              <span className="text-xs text-muted">
                الدرجة الكلية: {quiz.total_score} درجات
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                {quiz.title}
              </h1>
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                {quiz.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-surface-secondary/70 border border-border text-xs">
              <div>
                <span className="text-muted block">مدة الاختبار:</span>
                <span className="font-bold text-foreground text-sm flex items-center gap-1 mt-0.5">
                  <Clock className="w-4 h-4 text-brand-cyan" />
                  {quiz.duration_minutes} دقيقة
                </span>
              </div>
              <div>
                <span className="text-muted block">عدد الأسئلة:</span>
                <span className="font-bold text-foreground text-sm flex items-center gap-1 mt-0.5">
                  <HelpCircle className="w-4 h-4 text-brand-teal" />
                  {questions.length} أسئلة
                </span>
              </div>
              <div>
                <span className="text-muted block">درجة النجاح:</span>
                <span className="font-bold text-foreground text-sm flex items-center gap-1 mt-0.5">
                  <Trophy className="w-4 h-4 text-status-warning" />
                  {quiz.passing_score} / {quiz.total_score}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-status-warning/10 border border-status-warning/30 flex items-start gap-3 text-xs text-status-warning">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">تعليمات هامة قبل البدء:</h4>
                <ul className="list-disc list-inside space-y-1 mt-1 text-foreground/80">
                  <li>يبدأ المؤقت التنازلي فور الضغط على زر "بدء الاختبار الآن".</li>
                  <li>سيتم تسليم إجاباتك تلقائياً عند انتهاء الوقت المحدد حتى لو لم تكمل كافة الأسئلة.</li>
                  <li>تأكد من ثبات اتصال الإنترنت قبل البدء.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link
                href="/student/quizzes"
                className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground text-xs font-semibold"
              >
                رجوع للقائمة
              </Link>
              <button
                onClick={() => setQuizState("taking")}
                className="px-6 py-3 rounded-2xl bg-brand-cyan text-background font-black text-sm hover:brightness-110 shadow-glow transition-all"
              >
                بدء الاختبار الآن
              </button>
            </div>
          </div>
        )}

        {/* Taking Quiz Screen */}
        {quizState === "taking" && (
          <div className="space-y-4">
            {/* Live Timer and Progress Header */}
            <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">السؤال:</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-surface-secondary text-brand-cyan font-bold text-xs">
                  {currentIndex + 1} من {questions.length}
                </span>
                <span className="text-xs text-muted hidden sm:inline">
                  (تمت الإجابة على {answeredCount} من {questions.length})
                </span>
              </div>

              {/* Countdown Timer */}
              <div
                className={cn(
                  "px-3.5 py-1.5 rounded-xl border flex items-center gap-2 font-mono font-bold text-sm tracking-wider",
                  isTimeCritical
                    ? "bg-status-danger/20 border-status-danger text-status-danger animate-pulse"
                    : "bg-surface-secondary border-border text-foreground"
                )}
                dir="ltr"
              >
                <Clock className="w-4 h-4" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-card space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-cyan/15 text-brand-cyan">
                  {currentQ.question_type === "mcq" ? "اختيار من متعدد" : "صح أو خطأ"}
                </span>
                <span className="text-xs text-muted font-bold">
                  {currentQ.points} درجات
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-black text-foreground leading-relaxed">
                {currentQ.question_text}
              </h2>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 select-none",
                        isSelected
                          ? "bg-brand-cyan/15 border-brand-cyan text-foreground ring-1 ring-brand-cyan/40 shadow-glow"
                          : "bg-surface-secondary/70 border-border/80 text-foreground/80 hover:bg-surface-secondary hover:border-brand-cyan/30"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                          isSelected
                            ? "border-brand-cyan bg-brand-cyan"
                            : "border-muted"
                        )}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-background" />
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold">
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Navigation controls */}
              <div className="pt-6 border-t border-border flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        Math.min(questions.length - 1, prev + 1)
                      )
                    }
                    className="px-5 py-2.5 rounded-xl bg-brand-cyan text-background text-xs font-bold hover:brightness-110 flex items-center gap-1.5 transition-all"
                  >
                    التالي
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmModalOpen(true)}
                    className="px-6 py-2.5 rounded-xl bg-brand-teal text-background text-xs font-black hover:brightness-110 shadow-glow flex items-center gap-1.5 transition-all"
                  >
                    تسليم الإجابات النهائية
                  </button>
                )}
              </div>
            </div>

            {/* Quick Question Navigator Dots */}
            <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-center gap-2 overflow-x-auto">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "w-9 h-9 rounded-xl font-bold text-xs transition-all",
                      isCurrent
                        ? "bg-brand-cyan text-background ring-2 ring-brand-cyan/40 scale-105"
                        : isAnswered
                        ? "bg-brand-teal/20 text-brand-teal border border-brand-teal/40"
                        : "bg-surface-secondary text-muted border border-border"
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Submitted & Results Screen */}
        {quizState === "submitted" && (
          <div className="space-y-6">
            {/* Score Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr from-brand-blue to-brand-cyan text-background text-center shadow-glow space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-background/20 backdrop-blur mx-auto flex items-center justify-center font-bold text-background">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {score >= quiz.passing_score
                  ? "مبروك! لقد اجتزت الاختبار بنجاح"
                  : "تم تسليم الاختبار — حاول مرة أخرى للتعويض"}
              </h2>
              <div className="inline-block px-5 py-2 rounded-2xl bg-background/20 backdrop-blur text-2xl sm:text-3xl font-black">
                {score} / {quiz.total_score}
              </div>
              <p className="text-xs text-background/80">
                نسبة الإنجاز: {Math.round((score / quiz.total_score) * 100)}%
              </p>
            </div>

            {/* Detailed Question Review */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-foreground">
                مراجعة الإجابات النموذجية والتوضيحات:
              </h3>

              {questions.map((q, idx) => {
                const studentAns = answers[q.id];
                const isCorrect = studentAns === q.correct_answer;
                const correctOpt = q.options.find((o) => o.id === q.correct_answer);
                const selectedOpt = q.options.find((o) => o.id === studentAns);

                return (
                  <div
                    key={q.id}
                    className={cn(
                      "p-5 rounded-2xl border shadow-card space-y-3",
                      isCorrect
                        ? "bg-surface border-brand-teal/40"
                        : "bg-surface border-status-danger/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-brand-teal" />
                        ) : (
                          <XCircle className="w-5 h-5 text-status-danger" />
                        )}
                        <span className="text-xs font-bold text-foreground">
                          السؤال {idx + 1}
                        </span>
                      </div>
                      <span className="text-xs font-bold">
                        {isCorrect ? `+${q.points}` : "0"} / {q.points}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-foreground">
                      {q.question_text}
                    </h4>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted">إجابتك:</span>
                        <span
                          className={cn(
                            "font-bold",
                            isCorrect ? "text-brand-teal" : "text-status-danger"
                          )}
                        >
                          {selectedOpt ? selectedOpt.text : "لم تتم الإجابة"}
                        </span>
                      </div>

                      {!isCorrect && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted">الإجابة الصحيحة:</span>
                          <span className="font-bold text-brand-teal">
                            {correctOpt?.text}
                          </span>
                        </div>
                      )}

                      {q.explanation && (
                        <p className="mt-2 p-3 rounded-xl bg-surface-secondary/70 border border-border text-[11px] text-foreground/80 leading-relaxed">
                          <span className="font-bold text-brand-cyan block mb-0.5">
                            الشرح والتوضيح:
                          </span>
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-center gap-4">
              <Link
                href="/student/quizzes"
                className="px-6 py-2.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-foreground text-xs font-bold transition-colors"
              >
                العودة للاختبارات
              </Link>
              <Link
                href="/student/grades"
                className="px-6 py-2.5 rounded-xl bg-brand-cyan text-background text-xs font-bold hover:brightness-110 shadow-glow transition-all"
              >
                عرض سجل الدرجات
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-status-warning/20 text-status-warning flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-foreground">
              تأكيد تسليم الاختبار
            </h3>

            <p className="text-xs text-muted leading-relaxed">
              لقد قمت بالإجابة على {answeredCount} من أصل {questions.length} أسئلة.
              هل أنت متأكد من تسليم الإجابات الآن؟ لن تتمكن من تعديل الإجابات بعد التسليم.
            </p>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground text-xs font-semibold"
              >
                متابعة الحل
              </button>
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className="px-5 py-2 rounded-xl bg-brand-teal text-background text-xs font-bold hover:brightness-110 shadow-glow"
              >
                تأكيد التسليم
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation user={student} />
    </div>
  );
}
