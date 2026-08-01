import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "photos";
    const path = formData.get("path") as string;

    if (!file || !path) {
      return NextResponse.json({ error: "File and path parameters are required." }, { status: 400 });
    }

    const MAX_3MB = 3 * 1024 * 1024;
    if (file.size > MAX_3MB) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `File size exceeds the maximum allowed limit of 3 MB (Current size: ${sizeMB} MB). Please upload a document under 3 MB.` },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
        cacheControl: "3600",
      });

    if (error) {
      console.error(`Server upload error for ${bucket}/${path}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (bucket === "photos") {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      return NextResponse.json({ url: urlData.publicUrl });
    }

    return NextResponse.json({ url: `${bucket}/${data.path}` });
  } catch (err: any) {
    console.error("Upload API route exception:", err);
    return NextResponse.json({ error: err?.message || "Server document upload failed." }, { status: 500 });
  }
}
