/**
 * Utility to clean Amp&, &amp;, and HTML artifacts from strings,
 * ensuring clean natural text without "Amp&" or "&amp;" appearing on certificates or UI.
 */
export function cleanAmpText(str?: string | null): string {
  if (!str || typeof str !== "string") return "";
  let s = str.trim();

  let previous = "";
  while (s !== previous && (
    s.includes("&amp;") ||
    s.includes("Amp&") ||
    s.includes("AMP&") ||
    s.includes("Amp;") ||
    s.includes("&amp")
  )) {
    previous = s;
    s = s
      .replace(/&amp;/gi, "&")
      .replace(/Amp&/gi, "&")
      .replace(/AMP&/gi, "&")
      .replace(/Amp;/gi, "&")
      .replace(/&amp/gi, "&");
  }

  return s
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/Amp\s*&/gi, "&")
    .trim();
}

export function escapeHtml(str: string): string {
  if (!str || typeof str !== "string") return "";
  const cleanStr = str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "");
    
  return cleanAmpText(cleanStr);
}

export function sanitizeInput<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    return escapeHtml(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeInput(item)) as unknown as T;
  }

  if (typeof data === "object") {
    // Avoid sanitizing special objects like File, Date, Blob, etc.
    if (
      data instanceof File ||
      data instanceof Date ||
      data instanceof Blob ||
      (typeof Buffer !== "undefined" && Buffer.isBuffer(data))
    ) {
      return data;
    }

    const sanitizedObj: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedObj[key] = sanitizeInput((data as any)[key]);
      }
    }
    return sanitizedObj as T;
  }

  return data;
}
