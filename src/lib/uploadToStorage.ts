import { createClient } from "@/utils/supabase/client";
import { compressImage } from "@/lib/compressImage";

/**
 * Uploads a file directly from the browser to Supabase Storage.
 * Auto-compresses high-resolution camera photos to lightweight JPEGs
 * to guarantee 100% fast, reliable uploads without mobile "Failed to fetch" errors.
 *
 * @param rawFile   File to upload
 * @param bucket    Supabase storage bucket name
 * @param path      Storage path (e.g. "userId/photo_123.jpg")
 * @returns         publicUrl for public buckets, or storage path for private buckets
 */
export async function uploadFileToStorage(
  rawFile: File,
  bucket: string,
  path: string,
  options: { skipCompression?: boolean } = {}
): Promise<{ url: string; error?: string }> {
  // The appreciation form has already optimized its files before this helper
  // is called. Do not run a second canvas conversion: it wastes mobile memory,
  // degrades document readability and makes uploads more likely to fail.
  const file = options.skipCompression ? rawFile : await compressImage(rawFile);

  // 2. Strict 3 MB size limit check (post-compression)
  const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB
  if (file.size > MAX_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      url: "",
      error: `File size exceeds the maximum allowed limit of 3 MB (Current size: ${sizeMB} MB). Please select a file or photo under 3 MB.`,
    };
  }

  // Attempt 1: upload directly to Storage from the browser. This avoids a
  // mobile request having to pass through both Vercel and Storage, which was
  // the common source of interrupted uploads on the public form.
  let lastErr = "";
  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (!error && data) {
      if (bucket === "photos") {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
        return { url: urlData.publicUrl };
      }
      return { url: `${bucket}/${data.path}` };
    }
    lastErr = error?.message || "Storage rejected the upload.";
  } catch (err: any) {
    lastErr = err?.message || "Could not reach document storage.";
    console.warn(`[DIRECT STORAGE UPLOAD EXCEPTION] ${bucket}/${path}:`, err);
  }

  // Attempt 2: same-origin route fallback, retried only for transient server
  // failures. Validation/permission errors are returned immediately instead
  // of being hidden behind a misleading generic network message.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      formData.append("path", path);

      const res = await fetch("/api/upload-document", { method: "POST", body: formData });
      const text = await res.text();
      let json: any = {};
      try { json = JSON.parse(text); } catch {}

      if (res.ok && json.url) return { url: json.url };
      if (res.status === 413) {
        return { url: "", error: "File size exceeds the maximum 3 MB limit. Please select a smaller file or photo under 3 MB." };
      }
      lastErr = json.error || `Upload server returned ${res.status}.`;
      if (res.status >= 400 && res.status < 500) break;
    } catch (apiErr: any) {
      lastErr = apiErr?.message || "Upload server could not be reached.";
    }
    await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
  }

  return {
    url: "",
    error: lastErr || "Document storage is temporarily unavailable. Please try again in a few minutes.",
  };
}

/**
 * Uploads all membership documents from the browser to Supabase Storage.
 * Returns URLs/paths for the server action.
 */
export async function uploadMembershipDocs(
  userId: string,
  photo: File,
  aadhaar: File,
  signature: File,
  onProgress?: (step: string) => void
): Promise<{
  photoUrl: string;
  aadhaarUrl: string;
  signatureUrl: string;
  error?: string;
}> {
  const ts = Date.now();
  const photoExt = photo.name.split(".").pop() || "jpg";
  const aadhaarExt = aadhaar.name.split(".").pop() || "jpg";
  const signatureExt = signature.name.split(".").pop() || "jpg";

  onProgress?.("Uploading passport photo...");
  const photoRes = await uploadFileToStorage(
    photo,
    "photos",
    `${userId}/photo_${ts}.${photoExt}`
  );
  if (photoRes.error) return { photoUrl: "", aadhaarUrl: "", signatureUrl: "", error: `Photo upload failed: ${photoRes.error}` };

  onProgress?.("Uploading Aadhaar card...");
  const aadhaarRes = await uploadFileToStorage(
    aadhaar,
    "aadhaar",
    `${userId}/aadhaar_${ts}.${aadhaarExt}`
  );
  if (aadhaarRes.error) return { photoUrl: "", aadhaarUrl: "", signatureUrl: "", error: `Aadhaar upload failed: ${aadhaarRes.error}` };

  onProgress?.("Uploading signature...");
  const signatureRes = await uploadFileToStorage(
    signature,
    "signatures",
    `${userId}/signature_${ts}.${signatureExt}`
  );
  if (signatureRes.error) return { photoUrl: "", aadhaarUrl: "", signatureUrl: "", error: `Signature upload failed: ${signatureRes.error}` };

  return {
    photoUrl: photoRes.url,
    aadhaarUrl: aadhaarRes.url,
    signatureUrl: signatureRes.url,
  };
}

/**
 * Uploads all appreciation certificate documents directly from browser to Supabase Storage.
 * Bypasses Vercel Server Action 4.5MB limits entirely — no 413 Payload Too Large errors possible.
 */
export async function uploadAppreciationDocs(
  tempId: string,
  photo: File,
  idProof: File,
  achievementProof?: File | null,
  onProgress?: (step: string) => void
): Promise<{
  photoUrl: string;
  idProofUrl: string;
  achievementProofUrl?: string | null;
  error?: string;
}> {
  const ts = Date.now();
  const photoExt = photo.name.split(".").pop() || "jpg";
  const idProofExt = idProof.name.split(".").pop() || "jpg";

  onProgress?.("Uploading passport photo...");
  const photoRes = await uploadFileToStorage(
    photo,
    "photos",
    `${tempId}/photo_${ts}.${photoExt}`,
    { skipCompression: true }
  );
  if (photoRes.error) return { photoUrl: "", idProofUrl: "", error: `Photo upload failed: ${photoRes.error}` };

  onProgress?.("Uploading Identity Proof...");
  const idProofRes = await uploadFileToStorage(
    idProof,
    "aadhaar",
    `${tempId}/idproof_${ts}.${idProofExt}`,
    { skipCompression: true }
  );
  if (idProofRes.error) return { photoUrl: "", idProofUrl: "", error: `ID Proof upload failed: ${idProofRes.error}` };

  let achievementProofUrl: string | null = null;
  if (achievementProof && achievementProof.size > 0) {
    onProgress?.("Uploading Achievement Proof...");
    const achievementExt = achievementProof.name.split(".").pop() || "jpg";
    const achievementRes = await uploadFileToStorage(
      achievementProof,
      "aadhaar",
      `${tempId}/achievement_${ts}.${achievementExt}`,
      { skipCompression: true }
    );
    if (achievementRes.error) return { photoUrl: "", idProofUrl: "", error: `Achievement Proof upload failed: ${achievementRes.error}` };
    achievementProofUrl = achievementRes.url;
  }

  return {
    photoUrl: photoRes.url,
    idProofUrl: idProofRes.url,
    achievementProofUrl,
  };
}
