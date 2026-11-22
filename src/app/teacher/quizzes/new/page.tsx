"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  BookOpen,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS, MOCK_COURSES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface QuestionDraft {
  id: string;
  question_text: string;
  question_type: "mcq" | "true_false";
  points: number;
  options: string[];
  correct_index: number;
}

export default function TeacherQuizBuilderPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const teacher = MOCK_USERS.teacher1;

  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState(MOCK_COURSES[0].id);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [passingScore, setPassingScore] = useState(5);
  const [description, setDescription] = useState("");

  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: "q-draft-1",
      question_text: "ما هو البروتوكول المسؤول عن تحويل أسماء النطاقات إلى عناوين IP؟",
      question_type: "mcq",
      points: 2.5,
      options: ["بروتوكول DNS", "بروتوكول DHCP", "بروتوكول FTP", "بروتوكول HTTP"],
      correct_index: 0,
    },
    {
      id: "q-draft-2",
      question_text: "تستخدم الشبكات المحلية (LAN) عناوين MAC للتعرف على كروت الشبكة في الطبقة الثانية.",
      question_type: "true_false",
      points: 2.5,
      options: ["صحيح", "خطأ"],
      correct_index: 0,
    },
  ]);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const totalScore = questions.reduce((sum, q) => sum + Number(q.points || 0), 0);

  const handleAddQuestion = (type: "mcq" | "true_false") => {
    const newQ: QuestionDraft = {
      id: `q-draft-${Date.now()}`,
      question_text: "",
      question_type: type,
      points: 2.5,
      options: type === "mcq" ? ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"] : ["صحيح", "خطأ"],
      correct_index: 0,
    };
    setQuestions((prev) => [...prev, newQ]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleQuestionTextChange = (id: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, question_text: text } : q))
    );
  };

  const handleOptionTextChange = (qId: string, optIdx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const newOpts = [...q.options];
        newOpts[optIdx] = text;
        return { ...q, options: newOpts };
      })
    );
  };

  const handleCorrectIndexChange = (qId: string, optIdx: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, correct_index: optIdx } : q))
    );
  };

  const handlePublishQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || questions.some((q) => !q.question_text.trim())) {
      alert("يرجى إكمال عنوان الاختبار وكتابة نصوص كافة الأسئلة.");
      return;
    }

    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishSuccess(true);
      setTimeout(() => {
        router.push("/teacher");
      }, 1500);
    }, 500);
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
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher"
              className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">إنشاء اختبار إلكتروني جديد</h1>
              <p className="text-xs text-muted">
                إعداد الأسئلة وتحديد التوقيت والدرجات ونشرها للطلاب
              </p>
            </div>
          </div>
        </div>

        {publishSuccess ? (
          <div className="p-12 text-center rounded-3xl bg-surface border border-border shadow-card space-y-3">
            <CheckCircle2 className="w-16 h-16 text-brand-teal mx-auto animate-bounce" />
            <h2 className="text-xl font-black text-foreground">تم نشر الاختبار للطلاب بنجاح!</h2>
            <p className="text-xs text-muted">
              تم إرسال إشعار فوري لجميع طلاب الشعبة، وسيبدأ الاختبار في الموعد المحدد.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePublishQuiz} className="space-y-6">
            {/* General Settings Card */}
            <div className="p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
              <h3 className="text-base font-bold text-foreground">إعدادات الاختبار العامة:</h3>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  عنوان الاختبار
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: اختبار دوري 2 — معمارية أمن المعلومات"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    المقرر والشعبة
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan"
                  >
                    {MOCK_COURSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.subject?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    مدة الاختبار (بالدقائق)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    درجة النجاح
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  تعليمات الاختبار للطلاب
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ملاحظات وتوجيهات للطلاب..."
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan resize-none"
                />
              </div>
            </div>

            {/* Questions Builder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    أسئلة الاختبار ({questions.length})
                  </h3>
                  <span className="text-xs text-brand-cyan font-bold">
                    إجمالي الدرجات: {totalScore} درجة
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddQuestion("mcq")}
                    className="px-3 py-1.5 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan text-xs font-bold transition-colors"
                  >
                    + إضافة اختيار متعدد
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion("true_false")}
                    className="px-3 py-1.5 rounded-xl bg-brand-teal/15 hover:bg-brand-teal/25 text-brand-teal text-xs font-bold transition-colors"
                  >
                    + إضافة صح أو خطأ
                  </button>
                </div>
              </div>

              {questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface-secondary text-brand-cyan">
                      السؤال {qIdx + 1} • {q.question_type === "mcq" ? "اختيار من متعدد" : "صح أو خطأ"}
                    </span>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={q.points}
                        onChange={(e) => {
                          const pts = Number(e.target.value);
                          setQuestions((prev) =>
                            prev.map((item) => (item.id === q.id ? { ...item, points: pts } : item))
                          );
                        }}
                        className="w-16 px-2 py-1 rounded-lg bg-surface-secondary border border-border text-xs text-center font-bold"
                        title="درجة السؤال"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="p-1.5 text-muted hover:text-status-danger transition-colors"
                        title="حذف السؤال"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      value={q.question_text}
                      onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                      placeholder="اكتب نص السؤال هنا..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs font-semibold focus:outline-none focus:border-brand-cyan"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="block text-[11px] text-muted">
                      الخيارات (حدد الخيار الصحيح بالنقر على الدائرة):
                    </label>

                    {q.options.map((optText, optIdx) => {
                      const isCorrect = q.correct_index === optIdx;
                      return (
                        <div key={optIdx} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCorrectIndexChange(q.id, optIdx)}
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                              isCorrect
                                ? "border-brand-teal bg-brand-teal text-background"
                                : "border-muted hover:border-brand-cyan"
                            )}
                            title="تعيين كإجابة صحيحة"
                          >
                            {isCorrect && <div className="w-2 h-2 rounded-full bg-background" />}
                          </button>
                          <input
                            type="text"
                            value={optText}
                            onChange={(e) =>
                              handleOptionTextChange(q.id, optIdx, e.target.value)
                            }
                            className="flex-1 px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Bar */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <Link
                href="/teacher"
                className="px-5 py-2.5 rounded-xl bg-surface-secondary text-muted hover:text-foreground text-xs font-semibold"
              >
                إلغاء
              </Link>
              <button
                type="submit"
                disabled={isPublishing}
                className="px-6 py-2.5 rounded-xl bg-brand-cyan text-background font-black text-xs hover:brightness-110 shadow-glow disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isPublishing ? "جارٍ الحفظ والنشر..." : "اعتماد ونشر الاختبار الآن"}
              </button>
            </div>
          </form>
        )}
      </main>

      <BottomNavigation user={teacher} />
    </div>
  );
}
