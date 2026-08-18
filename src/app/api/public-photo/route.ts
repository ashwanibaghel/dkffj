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

  const pathSegments = path?.replace(/\\/g, "/").split("/") || [];
  if (!path || pathSegments.some((segment) => segment === ".." || segment === ".")) {
    return NextResponse.json({ error: "Invalid public photo path." }, { status: 400 });
  }

  const isLegacySiteUpload = path.startsWith("uploads/membership_form/");
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const legacyStoragePath = isLegacySiteUpload
    ? `membership_form/${path.substring("uploads/membership_form/".length)}`
    : path;
  const encodedStoragePath = legacyStoragePath.split("/").map(encodeURIComponent).join("/");
  try {
    // Migrated members keep their original photos in the legacy public
    // /uploads/membership_form directory, while new submissions live in the
    // Supabase photos bucket. Serve both through this one app-domain endpoint.
    const upstreamUrls = [
      `${STORAGE_BASE}/storage/v1/object/public/photos/${encodedStoragePath}`,
      ...(isLegacySiteUpload ? [new URL(`/${encodedPath}`, request.url).toString()] : []),
    ];
    let upstream: Response | null = null;
    for (const upstreamUrl of upstreamUrls) {
      const candidate = await fetch(upstreamUrl, { next: { revalidate: 86400 } });
      if (candidate.ok) {
        upstream = candidate;
        break;
      }
    }
    if (!upstream) {
      return NextResponse.json({ error: "Photo not found." }, { status: 404 });
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
