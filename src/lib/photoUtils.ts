/**
 * Universal Photo URL Resolver
 * Ensures relative paths, legacy domain URLs, and HTML-entity encoded strings
 * are cleanly resolved to accessible absolute Supabase CDN URLs on both Server and Client.
 */
export function resolveFullPhotoUrl(url?: string | null): string {
  if (!url || typeof url !== "string" || !url.trim()) return "";
  let clean = url.trim();

  // Multi-pass HTML entity unescape
  for (let i = 0; i < 3; i++) {
    try {
      clean = decodeURIComponent(clean);
    } catch {}
    clean = clean
      .replace(/&#x2[Ff];/gi, "/")
      .replace(/&#x3[Aa];/gi, ":")
      .replace(/&amp;/gi, "&")
      .replace(/&#47;/g, "/")
      .replace(/&#58;/g, ":");
  }

  clean = clean.trim();

  // Data URLs or Blob URLs return immediately
  if (clean.startsWith("data:") || clean.startsWith("blob:")) {
    return clean;
  }

  // Local static files under /public directory (e.g. /logo.png, /images/, /members/)
  if (
    clean.startsWith("/") ||
    clean.startsWith("logo.png") ||
    clean.startsWith("members/") ||
    clean.startsWith("authorities/") ||
    clean.startsWith("images/") ||
    clean.startsWith("slider/")
  ) {
    return clean.startsWith("/") ? clean : `/${clean}`;
  }

  const currentCdnBase = "https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/";
  const oldDomain = "ydfeyymikxndqijykyly.supabase.co";
  const liveDomain = "tgszzjbvpcznndrfkkov.supabase.co";

  // Replace legacy domain with live domain
  if (clean.includes(oldDomain)) {
    clean = clean.replace(oldDomain, liveDomain);
  }

  // If already an absolute http/https URL, return it
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  // Clean relative path leading slashes or prefix artifacts
  let path = clean
    .replace(/^\/+/, "")
    .replace(/^uploads\/membership_form\//, "membership_form/")
    .replace(/^uploads\//, "")
    .replace(/^photos\//, "");

  if (!path.startsWith("membership_form/") && !path.startsWith("aadhaar/") && !path.startsWith("signatures/") && !path.includes("/")) {
    path = `membership_form/${path}`;
  }

  return `${currentCdnBase}${path}`;
}
