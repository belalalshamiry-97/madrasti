"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Megaphone,
  Plus,
  Calendar,
  User,
  Shield,
  BookOpen,
  Filter,
  CheckCircle2,
  X,
  AlertTriangle,
  Pin,
  ChevronRight,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS, MOCK_ANNOUNCEMENTS } from "@/lib/mock-data";
import { getActiveUser } from "@/lib/user-store";
import { Announcement } from "@/types/database.types";
import { cn } from "@/lib/utils";

interface ExtendedAnnouncement extends Announcement {
  priority?: "urgent" | "important" | "normal";
  is_pinned?: boolean;
}

export default function AnnouncementsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(MOCK_USERS.student1);

  React.useEffect(() => {
    const active = getActiveUser();
    setCurrentUser(active);
  }, []);

  const [announcements, setAnnouncements] = useState<ExtendedAnnouncement[]>([
    {
      id: "d1000000-0000-0000-0000-000000000002",
      title: "جدول الاختبارات النصفية للفصل الدراسي الأول 2026",
      content:
        "أعزاءنا الطلاب والطالبات، نود إحاطتكم بأنه تم نشر جدول الاختبارات النصفية للعام 2026 عبر قسم المقررات. يرجى الالتزام بالحضور بالزي المدرسي الموحد والوصول قبل موعد الاختبار بـ 15 دقيقة على الأقل.",
      target_audience: "all",
      created_by: "د. عبد الرحمن باحميد (مدير المدرسة)",
      created_at: "2026-11-22T08:30:00Z",
      priority: "urgent",
      is_pinned: true,
    },
    {
      id: "d1000000-0000-0000-0000-000000000001",
      title: "أهلاً بكم في العام الدراسي 2026-2027",
      content:
        "ترحب إدارة ثانوية مدرستي بجميع المعلمين والطلاب في بوابتنا التعليمية الإلكترونية المتكاملة. نتمنى لكم عاماً دراسياً حافلاً بالتميز والنجاح الأكاديمي.",
      target_audience: "all",
      created_by: "د. عبد الرحمن باحميد (مدير المدرسة)",
      created_at: "2026-11-20T08:00:00Z",
      priority: "important",
      is_pinned: true,
    },
    {
      id: "d1000000-0000-0000-0000-000000000003",
      title: "تنبيه خاص لطلاب الثالث الثانوي (شعبة علمي - 1)",
      content:
        "سيتم إجراء تطبيق عملي لمادة أمنية النظم والشبكات في معمل الحاسوب يوم الثلاثاء القادم، يرجى إحضار أجهزة اللابتوب أو الفلاشات المحملة بنظام التشغيل الافتراضي.",
      target_audience: "section",
      created_by: "أ. فاطمة العولقي",
      created_at: "2026-11-19T11:00:00Z",
      priority: "normal",
      is_pinned: false,
    },
    {
      id: "d1000000-0000-0000-0000-000000000004",
      title: "اجتماع الكادر التعليمي ومناقشة تقارير الغياب",
      content:
        "يعقد يوم الخميس القادم اجتماع للهيئة التدريسية بقاعة الاجتماعات لمراجعة خطط التعويض ونسب التفاعل على الواجبات الإلكترونية.",
      target_audience: "teachers",
      created_by: "إدارة الشؤون الأكاديمية",
      created_at: "2026-11-18T14:00:00Z",
      priority: "normal",
      is_pinned: false,
    },
  ]);

  const [activeTab, setActiveTab] = useState<"all" | "teachers" | "students" | "section">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New announcement form state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newAudience, setNewAudience] = useState<"all" | "teachers" | "students" | "section">("all");
  const [newPriority, setNewPriority] = useState<"urgent" | "important" | "normal">("normal");
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Filter announcements
  const filteredList = useMemo(() => {
    return announcements.filter((item) => {
      // Teachers only announcements should be hidden from students
      if (currentUser.role === "STUDENT" && item.target_audience === "teachers") {
        return false;
      }
      if (activeTab === "all") return true;
      if (activeTab === "teachers") return item.target_audience === "teachers";
      if (activeTab === "section") return item.target_audience === "section";
      if (activeTab === "students") return item.target_audience === "students" || item.target_audience === "all";
      return true;
    });
  }, [announcements, activeTab, currentUser]);

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);

    const newEntry: ExtendedAnnouncement = {
      id: `d-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      target_audience: newAudience,
      created_by: currentUser.full_name,
      created_at: new Date().toISOString(),
      priority: newPriority,
      is_pinned: newIsPinned,
    };

    setTimeout(() => {
      setAnnouncements((prev) => [newEntry, ...prev]);
      setNewTitle("");
      setNewContent("");
      setNewPriority("normal");
      setNewIsPinned(false);
      setIsSubmitting(false);
      setPublishSuccess(true);
      setTimeout(() => {
        setPublishSuccess(false);
        setIsCreateModalOpen(false);
      }, 1000);
    }, 400);
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-status-danger/20 text-status-danger border border-status-danger/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            عاجل وهام
          </span>
        );
      case "important":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-status-warning/20 text-status-warning border border-status-warning/30">
            تنبيه هام
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20">
            إعلان عام
          </span>
        );
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case "all":
        return "لكافة منسوبي المدرسة";
      case "teachers":
        return "خاص بالمعلمين فقط";
      case "section":
        return "لشعبة الثالث العلمي 1";
      case "students":
        return "للطلاب فقط";
      default:
        return audience;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 flex flex-col">
      <AppHeader
        user={currentUser}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={currentUser}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-cyan text-background flex items-center justify-center font-bold shadow-glow">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">الإعلانات والتعاميم المدرسية</h1>
              <p className="text-xs text-muted">
                القرارات الإدارية، الجداول المدرسية، والمستجدات الأكاديمية الرسمية
              </p>
            </div>
          </div>

          {(currentUser.role === "ADMIN" || currentUser.role === "TEACHER") && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-cyan text-background font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              نشر إعلان جديد
            </button>
          )}
        </div>

        {/* Audience filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors",
              activeTab === "all"
                ? "bg-brand-cyan text-background shadow-glow"
                : "bg-surface hover:bg-surface-secondary text-muted hover:text-foreground border border-border"
            )}
          >
            الكل
          </button>
          {currentUser.role !== "STUDENT" && (
            <button
              onClick={() => setActiveTab("teachers")}
              className={cn(
                "px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors",
                activeTab === "teachers"
                  ? "bg-brand-cyan text-background shadow-glow"
                  : "bg-surface hover:bg-surface-secondary text-muted hover:text-foreground border border-border"
              )}
            >
              المعلمون فقط
            </button>
          )}
          <button
            onClick={() => setActiveTab("section")}
            className={cn(
              "px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-colors",
              activeTab === "section"
                ? "bg-brand-cyan text-background shadow-glow"
                : "bg-surface hover:bg-surface-secondary text-muted hover:text-foreground border border-border"
            )}
          >
            الشعبة الدراسية
          </button>
        </div>

        {/* Announcements Stream */}
        <div className="space-y-4">
          {filteredList.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-3">
              <Megaphone className="w-10 h-10 text-muted mx-auto opacity-40" />
              <h3 className="text-base font-bold text-foreground">لا توجد إعلانات منشورة</h3>
              <p className="text-xs text-muted">
                لم يتم إرسال أي تعاميم في هذا القسم حتى الآن.
              </p>
            </div>
          ) : (
            filteredList.map((item) => (
              <article
                key={item.id}
                className={cn(
                  "p-5 rounded-3xl bg-surface border shadow-card transition-all relative overflow-hidden",
                  item.priority === "urgent"
                    ? "border-status-danger/40 ring-1 ring-status-danger/20"
                    : "border-border hover:border-brand-cyan/40"
                )}
              >
                {/* Header: Author & Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-surface-secondary text-brand-cyan flex items-center justify-center font-bold text-xs border border-border">
                      {item.created_by.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        {item.created_by}
                        {item.is_pinned && (
                          <Pin className="w-3 h-3 text-status-warning fill-status-warning rotate-45" />
                        )}
                      </h4>
                      <span className="text-[11px] text-muted block">
                        {getAudienceLabel(item.target_audience)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getPriorityBadge(item.priority)}
                    <span className="text-[11px] text-muted flex items-center gap-1" dir="ltr">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.created_at).toLocaleDateString("ar-YE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-3.5 space-y-2">
                  <h3 className="text-base sm:text-lg font-black text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      {/* Create Announcement Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-brand-cyan" />
                إضافة إعلان أو تعميم جديد
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {publishSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-brand-teal mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-foreground">تم نشر الإعلان بنجاح!</h4>
                <p className="text-xs text-muted">تم إشعار كافة الفئات المستهدفة فورياً.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    عنوان الإعلان
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: موعد تسليم مشاريع التخرج الفصلية"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      الفئة المستهدفة
                    </label>
                    <select
                      value={newAudience}
                      onChange={(e) => setNewAudience(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan"
                    >
                      <option value="all">كافة منسوبي المدرسة</option>
                      <option value="students">الطلاب فقط</option>
                      <option value="teachers">المعلمون فقط</option>
                      <option value="section">شعبة دراسية معينة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      درجة الأهمية
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan"
                    >
                      <option value="normal">عادي</option>
                      <option value="important">تنبيه هام</option>
                      <option value="urgent">عاجل وفوري</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    نص الإعلان والتفاصيل
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="اكتب نص الإعلان التوضيحي هنا بالتفصيل..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-secondary border border-border text-foreground text-xs focus:outline-none focus:border-brand-cyan resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="pinCheckbox"
                    checked={newIsPinned}
                    onChange={(e) => setNewIsPinned(e.target.checked)}
                    className="rounded bg-surface-secondary border-border text-brand-cyan focus:ring-0"
                  />
                  <label htmlFor="pinCheckbox" className="text-xs text-muted cursor-pointer">
                    تثبيت الإعلان في أعلى القائمة للجميع
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-surface-secondary text-muted hover:text-foreground text-xs font-semibold transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-brand-cyan text-background text-xs font-bold hover:brightness-110 shadow-glow disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? "جارٍ النشر..." : "نشر الإعلان"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <BottomNavigation user={currentUser} />
    </div>
  );
}
