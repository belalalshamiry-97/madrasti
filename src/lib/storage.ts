export const ALLOWED_EXTENSIONS = ["pdf", "docx", "doc", "pptx", "ppt", "jpg", "jpeg", "png", "webp"];
export const BLOCKED_EXTENSIONS = ["exe", "bat", "cmd", "sh", "vbs", "js", "msi", "ps1", "com", "scr", "dll", "bin"];
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedName?: string;
  fileSizeBytes?: number;
  extension?: string;
}

export function validateFile(file: { name: string; size: number }): FileValidationResult {
  const parts = file.name.split(".");
  if (parts.length < 2) {
    return { isValid: false, error: "الملف لا يحتوي على امتداد صالح." };
  }

  const ext = parts.pop()!.toLowerCase();

  // 1. Check danger blacklist
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return {
      isValid: false,
      error: `امتداد الملف (.${ext}) محظور تماماً لأسباب أمنية. لا يُسمح برفع ملفات تنفيذية أو برمجية.`,
    };
  }

  // 2. Check whitelist
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      isValid: false,
      error: `نوع الملف (.${ext}) غير مدعوم. الأنواع المسموحة هي: PDF, DOCX, PPTX, وصور JPG/PNG.`,
    };
  }

  // 3. Check size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `حجم الملف (${formatBytes(file.size)}) يتجاوز الحد الأقصى المسموح به (25 ميجابايت).`,
    };
  }

  // 4. Sanitize file name
  const rawBaseName = parts.join(".").replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, "_");
  const uniqueSuffix = Date.now().toString(36);
  const sanitizedName = `${rawBaseName}_${uniqueSuffix}.${ext}`;

  return {
    isValid: true,
    sanitizedName,
    fileSizeBytes: file.size,
    extension: ext,
  };
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 بايت";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["بايت", "كيلوبايت", "ميجابايت", "جيجابايت"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getMaterialType(fileName: string): "pdf" | "doc" | "ppt" | "image" | "url" {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "docx" || ext === "doc") return "doc";
  if (ext === "pptx" || ext === "ppt") return "ppt";
  if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp") return "image";
  return "url";
}