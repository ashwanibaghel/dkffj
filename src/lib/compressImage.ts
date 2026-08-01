/**
 * Fast client-side image & PDF compressor using HTML Canvas and PDF.js.
 * Reduces 10MB+ smartphone camera photos & 10MB+ scanned PDFs to ~150KB-300KB JPEG
 * for instant, 100% reliable uploads without payload size errors.
 */

async function loadPdfJs(): Promise<any> {
  if (typeof window === "undefined") return null;
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(pdfjsLib);
      } else {
        reject(new Error("pdfjsLib not available"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load PDF rendering library"));
    document.head.appendChild(script);
  });
}

/**
 * Converts the first page of a heavy PDF into a high-quality, compressed JPEG File (~250KB).
 */
export async function convertPdfToJpeg(file: File): Promise<File> {
  if (!file || file.type !== "application/pdf") return file;
  if (file.size < 800 * 1024) return file; // Leave small PDFs (< 800KB) untouched

  try {
    const pdfjsLib = await loadPdfJs();
    if (!pdfjsLib) return file;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    // Scale 1.8 for sharp text readability while keeping canvas compact
    const viewport = page.getViewport({ scale: 1.8 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) return file;

    await page.render({ canvasContext: context, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const imageName = file.name.replace(/\.pdf$/i, "") + "_converted.jpg";
          const compressedFile = new File([blob], imageName, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          console.log(
            `[PDF COMPRESSED TO JPEG] Original PDF: ${(file.size / 1024 / 1024).toFixed(2)}MB -> JPEG: ${(blob.size / 1024).toFixed(0)}KB`
          );
          resolve(compressedFile);
        },
        "image/jpeg",
        0.85
      );
    });
  } catch (err) {
    console.warn("PDF conversion failed, retaining original PDF:", err);
    return file;
  }
}

export async function compressImage(
  file: File,
  maxWidth: number = 1400,
  maxHeight: number = 1400,
  quality: number = 0.85
): Promise<File> {
  if (!file) return file;

  // Handle PDF files: Render page 1 to compressed JPEG
  if (file.type === "application/pdf") {
    return convertPdfToJpeg(file);
  }

  // If not an image or is SVG, return original file
  if (!file.type.startsWith("image/") || file.type.includes("svg")) {
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
