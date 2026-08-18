import { NextRequest, NextResponse } from "next/server";

const STORAGE_HOSTS = new Set([
  "tgszzjbvpcznndrfkkov.supabase.co",
  "ydfeyymikxndqijykyly.supabase.co",
]);
const STORAGE_BASE = "https://tgszzjbvpcznndrfkkov.supabase.co";

function getPhotoPath(rawValue: string) {
  const value = rawValue.trim();
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    const url = new URL(value);
    if (!STORAGE_HOSTS.has(url.hostname)) return null;
    const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public|sign)\/photos\/(.+)$/i);
    return match ? decodeURIComponent(match[1]) : null;
  }

  const path = value.replace(/^\/+/, "").replace(/^photos\//i, "");
  return path || null;
}

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("path") || "";
  let path: string | null = null;
  try {
    path = getPhotoPath(source);
  } catch {
    path = null;
  }

  if (!path || path.includes("..")) {
    return NextResponse.json({ error: "Invalid public photo path." }, { status: 400 });
  }

  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  try {
    const upstream = await fetch(`${STORAGE_BASE}/storage/v1/object/public/photos/${encodedPath}`, {
      next: { revalidate: 86400 },
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Photo not found." }, { status: upstream.status });
    }
    return new NextResponse(await upstream.arrayBuffer(), {
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return NextResponse.json({ error: "Photo service unavailable." }, { status: 503 });
  }
}
