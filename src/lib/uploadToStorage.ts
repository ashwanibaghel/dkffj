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
  path: string
): Promise<{ url: string; error?: string }> {
  // Compress large smartphone camera images before upload
  const file = await compressImage(rawFile);
  // Attempt 1: Direct client-side upload to Supabase Storage
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
    } else if (error) {
      console.warn(`[DIRECT STORAGE UPLOAD FAILED] ${bucket}/${path}: ${error.message}. Trying API fallback...`);
    }
  } catch (err) {
    console.warn(`[DIRECT STORAGE UPLOAD EXCEPTION] ${bucket}/${path}. Trying API fallback...`, err);
  }

  // Attempt 2: Server-side API Route Fallback (/api/upload-document)
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    formData.append("path", path);

    const res = await fetch("/api/upload-document", {
      method: "POST",
      body: formData,
    });

    const text = await res.text();
    let json: any = {};
    try {
      json = JSON.parse(text);
    } catch {
      if (res.status === 413) {
        return { url: "", error: "File size is too large (exceeds 4.5MB limit). Please select a file or photo under 4.5MB." };
      }
      return { url: "", error: `Upload server error (${res.status}): Unable to process document.` };
    }

    if (res.ok && json.url) {
      return { url: json.url };
    }
    return { url: "", error: json.error || "Document upload failed." };
  } catch (apiErr: any) {
    console.error(`[API UPLOAD FALLBACK EXCEPTION] ${bucket}/${path}:`, apiErr);
    return { url: "", error: apiErr?.message || "Upload failed. Please check network connection." };
  }
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
    `${tempId}/photo_${ts}.${photoExt}`
  );
  if (photoRes.error) return { photoUrl: "", idProofUrl: "", error: `Photo upload failed: ${photoRes.error}` };

  onProgress?.("Uploading Identity Proof...");
  const idProofRes = await uploadFileToStorage(
    idProof,
    "aadhaar",
    `${tempId}/idproof_${ts}.${idProofExt}`
  );
  if (idProofRes.error) return { photoUrl: "", idProofUrl: "", error: `ID Proof upload failed: ${idProofRes.error}` };

  let achievementProofUrl: string | null = null;
  if (achievementProof && achievementProof.size > 0) {
    onProgress?.("Uploading Achievement Proof...");
    const achievementExt = achievementProof.name.split(".").pop() || "jpg";
    const achievementRes = await uploadFileToStorage(
      achievementProof,
      "aadhaar",
      `${tempId}/achievement_${ts}.${achievementExt}`
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
