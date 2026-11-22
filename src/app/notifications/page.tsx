"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  FileCheck,
  Video,
  Megaphone,
  MessageSquare,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MOCK_USERS, MOCK_NOTIFICATIONS } from "@/lib/mock-data";
import { Notification } from "@/types/database.types";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(MOCK_USERS.student1);

  React.useEffect(() => {
    const match = document.cookie.match(new RegExp("(^| )madrasti_session_role=([^;]+)"));
    const role = match ? match[2] : "STUDENT";
    if (role === "TEACHER") setCurrentUser(MOCK_USERS.teacher1);
    else if (role === "ADMIN") setCurrentUser(MOCK_USERS.admin);
    else setCurrentUser(MOCK_USERS.student1);
  }, []);

  const [notifications, setNotifications] = useState<Notification[]>(() => [
    ...MOCK_NOTIFICATIONS,
    {
      id: "e1000000-0000-0000-0000-000000000003",
      user_id: "cc000000-0000-0000-0000-000000000001",
      title: "تم رصد نتيجة التكليف",
      message: "قام م. بلال الشميري بتصحيح تكليف 2 (DHCP). الدرجة: 9.5 / 10.",
      link_url: "/student/grades",
      type: "grade",
      is_read: false,
      created_at: "2026-11-21T16:00:00Z",
    },
    {
      id: "e1000000-0000-0000-0000-000000000004",
      user_id: "cc000000-0000-0000-0000-000000000001",
      title: "إعلان مدرسي جديد",
      message: "أهلاً بكم في العام الدراسي 2026-2027 — ترحب إدارة ثانوية مدرستي بجميع منسوبيها.",
      link_url: "/announcements",
      type: "announcement",
      is_read: true,
      created_at: "2026-11-20T08:00:00Z",
    },
    {
      id: "e1000000-0000-0000-0000-000000000005",
      user_id: "cc000000-0000-0000-0000-000000000001",
      title: "رسالة جديدة من المعلم",
      message: "م. بلال الشميري: أهلاً عمر، تم الاطلاع على تقريرك وهو ممتاز جداً، استمر!",
      link_url: "/messages",
      type: "message",
      is_read: true,
      created_at: "2026-11-21T16:30:00Z",
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread" | "assignment" | "session" | "announcement" | "grade"
  >("all");

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeFilter === "unread") return !n.is_read;
      if (activeFilter === "assignment") return n.type === "assignment";
      if (activeFilter === "session") return n.type === "session";
      if (activeFilter === "announcement") return n.type === "announcement";
      if (activeFilter === "grade") return n.type === "grade";
      return true;
    });
  }, [notifications, activeFilter]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <FileCheck className="w-5 h-5 text-status-warning" />;
      case "grade":
        return <Sparkles className="w-5 h-5 text-brand-cyan" />;
      case "session":
        return <Video className="w-5 h-5 text-brand-teal" />;
      case "announcement":
        return <Megaphone className="w-5 h-5 text-purple-400" />;
      case "message":
        return <MessageSquare className="w-5 h-5 text-brand-cyan" />;
      default:
        return <Bell className="w-5 h-5 text-muted" />;
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
            <div className="w-10 h-10 rounded-2xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">مركز الإشعارات والتنبيهات</h1>
              <p className="text-xs text-muted">
                متابعة لحظية لكافة الواجبات، الجلسات، الإعلانات ودرجاتك
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-3 py-1.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-xs font-semibold text-brand-cyan flex items-center gap-1.5 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                تحديد الكل كمقروء ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveFilter("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors",
              activeFilter === "all"
                ? "bg-brand-cyan text-background font-bold shadow-glow"
                : "bg-surface hover:bg-surface-secondary text-muted hover:text-foreground border border-border"
            )}
          >
            الكل ({notifications.length})
          </button>
          <button
            onClick={() => setActiveFilter("unread")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
              activeFilter === "unread"
                ? "bg-brand-cyan text-background font-bold shadow-glow"
                : "bg-surface hover:bg-surface-secondary text-muted hover:text-foreground border border-border"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-status-danger"></span>
            غير المقروءة ({unreadCount})
          </button>
          <button
            onClick={() => setActiveFilter("assignment")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors",
              activeFilter === "assignment"
                ? "bg-brand-cyan text-background font-bold shadow-glow"
                : "bg-surface hover:bg-surface-secondary text-muted hover:text-foreground border border-border"
            )}
          >
            الواجبات
          </button>
          <button
            onClick={() => setActiveFilter("grade")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors",
              activeFilter === "grade"
                ? "bg-brand-cyan text-background font-bold shadow-glow"
                : "bg-surface hover:bg-surface-secondary text-muted hover:text-foreground border border-border"
            )}
          >
            النتائج والدرجات
          </button>
          <button
            onClick={() => setActiveFilter("session")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors",
              activeFilter === "session"
                ? "bg-brand-cyan text-background font-bold shadow-glow"
                : "bg-surface hover:bg-surface-secondary text-muted hover:text-foreground border border-border"
            )}
          >
            الجلسات المباشرة
          </button>
          <button
            onClick={() => setActiveFilter("announcement")}
            className={cn(
              "px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors",
              activeFilter === "announcement"
                ? "bg-brand-cyan text-background font-bold shadow-glow"
                : "bg-surface hover:bg-surface-secondary text-muted hover:text-foreground border border-border"
            )}
          >
            الإعلانات
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-3">
            <Bell className="w-10 h-10 text-muted mx-auto opacity-40" />
            <h3 className="text-base font-bold text-foreground">لا توجد إشعارات هنا</h3>
            <p className="text-xs text-muted">
              {activeFilter === "unread"
                ? "لقد قمت بقراءة جميع التنبيهات، رائع!"
                : "ستصلك التنبيهات المدرسية فور نشرها مباشرة."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id)}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex items-start gap-3.5 shadow-card",
                  notif.is_read
                    ? "bg-surface border-border/80 opacity-80 hover:opacity-100"
                    : "bg-surface-secondary/70 border-brand-cyan/40 ring-1 ring-brand-cyan/20"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-brand-cyan shrink-0 animate-pulse"></span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted whitespace-nowrap flex items-center gap-1" dir="ltr">
                      <Clock className="w-3 h-3 text-muted" />
                      {new Date(notif.created_at).toLocaleTimeString("ar-YE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-foreground/80 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3 pt-2 border-t border-border/50">
                    <span className="text-[10px] text-muted">
                      {new Date(notif.created_at).toLocaleDateString("ar-YE", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>

                    {notif.link_url && (
                      <Link
                        href={notif.link_url}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-cyan hover:underline"
                      >
                        <span>فتح الرابط</span>
                        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation user={currentUser} />
    </div>
  );
}
