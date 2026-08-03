import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawParam = searchParams.get("path") || searchParams.get("url") || "";

    if (!rawParam) {
      return NextResponse.json({ error: "Missing document path or URL parameter." }, { status: 400 });
    }

    let inputPath = rawParam.trim();
    
    // Multi-pass decoding to handle HTML-entity-encoded URLs and double-encoded paths
    for (let i = 0; i < 3; i++) {
      try { inputPath = decodeURIComponent(inputPath); } catch {}
      inputPath = inputPath
        .replace(/&#x2[Ff];/g, "/")
        .replace(/&#x3[Aa];/g, ":")
        .replace(/&amp;/g, "&")
        .replace(/&#47;/g, "/")
        .replace(/&#58;/g, ":");
    }
    inputPath = inputPath
      .replace(/https:\/\/+/g, "https://")
      .replace(/http:\/\/+/g, "http://")
      .trim();

    const currentSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tgszzjbvpcznndrfkkov.supabase.co";
    const oldSupabaseUrl = "https://ydfeyymikxndqijykyly.supabase.co";

    let bucket = "aadhaar";
    let cleanRelPath = inputPath;

    if (inputPath.startsWith("http://") || inputPath.startsWith("https://")) {
      const match = inputPath.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/([^?]+)/);
      if (match) {
        bucket = match[1];
        cleanRelPath = match[2];
      } else {
        const parts = inputPath.split("/storage/v1/object/");
        if (parts.length > 1) {
          const pathParts = parts[1].replace(/^(?:public|sign)\//, "").split("/");
          bucket = pathParts[0];
          cleanRelPath = pathParts.slice(1).join("/").split("?")[0];
        }
      }
    } else {
      cleanRelPath = inputPath.replace(/^\/+/, "");
      if (cleanRelPath.startsWith("photos/")) {
        bucket = "photos";
        cleanRelPath = cleanRelPath.substring(7);
      } else if (cleanRelPath.startsWith("aadhaar/")) {
        bucket = "aadhaar";
        cleanRelPath = cleanRelPath.substring(8);
      } else if (cleanRelPath.startsWith("signatures/")) {
        bucket = "signatures";
        cleanRelPath = cleanRelPath.substring(11);
      } else if (cleanRelPath.startsWith("certificates/")) {
        bucket = "certificates";
        cleanRelPath = cleanRelPath.substring(13);
      }
    }

    const urlsToTry: string[] = [
      `${currentSupabaseUrl}/storage/v1/object/public/${bucket}/${cleanRelPath}`,
      `${currentSupabaseUrl}/storage/v1/object/public/photos/${cleanRelPath}`,
      `${currentSupabaseUrl}/storage/v1/object/public/aadhaar/${cleanRelPath}`,
      `${oldSupabaseUrl}/storage/v1/object/public/${bucket}/${cleanRelPath}`
    ];
    if (inputPath.startsWith("http://") || inputPath.startsWith("https://")) {
      urlsToTry.unshift(inputPath);
    }

    // Attempt 1: Server-side Supabase client download via Server Client
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);

      const bucketsToTry = Array.from(new Set([bucket, "photos", "aadhaar", "certificates", "signatures"]));
      for (const b of bucketsToTry) {
        const { data, error } = await supabase.storage.from(b).download(cleanRelPath);
        if (data && !error) {
          const arrayBuffer = await data.arrayBuffer();
          const contentType = data.type || (cleanRelPath.endsWith(".png") ? "image/png" : cleanRelPath.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
          return new Response(arrayBuffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
              "Content-Disposition": "inline",
            },
          });
        }
      }
    } catch (e) {
      console.warn("[DOC PROXY] Supabase client download exception:", e);
    }

    // Attempt 2: HTTP fetch candidates
    for (const url of urlsToTry) {
      try {
        const res = await fetch(url, { cache: "force-cache" });
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const contentType = res.headers.get("content-type") || (url.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
          return new Response(buffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
              "Content-Disposition": "inline",
            },
          });
        }
      } catch (fetchErr) {
        console.warn(`[DOC PROXY] Fetch error for ${url}:`, fetchErr);
      }
    }

    return NextResponse.json({ error: "Document file not found in storage." }, { status: 404 });
  } catch (err: any) {
    console.error("Document Proxy Exception:", err);
    return NextResponse.json({ error: err?.message || "Internal document proxy error." }, { status: 500 });
  }
}
