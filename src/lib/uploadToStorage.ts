import { createClient } from "@/utils/supabase/client";

/**
 * Uploads a file directly from the browser to Supabase Storage.
 * This bypasses server actions entirely — no 413 possible.
 *
 * @param file      File to upload
 * @param bucket    Supabase storage bucket name
 * @param path      Storage path (e.g. "userId/photo_123.jpg")
 * @returns         publicUrl for public buckets, or storage path for private buckets
 */
export async function uploadFileToStorage(
  file: File,
  bucket: string,
  path: string
): Promise<{ url: string; error?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, cacheControl: "3600" });

  if (error) {
    console.error(`[UPLOAD ERROR] ${bucket}/${path}:`, error.message);
    return { url: "", error: error.message };
  }

  // For public buckets (photos), return public URL
  // For private buckets (aadhaar, signatures), return storage path
  if (bucket === "photos") {
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: urlData.publicUrl };
  }

  // Private bucket — return the path (server will access via signed URL)
  return { url: `${bucket}/${data.path}` };
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
