"use client";

/**
 * Downloads a file directly to the user's device (Downloads folder)
 * using a fetched Blob, preventing the browser from opening a black/blank viewer tab.
 * 
 * Works for both cross-origin Supabase Storage URLs and direct links.
 */
export async function downloadFileDirectly(
  fileUrl: string | undefined | null,
  suggestedFileName: string = "download"
): Promise<{ success: boolean; error?: string }> {
  if (!fileUrl) {
    return { success: false, error: "رابط الملف غير متوفر للتحميل." };
  }

  // Ensure filename has proper extension if available in URL
  let cleanName = suggestedFileName.trim();
  if (!cleanName.includes(".") && fileUrl.includes(".")) {
    const urlParts = fileUrl.split("?")[0].split(".");
    const ext = urlParts[urlParts.length - 1];
    if (ext && ext.length <= 5 && !ext.includes("/")) {
      cleanName = `${cleanName}.${ext}`;
    }
  }

  try {
    // 1. Fetch file as Blob directly
    const response = await fetch(fileUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`تعذر استرجاع الملف من الخادم (رمز الخطأ: ${response.status})`);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    // Create temporary anchor to trigger local browser download
    const link = document.createElement("a");
    link.href = objectUrl;
    link.setAttribute("download", cleanName);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    // Cleanup resources
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    }, 1500);

    return { success: true };
  } catch (fetchErr) {
    console.warn("Direct blob download failed, falling back to download parameter anchor:", fetchErr);

    try {
      // 2. Fallback: use Supabase ?download query parameter which returns
      // Content-Disposition: attachment header to force native browser download
      let downloadUrl = fileUrl;
      const downloadParam = `download=${encodeURIComponent(cleanName)}`;
      if (downloadUrl.includes("?")) {
        downloadUrl = `${downloadUrl}&${downloadParam}`;
      } else {
        downloadUrl = `${downloadUrl}?${downloadParam}`;
      }

      const fallbackLink = document.createElement("a");
      fallbackLink.href = downloadUrl;
      fallbackLink.setAttribute("download", cleanName);
      // DO NOT set target="_blank" to prevent opening black preview tab
      fallbackLink.style.display = "none";
      document.body.appendChild(fallbackLink);
      fallbackLink.click();

      setTimeout(() => {
        document.body.removeChild(fallbackLink);
      }, 1500);

      return { success: true };
    } catch (fallbackErr: any) {
      console.error("All download strategies failed:", fallbackErr);
      return {
        success: false,
        error: fallbackErr?.message || "فشل تنزيل الملف إلى جهازك.",
      };
    }
  }
}
