"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { verifyAdmin } from "../auth";

// 1. Fetch all courses (active + inactive)
export async function getAdminCourses() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return [];
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching courses for admin:", error);
    return [];
  }
  return data || [];
}

// 2. Add or Edit Course
export async function upsertCourse(id: string | null, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate admin auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  // Extract fields
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const duration = formData.get("duration") as string;
  const fees = Number(formData.get("fees"));
  const eligibility = formData.get("eligibility") as string;
  const isActive = formData.get("isActive") === "true";
  const imageFile = formData.get("image") as File;

  if (!title || !description || !duration || isNaN(fees) || !eligibility) {
    return { success: false, error: "All course fields are required." };
  }

  let imageUrl: string | null = formData.get("existingImageUrl") as string || null;

  // Process image file if uploaded
  if (imageFile && imageFile.size > 0) {
    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `courses/course_${Date.now()}.${fileExt}`;
      const fileBuffer = Buffer.from(await imageFile.arrayBuffer());

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, fileBuffer, { contentType: imageFile.type, upsert: true });

      if (uploadError) {
        console.error("Course image upload failed:", uploadError);
        return { success: false, error: `Image upload failed: ${uploadError.message}` };
      }

      // Get public URL
      const { data: urlRes } = supabase.storage.from("photos").getPublicUrl(fileName);
      imageUrl = urlRes.publicUrl;
    } catch (err: any) {
      console.error(err);
      return { success: false, error: "Error uploading image file." };
    }
  }

  const payload: any = {
    title,
    description,
    duration,
    fees,
    eligibility,
    image_url: imageUrl,
    is_active: isActive
  };

  if (id) {
    // Update
    const { error: updateError } = await supabase
      .from("courses")
      .update(payload)
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update course:", updateError);
      return { success: false, error: "Database update failed." };
    }
  } else {
    // Insert
    const { error: insertError } = await supabase
      .from("courses")
      .insert(payload);

    if (insertError) {
      console.error("Failed to insert course:", insertError);
      return { success: false, error: "Database insertion failed." };
    }
  }

  return { success: true };
}

// 3. Toggle Course Active Status
export async function toggleCourseStatus(id: string, activeStatus: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate admin auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  const { error } = await supabase
    .from("courses")
    .update({ is_active: activeStatus })
    .eq("id", id);

  if (error) {
    console.error("Failed to toggle course active state:", error);
    return { success: false, error: "Toggle status database error." };
  }

  return { success: true };
}
