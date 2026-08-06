import crypto from "crypto";

/**
 * Generate a clean, URL-safe Base62 / alphanumeric verification token for QR code scanning.
 * Example format: `dkffj_aff_4L8sK2Xn9QmP7YtR`
 */
export function generateVerificationToken(): string {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const bytes = crypto.randomBytes(16);
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return `dkffj_aff_${result}`;
}

/**
 * Generate a clean URL-safe slug for future institute public profile URLs.
 * Example: `abc-computer-academy-fatehpur`
 */
export function generateInstituteSlug(organizationName: string, district: string): string {
  const raw = `${organizationName}-${district}`.toLowerCase().trim();
  const slugified = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  
  const randomSuffix = crypto.randomBytes(2).toString("hex");
  return `${slugified}-${randomSuffix}`;
}

/**
 * Mask sensitive PAN string (e.g. ABCDE1234F -> XXXXX1234F or XXXXXX1234)
 */
export function maskPAN(pan?: string | null): string {
  if (!pan || pan.trim().length === 0) return "N/A";
  const clean = pan.trim().toUpperCase();
  if (clean.length < 4) return "****";
  const lastFour = clean.slice(-4);
  return `XXXXXX${lastFour}`;
}

/**
 * Mask sensitive ID proof 4 digits (e.g. "1234" -> "XXXX-XXXX-1234")
 */
export function maskIDProof(lastFour?: string | null): string {
  if (!lastFour || lastFour.trim().length === 0) return "N/A";
  const clean = lastFour.trim();
  return `XXXX-XXXX-${clean}`;
}
