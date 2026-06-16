"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export interface CertificateDetails {
  found: boolean;
  certType: "course" | "membership";
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
  workingArea?: string;
  designation?: string;
  ackNo?: string;
}

export async function verifyCertificate(certificateNo: string): Promise<CertificateDetails | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const searchStr = certificateNo.trim();

  if (!searchStr) return null;

  // Fetch certificate details including registration_id
  const { data: cert, error } = await supabase
    .from("certificates")
    .select("certificate_no, registration_id, user_name, course_name, issue_date, status, pdf_url, qr_code_url, grade, performance, venue, duration_from, duration_to")
    .eq("certificate_no", searchStr)
    .maybeSingle();

  if (error) {
    console.error("Error verifying certificate:", error);
    return { found: false, certType: "course", certificateNo: searchStr, userName: "", courseName: "", issueDate: "", status: "", pdfUrl: "", qrCodeUrl: "" };
  }

  if (!cert) {
    // Attempt to search in memberships table
    const { data: member, error: memberErr } = await supabase
      .from("memberships")
      .select("membership_no, ack_no, full_name, father_name, designation, working_area, photo_url, status, approved_at, created_at")
      .or(`membership_no.eq.${searchStr},ack_no.eq.${searchStr}`)
      .maybeSingle();

    if (memberErr || !member) {
      return {
        found: false,
        certType: "course",
        certificateNo: searchStr,
        userName: "",
        courseName: "",
        issueDate: "",
        status: "",
        pdfUrl: "",
        qrCodeUrl: ""
      };
    }

    const isApproved = member.status === "APPROVED";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const certNo = member.membership_no || member.ack_no;
    const verificationUrl = `${appUrl}/verify/${certNo}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;
    
    const issueDate = member.approved_at 
      ? new Date(member.approved_at).toLocaleDateString("en-IN")
      : new Date(member.created_at).toLocaleDateString("en-IN");

    return {
      found: true,
      certType: "membership",
      certificateNo: certNo,
      ackNo: member.ack_no,
      userName: member.full_name,
      fatherName: member.father_name,
      courseName: "Membership / Certificate of Appreciation",
      designation: member.designation,
      workingArea: member.working_area,
      photoUrl: member.photo_url,
      issueDate,
      status: isApproved ? "VALID" : member.status,
      pdfUrl: "",
      qrCodeUrl
    };
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
  let fromDateStr = cert.duration_from || new Date(cert.issue_date).toLocaleDateString("en-IN");
  let toDateStr = cert.duration_to || new Date(cert.issue_date).toLocaleDateString("en-IN");

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
    certType: "course",
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
    grade: cert.grade || "A",
    venue: cert.venue || "Online (DKFFJ Portal)",
    performance: cert.performance || "Excellent"
  };
}

