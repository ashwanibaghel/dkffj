/**
 * Fast client-side image compressor using HTML Canvas.
 * Reduces 10MB+ smartphone camera photos to ~150KB-300KB JPEG
 * for instant, 100% reliable uploads without "Failed to fetch" errors on mobile.
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.85
): Promise<File> {
  // If not an image or is an SVG/PDF, return original file
  if (!file || !file.type.startsWith("image/") || file.type.includes("svg")) {
    return file;
  }

  // If already small (< 400KB), return as is
  if (file.size < 400 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions keeping aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const fileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const compressedFile = new File([blob], fileName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            console.log(
              `[IMAGE COMPRESSED] Original: ${(file.size / 1024 / 1024).toFixed(2)}MB -> Compressed: ${(blob.size / 1024).toFixed(0)}KB`
            );
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to compress multiple files sequentially for forms.
 */
export async function compressFormFiles(files: (File | null | undefined)[]): Promise<(File | null)[]> {
  const result: (File | null)[] = [];
  for (const f of files) {
    if (!f) {
      result.push(null);
    } else {
      result.push(await compressImage(f));
    }
  }
  return result;
}
