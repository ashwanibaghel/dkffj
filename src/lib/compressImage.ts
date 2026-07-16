/**
 * Compresses an image File using the Canvas API.
 * Returns a new File with reduced size.
 * PDFs are returned as-is (cannot be canvas-compressed).
 *
 * @param file        Original image file
 * @param maxWidthPx  Max width to resize to (default 1200)
 * @param quality     JPEG quality 0-1 (default 0.75)
 * @param maxSizeKB   Target max size in KB (default 800KB)
 */
export async function compressImage(
  file: File,
  maxWidthPx = 1800,
  quality = 0.85,
  maxSizeKB = 1500
): Promise<File> {
  // PDFs & non-images — return as-is
  if (!file.type.startsWith("image/")) return file;

  // Already small enough
  if (file.size <= maxSizeKB * 1024) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate scaled dimensions
      let { width, height } = img;
      if (width > maxWidthPx) {
        height = Math.round((height * maxWidthPx) / width);
        width = maxWidthPx;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(file); // fallback

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const compressed = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          console.log(
            `[COMPRESS] ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(compressed.size / 1024).toFixed(0)}KB`
          );
          resolve(compressed);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // fallback to original on error
    };

    img.src = url;
  });
}

/**
 * Compress multiple files meant for a form submission.
 * Returns compressed versions (or originals if already small / PDF).
 */
export async function compressFormFiles(files: {
  photo: File | null;
  aadhaar: File | null;
  signature: File | null;
}): Promise<typeof files> {
  const [photo, aadhaar, signature] = await Promise.all([
    files.photo ? compressImage(files.photo, 1600, 0.85, 800) : Promise.resolve(null),
    files.aadhaar ? compressImage(files.aadhaar, 2000, 0.85, 1200) : Promise.resolve(null),
    files.signature ? compressImage(files.signature, 1200, 0.85, 500) : Promise.resolve(null),
  ]);
  return { photo, aadhaar, signature };
}
