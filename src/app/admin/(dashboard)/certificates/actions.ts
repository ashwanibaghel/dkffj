"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { verifyAdmin } from "../auth";

// 1. Fetch issued certificates
export async function getCertificates() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return [];
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching certificates:", error);
    return [];
  }
  return data || [];
}

// 2. Revoke or Activate Certificate
export async function toggleCertificateStatus(id: string, currentStatus: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate admin auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  const newStatus = currentStatus === "VALID" ? "REVOKED" : "VALID";

  const { error } = await supabase
    .from("certificates")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    console.error("Failed to toggle certificate state:", error);
    return { success: false, error: "Database toggle error." };
  }

  return { success: true };
}

// 3. Get metadata for regenerating an existing certificate
export async function getCertificateRegenerationData(registrationId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate admin auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  // Fetch registration details
  const { data: reg, error: regErr } = await supabase
    .from("course_registrations")
    .select(`
      id, 
      enrollment_no, 
      full_name, 
      email, 
      status, 
      user_id,
      created_at,
      approved_at,
      father_name,
      photo_url,
      courses (
        title,
        duration
      )
    `)
    .eq("id", registrationId)
    .single();

  if (regErr || !reg) {
    return { success: false, error: "Enrollment record not found." };
  }

  // Calculate duration dates based on course duration if possible
  const createdDate = new Date(reg.created_at);
  const fromDateStr = createdDate.toLocaleDateString("en-IN");
  
  // Estimate end date
  const endDate = new Date(createdDate);
  const durationText = (reg.courses as any)?.duration || "";
  let months = 1;
  const match = durationText.match(/(\d+)/);
  if (match) {
    const val = parseInt(match[1]);
    if (durationText.toLowerCase().includes("year")) {
      months = val * 12;
    } else {
      months = val;
    }
  }
  endDate.setMonth(endDate.getMonth() + months);
  const toDateStr = endDate.toLocaleDateString("en-IN");

  return {
    success: true,
    studentName: reg.full_name,
    photoUrl: reg.photo_url,
    fatherName: reg.father_name || "N/A",
    enrollmentNo: reg.enrollment_no || "",
    courseTitle: (reg.courses as any)?.title || "Selected Course",
    durationFrom: fromDateStr,
    durationTo: toDateStr,
    grade: "A",
    venue: "Online (DKFFJ Portal)",
    performance: "Excellent",
    dateStr: new Date(reg.approved_at || reg.created_at).toLocaleDateString("en-IN")
  };
}

// 4. Update Certificate PDF URL
export async function updateCertificatePdfUrl(certNo: string, pdfUrl: string) {
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
    .from("certificates")
    .update({ pdf_url: pdfUrl })
    .eq("certificate_no", certNo);

  if (error) {
    console.error("Database update error for certificate pdf_url:", error);
    return { success: false, error: `Failed to update certificate PDF: ${error.message}` };
  }

  return { success: true };
}
