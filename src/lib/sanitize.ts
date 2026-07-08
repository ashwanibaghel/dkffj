/**
 * Recursive utility to sanitize strings, arrays, and objects by escaping
 * HTML characters to prevent Cross-Site Scripting (XSS) attacks.
 */

export function escapeHtml(str: string): string {
  // Strip tags first
  let cleanStr = str.replace(/<[^>]*>/g, "");
  
  // Escape HTML entities to prevent rendering context breaks
  return cleanStr
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
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
