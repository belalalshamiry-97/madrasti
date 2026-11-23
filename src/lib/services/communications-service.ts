"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  target_audience: "all" | "teachers" | "students" | "section";
  section_id?: string;
  created_by: string; // UUID or username
}

export interface SendMessageInput {
  conversation_id: string;
  sender_id: string; // UUID or username
  body: string;
  attachment_url?: string;
}

/**
 * 1. Create an announcement in Supabase
 */
export async function createAnnouncementInDB(input: CreateAnnouncementInput): Promise<{
  success: boolean;
  announcementId?: string;
  error?: string;
}> {
  try {
    const admin = createAdminClient();

    let creatorUuid = input.created_by;
    if (!creatorUuid.includes("-")) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", input.created_by).maybeSingle();
      if (p?.id) creatorUuid = p.id;
    }

    const { data, error } = await admin
      .from("announcements")
      .insert({
        title: input.title.trim(),
        content: input.content.trim(),
        target_audience: input.target_audience || "all",
        section_id: input.section_id || null,
        created_by: creatorUuid,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Error creating announcement in DB:", error);
      return { success: false, error: error?.message || "فشل نشر الإعلان." };
    }

    revalidatePath("/announcements");
    return { success: true, announcementId: data.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 2. Get announcements from Supabase
 */
export async function getAnnouncementsFromDB(targetAudience?: string) {
  try {
    const admin = createAdminClient();

    let query = admin
      .from("announcements")
      .select(`
        id,
        title,
        content,
        target_audience,
        section_id,
        created_at,
        profiles:created_by (
          full_name,
          role
        )
      `)
      .order("created_at", { ascending: false });

    if (targetAudience && targetAudience !== "all") {
      query = query.or(`target_audience.eq.all,target_audience.eq.${targetAudience}`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((a: any) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      target_audience: a.target_audience,
      section_id: a.section_id,
      created_by: (a.profiles as any)?.full_name || "إدارة المدرسة",
      author_role: (a.profiles as any)?.role || "ADMIN",
      created_at: a.created_at,
    }));
  } catch (err) {
    console.error("Error in getAnnouncementsFromDB:", err);
    return [];
  }
}

/**
 * 3. Send a message in a conversation
 */
export async function sendMessageInDB(input: SendMessageInput): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const admin = createAdminClient();

    let senderUuid = input.sender_id;
    if (!senderUuid.includes("-")) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", input.sender_id).maybeSingle();
      if (p?.id) senderUuid = p.id;
    }

    const { data, error } = await admin
      .from("messages")
      .insert({
        conversation_id: input.conversation_id,
        sender_id: senderUuid,
        body: input.body.trim(),
        attachment_url: input.attachment_url || null,
      })
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "فشل إرسال الرسالة." };
    }

    // Update conversation updated_at
    await admin
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", input.conversation_id);

    revalidatePath("/messages");
    return { success: true, messageId: data.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 4. Get messages for a conversation
 */
export async function getMessagesForConversationFromDB(conversationId: string) {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("messages")
      .select(`
        id,
        conversation_id,
        sender_id,
        body,
        attachment_url,
        created_at,
        profiles:sender_id (
          full_name,
          role
        )
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return data.map((m: any) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      sender_name: (m.profiles as any)?.full_name || "مستخدم",
      sender_role: (m.profiles as any)?.role || "STUDENT",
      body: m.body,
      attachment_url: m.attachment_url,
      created_at: new Date(m.created_at).toLocaleTimeString("ar-YE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      is_read: true,
    }));
  } catch (err) {
    console.error("Error in getMessagesForConversationFromDB:", err);
    return [];
  }
}

/**
 * 5. Get or create conversation between users
 */
export async function getOrCreateConversationInDB(userId1: string, userId2: string, subjectId?: string) {
  try {
    const admin = createAdminClient();

    let u1 = userId1;
    let u2 = userId2;
    if (!u1.includes("-")) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", userId1).maybeSingle();
      if (p?.id) u1 = p.id;
    }
    if (!u2.includes("-")) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", userId2).maybeSingle();
      if (p?.id) u2 = p.id;
    }

    // Check if shared conversation already exists
    const { data: m1 } = await admin.from("conversation_members").select("conversation_id").eq("user_id", u1);
    if (m1 && m1.length > 0) {
      const convIds = m1.map((m) => m.conversation_id);
      const { data: m2 } = await admin
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", u2)
        .in("conversation_id", convIds)
        .limit(1)
        .maybeSingle();

      if (m2?.conversation_id) {
        return { success: true, conversationId: m2.conversation_id };
      }
    }

    // Create new conversation
    const { data: conv, error: cErr } = await admin
      .from("conversations")
      .insert({ subject_id: subjectId || null })
      .select("id")
      .single();

    if (cErr || !conv) return { success: false, error: cErr?.message };

    // Add members
    await admin.from("conversation_members").insert([
      { conversation_id: conv.id, user_id: u1 },
      { conversation_id: conv.id, user_id: u2 },
    ]);

    return { success: true, conversationId: conv.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 6. Get user notifications from Supabase
 */
export async function getNotificationsForUserFromDB(userIdOrUsername: string) {
  try {
    const admin = createAdminClient();

    let userUuid = userIdOrUsername;
    if (!userIdOrUsername.includes("-")) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", userIdOrUsername).maybeSingle();
      if (p?.id) userUuid = p.id;
    }

    const { data, error } = await admin
      .from("notifications")
      .select("*")
      .eq("user_id", userUuid)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.error("Error in getNotificationsForUserFromDB:", err);
    return [];
  }
}

/**
 * 7. Mark notification as read
 */
export async function markNotificationAsReadInDB(notificationId: string) {
  try {
    const admin = createAdminClient();
    await admin.from("notifications").update({ is_read: true }).eq("id", notificationId);
    revalidatePath("/notifications");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 8. Create a notification
 */
export async function createNotificationInDB(input: {
  user_id: string;
  title: string;
  message: string;
  link_url?: string;
  type?: string;
}) {
  try {
    const admin = createAdminClient();

    let userUuid = input.user_id;
    if (!input.user_id.includes("-")) {
      const { data: p } = await admin.from("profiles").select("id").eq("username", input.user_id).maybeSingle();
      if (p?.id) userUuid = p.id;
    }

    const { data, error } = await admin
      .from("notifications")
      .insert({
        user_id: userUuid,
        title: input.title.trim(),
        message: input.message.trim(),
        link_url: input.link_url || null,
        type: input.type || "general",
        is_read: false,
      })
      .select("id")
      .single();

    if (error || !data) return { success: false, error: error?.message };
    return { success: true, notificationId: data.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
