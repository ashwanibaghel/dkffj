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
      ),
      certificates (
        certificate_no,
        issue_date,
        grade,
        performance,
        venue,
        pdf_url
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
  qrCodeUrl: string,
  photoUrl?: string | null
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

      const drawOverlay = (qrBuffer?: Buffer, photoBuffer?: Buffer) => {
        // Draw template background
        doc.image(templatePath, 0, 0, { width: 595.28, height: 841.89 });

        // 1. Mask the placeholder student photo area in the background template with rounded rectangle
        doc.fillColor("#ffffff").roundedRect(445, 130, 105, 135, 10).fill();

        // Draw photo if available (clipped to rounded rectangle)
        if (photoBuffer) {
          doc.save();
          doc.roundedRect(445, 130, 105, 135, 10).clip();
          doc.image(photoBuffer, 445, 130, { width: 105, height: 135 });
          doc.restore();
        }
        
        // Draw a clean neat border around the photo box
        doc.roundedRect(445, 130, 105, 135, 10).lineWidth(0.5).stroke("#cccccc");

        // 2. Mask the template's placeholder QR code (Y=618 to match template's actual position)
        doc.fillColor("#ffffff").rect(462, 618, 80, 80).fill();

        // Draw QR code if available
        if (qrBuffer) {
          doc.image(qrBuffer, 462, 618, { width: 80, height: 80 });
        }

        // Student's Name (centered in the bubble)
        doc.fillColor("#001C55")
          .font("Times-Bold")
          .fontSize(14)
          .text(fullName, 230, 295, { width: 320, align: "center" });

        // Father's Name (centered in the bubble)
        doc.fillColor("#001C55")
          .font("Times-Bold")
          .fontSize(14)
          .text(fatherName, 180, 336, { width: 370, align: "center" });

        // Course Title (centered in the bubble)
        doc.fillColor("#001C55")
          .font("Times-Bold")
          .fontSize(12)
          .text(courseTitle, 265, 377, { width: 285, align: "center" });

        // Conducted by our institution
        doc.fillColor("#001C55")
          .font("Helvetica-Bold")
          .fontSize(11)
          .text("DK Foundation of Freedom and Justice", 230, 418, { width: 320, align: "center" });

        // Duration From and To (Row 5 - Y = 438)
        doc.fillColor("#001C55")
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(durationFrom, 195, 438, { width: 165, align: "center" });

        doc.fillColor("#001C55")
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(durationTo, 395, 438, { width: 155, align: "center" });

        // Grade/Percentage (Row 6 - Y = 458)
        doc.fillColor("#001C55")
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(grade, 165, 458, { width: 80, align: "center" });

        // Training Venue (Row 6 - Y = 458)
        doc.fillColor("#001C55")
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(venue, 360, 458, { width: 190, align: "center" });

        // Performance (Row 7 - Y = 499)
        doc.fillColor("#001C55")
          .font("Helvetica-Bold")
          .fontSize(11)
          .text(performance, 405, 499, { width: 120, align: "center" });

        // Mask placeholders on the background template (Row 8 - Y = 537)
        doc.fillColor("#ffffff").rect(170, 533, 110, 15).fill();
        doc.fillColor("#ffffff").rect(420, 533, 110, 15).fill();

        // Certificate No (Row 8 - Y = 537)
        doc.fillColor("#001C55")
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(certNo, 170, 535, { width: 110, align: "left" });

        // Date of Issue (Row 8 - Y = 537)
        doc.fillColor("#001C55")
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(dateStr, 420, 535, { width: 110, align: "left" });
      };

      const fetchQr = fetch(qrCodeUrl, { signal: AbortSignal.timeout(4000) })
        .then((res) => res.arrayBuffer())
        .then((ab) => Buffer.from(ab))
        .catch((err) => {
          console.error("QR fetch failed:", err);
          return null;
        });

      const fetchPhoto = photoUrl
        ? fetch(photoUrl, { signal: AbortSignal.timeout(6000) })
            .then((res) => {
              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
              return res.arrayBuffer();
            })
            .then((ab) => Buffer.from(ab))
            .catch((err) => {
              console.error("Photo fetch failed:", err);
              return null;
            })
        : Promise.resolve(null);

      Promise.all([fetchQr, fetchPhoto])
        .then(([qrBuffer, photoBuffer]) => {
          drawOverlay(qrBuffer || undefined, photoBuffer || undefined);
          doc.end();
        })
        .catch((err) => {
          console.error("Promise.all inside pdf gen failed:", err);
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

  if (reg.status !== "APPROVED") {
    return { success: false, error: "Certificate can only be issued for APPROVED course registrations." };
  }

  const fatherName = certData.fatherName || reg.father_name || "N/A";
  const courseTitle = (reg.courses as any)?.title || "Selected Course";
  const durationFrom = certData.durationFrom || new Date(reg.created_at).toLocaleDateString("en-IN");
  const durationTo = certData.durationTo || new Date(reg.created_at).toLocaleDateString("en-IN");
  const grade = certData.grade || "A";
  const venue = certData.venue || "Online (DKFFJ Portal)";
  const performance = certData.performance || "Excellent";

  try {
    // 1. Generate Certificate Number based on enrollment suffix (for 100% consistency)
    const certNo = reg.enrollment_no
      ? reg.enrollment_no.replace("DKE", "DKCERT")
      : ("DKCERT-" + Math.random().toString(36).substring(2, 9).toUpperCase());

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/verify/${certNo}`;

    // 2. Generate QR Code API URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;

    // 3. Save certificate record in DB with temporary pdf_url (to be filled by client)
    const tempPdfUrl = "";

    // 4. Save certificate record in DB
    const { error: dbError } = await supabase
      .from("certificates")
      .insert({
        certificate_no: certNo,
        registration_id: registrationId,
        user_name: reg.full_name,
        course_name: courseTitle,
        pdf_url: tempPdfUrl,
        qr_code_url: qrCodeUrl,
        status: "VALID",
        grade,
        performance,
        venue,
        duration_from: durationFrom,
        duration_to: durationTo
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

    return {
      success: true,
      certNo,
      qrCodeUrl,
      verificationUrl,
      studentName: reg.full_name,
      courseTitle,
      photoUrl: reg.photo_url,
      fatherName,
      enrollmentNo: reg.enrollment_no || "",
      durationFrom,
      durationTo,
      grade,
      venue,
      performance,
      dateStr: new Date().toLocaleDateString("en-IN")
    };

  } catch (err: any) {
    console.error("Certificate generation error:", err);
    return { success: false, error: err.message || "An unexpected error occurred during certificate issue." };
  }
}

// 4. Update Certificate PDF URL after client-side generation
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
