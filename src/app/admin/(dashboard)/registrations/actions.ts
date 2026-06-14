"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { sendTransactionalEmail } from "@/services/email/service";
import { getCertificateIssuedTemplate } from "@/services/email/templates";
import PDFDocument from "pdfkit";
import path from "path";

// 1. Fetch registrations list
export async function getRegistrations(statusFilter?: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("course_registrations")
    .select(`
      *,
      courses (
        title,
        duration
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

// 1b. Fetch student profile details (e.g. father's name from memberships)
export async function getStudentProfile(userId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("memberships")
    .select("father_name")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching student profile:", error);
    return null;
  }
  return data;
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

function generateCertificatePDF(
  fullName: string,
  fatherName: string,
  enrollmentNo: string,
  courseTitle: string,
  certNo: string,
  dateStr: string,
  durationFrom: string,
  durationTo: string,
  grade: string,
  venue: string,
  performance: string,
  verificationUrl: string,
  qrCodeUrl: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "portrait",
        margin: 0,
      });

      const buffers: Buffer[] = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const templatePath = path.join(process.cwd(), "public/images/certificate_template.jpg");

      const drawOverlay = (qrBuffer?: Buffer) => {
        // Draw template background
        doc.image(templatePath, 0, 0, { width: 595.28, height: 841.89 });

        // Draw QR code if available
        if (qrBuffer) {
          doc.image(qrBuffer, 462, 708, { width: 80, height: 80 });
        } else {
          doc.rect(462, 708, 80, 80).lineWidth(0.5).stroke("#cccccc");
        }

        // Student's Name (centered in the bubble)
        doc.fillColor("#0F4C81")
          .font("Times-Bold")
          .fontSize(14)
          .text(fullName, 230, 336, { width: 320, align: "center" });

        // Father's Name (centered in the bubble)
        doc.fillColor("#0F4C81")
          .font("Times-Bold")
          .fontSize(14)
          .text(fatherName, 180, 377, { width: 370, align: "center" });

        // Course Title (centered in the bubble)
        doc.fillColor("#0F4C81")
          .font("Times-Bold")
          .fontSize(12)
          .text(courseTitle, 265, 418, { width: 285, align: "center" });

        // Conducted by our institution
        doc.fillColor("#0F4C81")
          .font("Helvetica-Bold")
          .fontSize(11)
          .text("DK Foundation of Freedom and Justice", 230, 459, { width: 320, align: "center" });

        // Duration From and To
        doc.fillColor("#0F4C81")
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(durationFrom, 195, 499, { width: 165, align: "center" });

        doc.fillColor("#0F4C81")
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(durationTo, 395, 499, { width: 155, align: "center" });

        // Grade/Percentage
        doc.fillColor("#0F4C81")
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(grade, 165, 540, { width: 80, align: "center" });

        // Training Venue
        doc.fillColor("#0F4C81")
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(venue, 360, 540, { width: 190, align: "center" });

        // Performance
        doc.fillColor("#0F4C81")
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(performance, 405, 578, { width: 120, align: "left" });

        // Certificate No
        doc.fillColor("#0F4C81")
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(certNo, 145, 662, { width: 145, align: "center" });

        // Date of Issue
        doc.fillColor("#0F4C81")
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(dateStr, 390, 662, { width: 160, align: "center" });
      };

      // Fetch QR Code image in-memory with a timeout
      fetch(qrCodeUrl, { signal: AbortSignal.timeout(4000) })
        .then((res) => res.arrayBuffer())
        .then((ab) => {
          drawOverlay(Buffer.from(ab));
          doc.end();
        })
        .catch((err) => {
          console.error("QR code fetch failed, drawing PDF without QR:", err);
          drawOverlay();
          doc.end();
        });
    } catch (err) {
      reject(err);
    }
  });
}

// 3. Issue Course Certificate
export async function issueCertificateForRegistration(
  registrationId: string,
  certData: {
    fatherName: string;
    durationFrom: string;
    durationTo: string;
    grade: string;
    venue: string;
    performance: string;
  }
) {
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
      user_id,
      created_at,
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

  if (reg.status !== "APPROVED") {
    return { success: false, error: "Certificate can only be issued for APPROVED course registrations." };
  }

  const fatherName = certData.fatherName || "N/A";
  const courseTitle = (reg.courses as any)?.title || "Selected Course";
  const durationFrom = certData.durationFrom || new Date(reg.created_at).toLocaleDateString("en-IN");
  const durationTo = certData.durationTo || new Date(reg.created_at).toLocaleDateString("en-IN");
  const grade = certData.grade || "A";
  const venue = certData.venue || "Online (DKFFJ Portal)";
  const performance = certData.performance || "Excellent";

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

    // 3. Create a beautiful, verified PDF certificate file
    const dateStr = new Date().toLocaleDateString("en-IN");
    const pdfBuffer = await generateCertificatePDF(
      reg.full_name,
      fatherName,
      reg.enrollment_no || "",
      courseTitle,
      certNo,
      dateStr,
      durationFrom,
      durationTo,
      grade,
      venue,
      performance,
      verificationUrl,
      qrCodeUrl
    );
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
