import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pathParam = searchParams.get("path") || searchParams.get("url") || "";

    if (!pathParam) {
      return NextResponse.json({ error: "Missing document path or URL parameter." }, { status: 400 });
    }

    let bucket = "photos";
    let storagePath = pathParam.trim();

    // Clean leading slashes
    if (storagePath.startsWith("/")) {
      storagePath = storagePath.substring(1);
    }

    // Handle full URLs (e.g., https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/...)
    if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
      try {
        const parsed = new URL(storagePath);
        const match = parsed.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
        if (match) {
          bucket = match[1];
          storagePath = match[2];
        } else {
          // Direct fetch fallback for external HTTP URLs
          const extRes = await fetch(storagePath, { cache: "force-cache" });
          if (extRes.ok) {
            const blob = await extRes.arrayBuffer();
            const contentType = extRes.headers.get("content-type") || "image/jpeg";
            return new Response(blob, {
              headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
              },
            });
          }
        }
      } catch (e) {
        console.warn("URL parse fallback for proxy:", e);
      }
    }

    // Determine bucket from path prefix
    if (storagePath.startsWith("photos/")) {
      bucket = "photos";
      storagePath = storagePath.substring(7);
    } else if (storagePath.startsWith("aadhaar/")) {
      bucket = "aadhaar";
      storagePath = storagePath.substring(8);
    } else if (storagePath.startsWith("signatures/")) {
      bucket = "signatures";
      storagePath = storagePath.substring(11);
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Download directly from Supabase Storage via server TCP stream
    const { data, error } = await supabase.storage.from(bucket).download(storagePath);

    if (error || !data) {
      console.warn(`[DOC PROXY] Storage download miss for ${bucket}/${storagePath}:`, error?.message);
      
      // Fallback HTTP fetch to public storage endpoint
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tgszzjbvpcznndrfkkov.supabase.co";
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
      
      const fallbackRes = await fetch(publicUrl, { cache: "force-cache" });
      if (fallbackRes.ok) {
        const buffer = await fallbackRes.arrayBuffer();
        const contentType = fallbackRes.headers.get("content-type") || "image/jpeg";
        return new Response(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }

      return NextResponse.json({ error: "Document not found or inaccessible." }, { status: 404 });
    }

    const arrayBuffer = await data.arrayBuffer();
    const contentType = data.type || (storagePath.endsWith(".png") ? "image/png" : storagePath.endsWith(".pdf") ? "application/pdf" : "image/jpeg");

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("Document Proxy Exception:", err);
    return NextResponse.json({ error: err?.message || "Internal document proxy error." }, { status: 500 });
  }
}
