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
    
    // Safely decode URI parameters
    try {
      inputPath = decodeURIComponent(inputPath);
    } catch {}

    const currentSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tgszzjbvpcznndrfkkov.supabase.co";
    const oldSupabaseUrl = "https://ydfeyymikxndqijykyly.supabase.co";

    // Build candidate URLs to attempt in order
    const urlsToTry: string[] = [];

    if (inputPath.startsWith("http://") || inputPath.startsWith("https://")) {
      urlsToTry.push(inputPath);
      // Try cross-domain fallbacks (old project domain <-> new live project domain)
      if (inputPath.includes("ydfeyymikxndqijykyly.supabase.co")) {
        urlsToTry.push(inputPath.replace("ydfeyymikxndqijykyly.supabase.co", "tgszzjbvpcznndrfkkov.supabase.co"));
      } else if (inputPath.includes("tgszzjbvpcznndrfkkov.supabase.co")) {
        urlsToTry.push(inputPath.replace("tgszzjbvpcznndrfkkov.supabase.co", "ydfeyymikxndqijykyly.supabase.co"));
      }
    } else {
      let cleanPath = inputPath.replace(/^\/+/, "");
      if (cleanPath.startsWith("photos/")) cleanPath = cleanPath.substring(7);
      else if (cleanPath.startsWith("aadhaar/")) cleanPath = cleanPath.substring(8);
      else if (cleanPath.startsWith("signatures/")) cleanPath = cleanPath.substring(11);

      urlsToTry.push(`${currentSupabaseUrl}/storage/v1/object/public/photos/${cleanPath}`);
      urlsToTry.push(`${oldSupabaseUrl}/storage/v1/object/public/photos/${cleanPath}`);
      urlsToTry.push(`${currentSupabaseUrl}/storage/v1/object/public/aadhaar/${cleanPath}`);
      urlsToTry.push(`${oldSupabaseUrl}/storage/v1/object/public/aadhaar/${cleanPath}`);
    }

    // 1. Attempt direct Supabase Storage client download
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);

      let bucket = "photos";
      let relPath = inputPath;

      if (relPath.startsWith("http://") || relPath.startsWith("https://")) {
        const match = relPath.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
        if (match) {
          bucket = match[1];
          relPath = match[2];
        }
      } else {
        relPath = relPath.replace(/^\/+/, "");
        if (relPath.startsWith("photos/")) {
          bucket = "photos";
          relPath = relPath.substring(7);
        } else if (relPath.startsWith("aadhaar/")) {
          bucket = "aadhaar";
          relPath = relPath.substring(8);
        }
      }

      const { data, error } = await supabase.storage.from(bucket).download(relPath);
      if (data && !error) {
        const arrayBuffer = await data.arrayBuffer();
        const contentType = data.type || (relPath.endsWith(".png") ? "image/png" : relPath.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
        return new Response(arrayBuffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    } catch (e) {
      console.warn("[DOC PROXY] Supabase client download exception:", e);
    }

    // 2. Multi-Candidate HTTP Fetch Loop (tries current domain, legacy domain, and alternate storage buckets)
    for (const url of urlsToTry) {
      try {
        const res = await fetch(url, { cache: "force-cache" });
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const contentType = res.headers.get("content-type") || "image/jpeg";
          return new Response(buffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
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
