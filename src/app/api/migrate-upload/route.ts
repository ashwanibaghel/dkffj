import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MIGRATION_SECRET = "DKFFJ_MIGRATION_SECRET_2026";

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize migration request
    const authHeader = req.headers.get("x-migration-secret");
    if (authHeader !== MIGRATION_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    const filePath = formData.get("path") as string;

    if (!file || !bucket || !filePath) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Initialize server-side Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // 3. Upload file to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
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
