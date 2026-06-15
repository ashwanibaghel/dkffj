"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export interface CertificateDetails {
  found: boolean;
  certificateNo: string;
  userName: string;
  courseName: string;
  issueDate: string;
  status: string;
  pdfUrl: string;
  qrCodeUrl: string;
  fatherName?: string;
  enrollmentNo?: string;
  photoUrl?: string | null;
  durationFrom?: string;
  durationTo?: string;
  grade?: string;
  venue?: string;
  performance?: string;
}

export async function verifyCertificate(certificateNo: string): Promise<CertificateDetails | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const searchStr = certificateNo.trim();

  if (!searchStr) return null;

  // Fetch certificate details including registration_id
  const { data: cert, error } = await supabase
    .from("certificates")
    .select("certificate_no, registration_id, user_name, course_name, issue_date, status, pdf_url, qr_code_url")
    .eq("certificate_no", searchStr)
    .maybeSingle();

  if (error) {
    console.error("Error verifying certificate:", error);
    return { found: false, certificateNo: searchStr, userName: "", courseName: "", issueDate: "", status: "", pdfUrl: "", qrCodeUrl: "" };
  }

  if (!cert) {
    return { found: false, certificateNo: searchStr, userName: "", courseName: "", issueDate: "", status: "", pdfUrl: "", qrCodeUrl: "" };
  }

  // Fetch student registration metadata using registration_id
  const { data: reg, error: regErr } = await supabase
    .from("course_registrations")
    .select(`
      id,
      enrollment_no,
      created_at,
      father_name,
      photo_url,
      courses (
        duration
      )
    `)
    .eq("id", cert.registration_id)
    .maybeSingle();

  let fatherName = "N/A";
  let enrollmentNo = "";
  let photoUrl = null;
  let fromDateStr = new Date(cert.issue_date).toLocaleDateString("en-IN");
  let toDateStr = new Date(cert.issue_date).toLocaleDateString("en-IN");

  if (reg) {
    fatherName = reg.father_name || "N/A";
    enrollmentNo = reg.enrollment_no || "";
    photoUrl = reg.photo_url;

    // Calculate course duration
    const createdDate = new Date(reg.created_at);
    fromDateStr = createdDate.toLocaleDateString("en-IN");

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
    toDateStr = endDate.toLocaleDateString("en-IN");
  }

  return {
    found: true,
    certificateNo: cert.certificate_no,
    userName: cert.user_name,
    courseName: cert.course_name,
    issueDate: new Date(cert.issue_date).toLocaleDateString("en-IN"),
    status: cert.status,
    pdfUrl: cert.pdf_url,
    qrCodeUrl: cert.qr_code_url,
    fatherName,
    enrollmentNo,
    photoUrl,
    durationFrom: fromDateStr,
    durationTo: toDateStr,
    grade: "A",
    venue: "Online (DKFFJ Portal)",
    performance: "Excellent"
  };
}
