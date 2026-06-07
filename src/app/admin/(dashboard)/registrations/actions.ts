"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { sendTransactionalEmail } from "@/services/email/service";
import { getCertificateIssuedTemplate } from "@/services/email/templates";

// 1. Fetch registrations list
export async function getRegistrations(statusFilter?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("course_registrations")
    .select(`
      *,
      courses (
        title
      )
    `)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "ALL") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching registrations:", error);
    return [];
  }
  return data || [];
}

// 2. Approve or Reject Course Registration
export async function updateRegistrationStatus(id: string, newStatus: string, remarks: string) {
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
  const { data: reg, error: fetchErr } = await supabase
    .from("course_registrations")
    .select("id, status, full_name, email, enrollment_no")
    .eq("id", id)
    .single();

  if (fetchErr || !reg) {
    return { success: false, error: "Course registration record not found." };
  }

  // Update status
  const { error: updateError } = await supabase
    .from("course_registrations")
    .update({
      status: newStatus,
      approved_by: user.id,
      approved_at: newStatus === "APPROVED" ? new Date().toISOString() : null,
      remarks: remarks || null
    })
    .eq("id", id);

  if (updateError) {
    console.error("Failed to update registration:", updateError);
    return { success: false, error: "Database update failed." };
  }

  // Log status transition
  await supabase.from("status_logs").insert({
    registration_id: id,
    from_status: reg.status,
    to_status: newStatus,
    remarks: remarks || `Academy enrollment status updated to ${newStatus} by administrator.`,
    updated_by: user.id
  });

  return { success: true };
}

// 3. Issue Course Certificate
export async function issueCertificateForRegistration(registrationId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Validate admin auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
    return { success: false, error: "Access Denied." };
  }

  // Fetch registration details (must be approved first)
  const { data: reg, error: regErr } = await supabase
    .from("course_registrations")
    .select(`
      id, 
      enrollment_no, 
      full_name, 
      email, 
      status, 
      courses (
        title
      )
    `)
    .eq("id", registrationId)
    .single();

  if (regErr || !reg) {
    return { success: false, error: "Enrollment record not found." };
  }

  if (reg.status !== "APPROVED") {
    return { success: false, error: "Certificate can only be issued for APPROVED course registrations." };
  }

  const courseTitle = (reg.courses as any)?.title || "Selected Course";

  try {
    // 1. Atomically generate Certificate Number
    const { data: certNo, error: rpcError } = await supabase.rpc("generate_next_number", {
      p_key: "certificate",
      p_prefix: "DKCERT"
    });

    if (rpcError || !certNo) {
      console.error("Failed to generate certificate number:", rpcError);
      throw new Error("Failed to generate certificate serial number.");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/verify/${certNo}`;

    // 2. Generate QR Code API URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;

    // 3. Create a beautiful simulated PDF certificate file
    const certificateText = `
      =======================================================
               DK FOUNDATION OF FREEDOM AND JUSTICE
      =======================================================
      
      CERTIFICATE OF COMPLETION AND EXCELLENCE
      
      This is to certify that
      
      Name: ${reg.full_name}
      Enrollment No: ${reg.enrollment_no}
      
      has successfully completed all coursework, academic requirements
      and practical examinations for the certificate program:
      
      Course: ${courseTitle}
      
      Certificate Number: ${certNo}
      Date of Issue: ${new Date().toLocaleDateString("en-IN")}
      
      Verify Authenticity: ${verificationUrl}
      
      =======================================================
       Registered under Ministry of Corporate Affairs, Govt of India
      =======================================================
    `;

    const pdfBuffer = Buffer.from(certificateText);
    const pdfPath = `certs/cert_${certNo}.pdf`;

    // Upload certificate PDF to public bucket
    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      console.error("PDF certificate upload failed:", uploadError);
      throw new Error(`Failed to upload certificate PDF: ${uploadError.message}`);
    }

    // Get public URL for PDF certificate
    const { data: publicUrlRes } = supabase.storage.from("certificates").getPublicUrl(pdfPath);
    const pdfUrl = publicUrlRes.publicUrl;

    // 4. Save certificate record in DB
    const { error: dbError } = await supabase
      .from("certificates")
      .insert({
        certificate_no: certNo,
        registration_id: registrationId,
        user_name: reg.full_name,
        course_name: courseTitle,
        pdf_url: pdfUrl,
        qr_code_url: qrCodeUrl,
        status: "VALID"
      });

    if (dbError) {
      console.error("Database insert error for certificate:", dbError);
      throw new Error(`Failed to save certificate record: ${dbError.message}`);
    }

    // 5. Transition course registration status to COMPLETED
    await supabase
      .from("course_registrations")
      .update({ status: "COMPLETED" })
      .eq("id", registrationId);

    // Log status transition
    await supabase.from("status_logs").insert({
      registration_id: registrationId,
      from_status: "APPROVED",
      to_status: "COMPLETED",
      remarks: `Official course certificate generated: ${certNo}. Enrollment marked completed.`,
      updated_by: user.id
    });

    // 6. Send Certificate Email to candidate
    const emailSubject = "Official Certificate Issued - DKFFJ Academy";
    const emailHtml = getCertificateIssuedTemplate(reg.full_name, courseTitle, certNo, verificationUrl);
    await sendTransactionalEmail(reg.email, emailSubject, emailHtml);

    return { success: true, certNo, pdfUrl };

  } catch (err: any) {
    console.error("Certificate generation error:", err);
    return { success: false, error: err.message || "An unexpected error occurred during certificate issue." };
  }
}
