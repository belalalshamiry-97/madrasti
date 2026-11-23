"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Send,
  MessageSquare,
  Search,
  CheckCheck,
  ShieldAlert,
  Clock,
  BookOpen,
  User,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import {
  MOCK_USERS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES_CONV1,
  MockMessage,
  MockConversation,
} from "@/lib/mock-data";
import { getActiveUser } from "@/lib/user-store";
import {
  getMessagesForConversationFromDB,
  sendMessageInDB,
} from "@/lib/services/communications-service";

export default function MessagesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(MOCK_USERS.student1);

  useEffect(() => {
    const active = getActiveUser();
    setCurrentUser(active);
  }, []);

  const [conversations, setConversations] = useState<MockConversation[]>(
    MOCK_CONVERSATIONS
  );
  const [activeConvId, setActiveConvId] = useState<string>("conv-1");
  const [messages, setMessages] = useState<MockMessage[]>(MOCK_MESSAGES_CONV1);
  const [newMessageText, setNewMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  const activeConv =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    async function loadConvMessages() {
      if (activeConvId && activeConvId.includes("-") && activeConvId.length > 20) {
        try {
          const dbMsgs = await getMessagesForConversationFromDB(activeConvId);
          if (dbMsgs && dbMsgs.length > 0) {
            setMessages(dbMsgs as any);
          }
        } catch (err) {
          console.error("Failed to load messages from DB:", err);
        }
      }
    }
    loadConvMessages();
  }, [activeConvId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessageText.trim();
    if (!text) return;

    setIsSending(true);

    const newMsg: MockMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: activeConv.id,
      sender_id: currentUser.id,
      sender_name: currentUser.full_name,
      sender_role: currentUser.role === "TEACHER" ? "TEACHER" : "STUDENT",
      body: text,
      created_at: "الآن",
      is_read: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessageText("");

    if (activeConv.id && activeConv.id.includes("-") && activeConv.id.length > 20) {
      try {
        await sendMessageInDB({
          conversation_id: activeConv.id,
          sender_id: currentUser.id || currentUser.username,
          body: text,
        });
      } catch (err) {
        console.error("Failed sending message to DB:", err);
      }
    }

    setIsSending(false);
  };

  const handleReportMessage = (msgId: string) => {
    setReportSuccess("تم استلام البلاغ وإحالته لإدارة المدرسة للمراجعة الأكاديمية.");
    setTimeout(() => setReportSuccess(null), 4000);
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

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="p-2 -mr-2 rounded-xl text-muted hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">
              الرسائل والتواصل الأكاديمي
            </h1>
            <p className="text-xs text-brand-cyan mt-0.5">
              محادثات مباشرة وآمنة بين المعلمين والطلاب
            </p>
          </div>
          <div className="w-6" />
        </div>

        {reportSuccess && (
          <div className="p-3.5 rounded-2xl bg-brand-teal/15 border border-brand-teal/30 text-brand-teal text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{reportSuccess}</span>
          </div>
        )}

        {/* Messaging Container */}
        <div className="flex-1 h-[72vh] min-h-[500px] bg-surface rounded-3xl border border-border shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-3">
          {/* Right Panel: Conversations List (1 Col) */}
          <div className="border-b md:border-b-0 md:border-l border-border/80 flex flex-col bg-surface-secondary/30">
            <div className="p-4 border-b border-border/80 flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-cyan" />
                المحادثات
              </h3>
              <span className="text-[11px] text-muted">
                {conversations.length} جهات تواصل
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border/50">
              {conversations.map((conv) => {
                const isSelected = conv.id === activeConvId;
                const otherPartyName =
                  currentUser.role === "TEACHER"
                    ? conv.student_name
                    : conv.teacher_name;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-right p-4 flex items-start gap-3 transition-colors ${
                      isSelected
                        ? "bg-brand-cyan/10 border-r-4 border-brand-cyan"
                        : "hover:bg-surface-secondary/70"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center font-bold text-xs text-brand-cyan shrink-0">
                      {otherPartyName.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {otherPartyName}
                        </h4>
                        <span className="text-[10px] text-muted shrink-0">
                          {conv.last_message_time}
                        </span>
                      </div>
                      <span className="text-[11px] text-brand-cyan block truncate">
                        {conv.subject_name}
                      </span>
                      <p className="text-[11px] text-muted truncate mt-0.5">
                        {conv.last_message}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Left Panel: Active Chat Thread (2 Cols) */}
          <div className="md:col-span-2 flex flex-col h-full bg-surface">
            {/* Thread Header */}
            <div className="p-4 border-b border-border/80 flex items-center justify-between bg-surface-secondary/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center font-bold text-sm text-brand-cyan shrink-0">
                  {currentUser.role === "TEACHER"
                    ? activeConv.student_name.slice(0, 1)
                    : activeConv.teacher_name.slice(0, 1)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground truncate">
                    {currentUser.role === "TEACHER"
                      ? activeConv.student_name
                      : activeConv.teacher_name}
                  </h3>
                  <span className="text-[11px] text-brand-cyan block">
                    مقرر {activeConv.subject_name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
                <span className="hidden sm:inline">متصل الآن</span>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="text-center my-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-surface-secondary text-muted border border-border">
                  المحادثة مراقبة لأغراض تعليمية وتربوية
                </span>
              </div>

              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isMe ? "items-start" : "items-end"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? "bg-brand-cyan text-background font-medium rounded-tr-none shadow-glow"
                          : "bg-surface-secondary text-foreground rounded-tl-none border border-border"
                      }`}
                    >
                      <p>{msg.body}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-muted">
                      <span>{msg.created_at}</span>
                      {isMe && <CheckCheck className="w-3.5 h-3.5 text-brand-cyan" />}
                      {!isMe && (
                        <button
                          onClick={() => handleReportMessage(msg.id)}
                          className="hover:text-status-danger transition-colors"
                          title="إبلاغ عن محتوى غير لائق"
                        >
                          <ShieldAlert className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Send Message Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3.5 border-t border-border/80 flex items-center gap-2 bg-surface-secondary/40"
            >
              <input
                type="text"
                placeholder="اكتب رسالتك التعليمية هنا..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                maxLength={500}
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:border-brand-cyan placeholder-muted/60"
              />

              <button
                type="submit"
                disabled={isSending || !newMessageText.trim()}
                className="p-2.5 rounded-xl bg-brand-cyan text-background font-bold shadow-glow hover:opacity-90 transition-opacity disabled:opacity-40"
                title="إرسال"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </form>
          </div>
        </div>
      </main>

      <BottomNavigation user={currentUser} />
    </div>
  );
}