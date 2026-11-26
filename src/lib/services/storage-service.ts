"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { validateFile } from "@/lib/storage";

export interface UploadFileResult {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  error?: string;
}

/**
 * Server action to upload a file to Supabase Storage securely
 */
export async function uploadFileAction(formData: FormData): Promise<UploadFileResult> {
  try {
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "course-materials";
    const folder = (formData.get("folder") as string) || "general";

    if (!file || typeof file === "string") {
      return { success: false, error: "لم يتم اختيار أي ملف للرفع." };
    }

    // Server-side validation
    const validation = validateFile({ name: file.name, size: file.size });
    if (!validation.isValid) {
      return { success: false, error: validation.error || "الملف غير صالح." };
    }

    const admin = createAdminClient();
    const cleanName = validation.sanitizedName || `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const storagePath = `${folder}/${cleanName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await admin.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (error || !data) {
      console.error(`Storage upload error in bucket [${bucket}]:`, error);
      return {
        success: false,
        error: error?.message || "فشل رفع الملف إلى مساحة التخزين السحابية في Supabase.",
      };
    }

    const { data: urlData } = admin.storage.from(bucket).getPublicUrl(storagePath);

    return {
      success: true,
      filePath: storagePath,
      publicUrl: urlData.publicUrl,
      fileName: file.name,
      fileSizeBytes: file.size,
    };
  } catch (err: any) {
    console.error("Exception in uploadFileAction:", err);
    return { success: false, error: err.message || "حدث خطأ غير متوقع أثناء معالجة ورفع الملف." };
  }
}

/**
 * Get download or signed URL for a file in Supabase Storage
 */
export async function getFileDownloadUrl(bucket: string, filePath: string): Promise<string | null> {
  try {
    if (!filePath) return null;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }

    const admin = createAdminClient();

    // First try public URL
    const { data } = admin.storage.from(bucket).getPublicUrl(filePath);
    if (data?.publicUrl) {
      return data.publicUrl;
    }

    // Fallback to signed URL (valid for 2 hours)
    const { data: signed } = await admin.storage.from(bucket).createSignedUrl(filePath, 7200);
    return signed?.signedUrl || null;
  } catch (err) {
    console.error("Error generating file URL:", err);
    return null;
  }
}
