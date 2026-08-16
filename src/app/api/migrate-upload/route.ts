import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Migration is an administrator-only operation. Never trust a client-side secret.
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
    if (!profile || profile.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    const filePath = formData.get("path") as string;

    if (!file || !bucket || !filePath) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const allowedBuckets = new Set(["photos", "aadhaar", "signatures"]);
    if (!allowedBuckets.has(bucket) || filePath.startsWith("/") || filePath.includes("..") || !/^[A-Za-z0-9_./-]{1,500}$/.test(filePath)) {
      return NextResponse.json({ error: "Invalid upload destination" }, { status: 400 });
    }

    // Upload file to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error(`Error uploading to ${bucket}/${filePath}:`, error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Return URLs
    if (bucket === "photos") {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return NextResponse.json({ success: true, url: urlData.publicUrl });
    }

    // Private buckets return bucket/path reference
    return NextResponse.json({ success: true, url: `${bucket}/${filePath}` });
  } catch (err: any) {
    console.error("Migration upload exception:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
