"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { cleanAmpText } from "@/lib/sanitize";
import { isRecognizedMembershipNumber, normalizeMembershipNumber, toLegacyMembershipNumber } from "@/lib/membershipNumber";
import { getPublicPhotoProxyUrl } from "@/lib/photoUtils";

export interface CertificateDetails {
  found: boolean;
  certType: "course" | "membership" | "appreciation";
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
  const rawSearch = decodeURIComponent(certificateNo || "").trim();

  if (!rawSearch) return null;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Clean trailing slashes & normalize variations (e.g. /A/ vs /APP/ vs /EXEC/ vs 00014)
  const cleanSearch = rawSearch.replace(/%2F/gi, "/").trim();
  const rawNum = cleanSearch.split("/").pop() || cleanSearch;
  const appUrl = "https://www.dkffj.org";
  const normalizedMembershipNo = normalizeMembershipNumber(cleanSearch);
  const isMembershipId = isRecognizedMembershipNumber(normalizedMembershipNo);

  try {
    // A QR code containing a permanent Member ID must never be allowed to
    // fall through to another registry table merely because the serial digits
    // happen to match an appreciation or course certificate.
    if (isMembershipId) {
      const membershipNumbers = normalizedMembershipNo.toUpperCase().startsWith("DKFFJ/M/")
        ? [...new Set([normalizedMembershipNo, toLegacyMembershipNumber(normalizedMembershipNo)])]
        : [cleanSearch];
      const { data: member } = await supabase
        .from("memberships")
        .select("*")
        .neq("status", "REJECTED")
        .in("membership_no", membershipNumbers)
        .maybeSingle();

      if (!member) {
        return {
          found: false,
          certType: "membership",
          certificateNo: normalizedMembershipNo,
          userName: "",
          courseName: "",
          issueDate: "",
          status: "",
          pdfUrl: "",
          qrCodeUrl: ""
        };
      }

      const certNo = normalizeMembershipNumber(member.membership_no);
      const verificationUrl = `${appUrl}/verify/${certNo}`.replace(/%2F/gi, "/").replace(/%3A/gi, ":");
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${verificationUrl}`;

      return {
        found: true,
        certType: "membership",
        certificateNo: certNo,
        ackNo: member.ack_no || "",
        userName: cleanAmpText(member.full_name),
        fatherName: cleanAmpText(member.father_name) || "N/A",
        courseName: "Membership / Executive Council Certificate",
        designation: cleanAmpText(member.designation) || "Executive Member",
        workingArea: cleanAmpText(member.working_area || member.district || member.state || "India"),
        photoUrl: getPublicPhotoProxyUrl(member.photo_url),
        issueDate: new Date(member.approved_at || member.created_at).toLocaleDateString("en-IN"),
        status: member.status === "APPROVED" ? "VALID" : member.status,
        pdfUrl: "",
        qrCodeUrl
      };
    }

    // 1. Search in `certificates` table (Course Certificates)
    const { data: cert } = await supabase
      .from("certificates")
      .select("*, course_registrations(*)")
      .or(`certificate_no.ilike.*${rawNum}*,certificate_no.ilike.*${cleanSearch}*`)
      .maybeSingle();

    if (cert) {
      let fatherName = "N/A";
      let enrollmentNo = "";
      let photoUrl = null;
      let fromDateStr = cert.duration_from || new Date(cert.issue_date).toLocaleDateString("en-IN");
      let toDateStr = cert.duration_to || new Date(cert.issue_date).toLocaleDateString("en-IN");

      const reg = cert.course_registrations;
      if (reg) {
        fatherName = cleanAmpText(reg.father_name) || "N/A";
        enrollmentNo = reg.enrollment_no || "";
        photoUrl = getPublicPhotoProxyUrl(reg.photo_url);
      }

      const certNo = cert.certificate_no;
      const verificationUrl = `${appUrl}/verify/${certNo}`.replace(/%2F/gi, "/").replace(/%3A/gi, ":");
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${verificationUrl}`;

      return {
        found: true,
        certType: "course",
        certificateNo: certNo,
        userName: cleanAmpText(cert.user_name),
        courseName: cleanAmpText(cert.course_name),
        issueDate: new Date(cert.issue_date).toLocaleDateString("en-IN"),
        status: cert.status,
        pdfUrl: cert.pdf_url || "",
        qrCodeUrl: cert.qr_code_url || qrCodeUrl,
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

    // 2. Search in `appreciation_applications` table (Appreciation Certificates) - Non-rejected records
    const { data: appreciationApp } = await supabase
      .from("appreciation_applications")
      .select("*")
      .neq("status", "REJECTED")
      .or(`application_no.ilike.*${rawNum}*,application_no.ilike.*${cleanSearch}*,mobile.eq.${cleanSearch},email.eq.${cleanSearch}`)
      .maybeSingle();

    if (appreciationApp) {
      const isApproved = appreciationApp.status === "APPROVED";
      const certNo = appreciationApp.application_no;
      const verificationUrl = `${appUrl}/verify/${certNo}`.replace(/%2F/gi, "/").replace(/%3A/gi, ":");
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${verificationUrl}`;
      const issueDate = new Date(appreciationApp.created_at).toLocaleDateString("en-IN");

      return {
        found: true,
        certType: "appreciation",
        certificateNo: certNo,
        userName: cleanAmpText(appreciationApp.full_name),
        fatherName: cleanAmpText(appreciationApp.father_name) || "N/A",
        courseName: `Certificate of Appreciation — ${cleanAmpText(appreciationApp.social_work_field)}`,
        designation: "Honorable Social Advocate",
        workingArea: cleanAmpText(appreciationApp.social_work_field),
        photoUrl: getPublicPhotoProxyUrl(appreciationApp.photo_url),
        issueDate,
        status: isApproved ? "VALID" : "VALID (UNDER REVIEW)",
        pdfUrl: "",
        qrCodeUrl
      };
    }

    // 3. Search in `memberships` table (Membership Certificates) - Non-rejected records
    const { data: member } = await supabase
      .from("memberships")
      .select("*")
      .neq("status", "REJECTED")
      .or(`membership_no.ilike.*${rawNum}*,ack_no.ilike.*${rawNum}*,membership_no.ilike.*${cleanSearch}*,ack_no.ilike.*${cleanSearch}*,mobile.eq.${cleanSearch},full_name.ilike.*${cleanSearch}*`)
      .maybeSingle();

    if (member) {
      const isApproved = member.status === "APPROVED";
      const certNo = normalizeMembershipNumber(member.membership_no) || member.ack_no || "";
      const verificationUrl = `${appUrl}/verify/${certNo}`.replace(/%2F/gi, "/").replace(/%3A/gi, ":");
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${verificationUrl}`;
      
      const issueDate = member.approved_at 
        ? new Date(member.approved_at).toLocaleDateString("en-IN")
        : new Date(member.created_at).toLocaleDateString("en-IN");

      return {
        found: true,
        certType: "membership",
        certificateNo: certNo,
        ackNo: member.ack_no || "",
        userName: cleanAmpText(member.full_name),
        fatherName: cleanAmpText(member.father_name) || "N/A",
        courseName: "Membership / Executive Council Certificate",
        designation: cleanAmpText(member.designation) || "Executive Member",
        workingArea: cleanAmpText(member.working_area || member.district || member.state || "India"),
        photoUrl: getPublicPhotoProxyUrl(member.photo_url),
        issueDate,
        status: isApproved ? "VALID" : member.status,
        pdfUrl: "",
        qrCodeUrl
      };
    }

  } catch (err) {
    console.error("Error verifying certificate:", err);
  }

  // Not found
  return {
    found: false,
    certType: "course",
    certificateNo: cleanSearch,
    userName: "",
    courseName: "",
    issueDate: "",
    status: "",
    pdfUrl: "",
    qrCodeUrl: ""
  };
}
