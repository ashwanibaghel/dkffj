"use server";

import prisma from "@/lib/prisma";

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
  const rawSearch = decodeURIComponent(certificateNo || "").trim();

  if (!rawSearch) return null;

  // Clean trailing slashes & normalize variations (e.g. /A/ vs /APP/ vs 00014)
  const cleanSearch = rawSearch.replace(/%2F/gi, "/").trim();
  const rawNum = cleanSearch.split("/").pop() || cleanSearch;
  const altApp = cleanSearch.replace("/A/", "/APP/");
  const altA = cleanSearch.replace("/APP/", "/A/");

  // Array of search variants to ensure 100% matching regardless of format
  const variants = Array.from(new Set([cleanSearch, altApp, altA, rawNum])).filter((s) => s.length > 0);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.dkffj.org";

  try {
    // 1. Search in `certificates` table
    const cert = await prisma.certificates.findFirst({
      where: {
        OR: variants.map((v) => ({
          certificate_no: { equals: v, mode: "insensitive" as const }
        }))
      }
    });

    if (cert) {
      // Fetch student registration metadata if available
      let fatherName = "N/A";
      let enrollmentNo = "";
      let photoUrl = null;
      let fromDateStr = cert.duration_from || new Date(cert.issue_date).toLocaleDateString("en-IN");
      let toDateStr = cert.duration_to || new Date(cert.issue_date).toLocaleDateString("en-IN");

      if (cert.registration_id) {
        const reg = await prisma.course_registrations.findUnique({
          where: { id: cert.registration_id },
          include: { courses: true }
        });

        if (reg) {
          fatherName = reg.father_name || "N/A";
          enrollmentNo = reg.enrollment_no || "";
          photoUrl = reg.photo_url;

          const createdDate = new Date(reg.created_at);
          fromDateStr = createdDate.toLocaleDateString("en-IN");
          const endDate = new Date(createdDate);
          const durationText = reg.courses?.duration || "";
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
      }

      const certNo = cert.certificate_no;
      const verificationUrl = `${appUrl}/verify/${encodeURIComponent(certNo)}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${encodeURIComponent(verificationUrl)}`;

      return {
        found: true,
        certType: "course",
        certificateNo: certNo,
        userName: cert.user_name,
        courseName: cert.course_name,
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

    // 2. Search in `appreciation_applications` table
    const appreciationApp = await prisma.appreciation_applications.findFirst({
      where: {
        OR: [
          ...variants.map((v) => ({ application_no: { equals: v, mode: "insensitive" as const } })),
          ...variants.map((v) => ({ application_no: { contains: v, mode: "insensitive" as const } })),
          { mobile: cleanSearch },
          { email: cleanSearch }
        ]
      }
    });

    if (appreciationApp) {
      const isApproved = appreciationApp.status === "APPROVED";
      const certNo = appreciationApp.application_no;
      const verificationUrl = `${appUrl}/verify/${encodeURIComponent(certNo)}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${encodeURIComponent(verificationUrl)}`;
      const issueDate = new Date(appreciationApp.created_at).toLocaleDateString("en-IN");

      return {
        found: true,
        certType: "membership",
        certificateNo: certNo,
        userName: appreciationApp.full_name,
        fatherName: appreciationApp.father_name || "N/A",
        courseName: `Certificate of Appreciation — ${appreciationApp.social_work_field}`,
        designation: "Honorable Social Advocate",
        workingArea: appreciationApp.social_work_field,
        photoUrl: appreciationApp.photo_url,
        issueDate,
        status: isApproved ? "VALID" : (appreciationApp.status === "PENDING" ? "VALID (UNDER REVIEW)" : appreciationApp.status),
        pdfUrl: "",
        qrCodeUrl
      };
    }

    // 3. Search in `memberships` table
    const member = await prisma.memberships.findFirst({
      where: {
        OR: [
          ...variants.map((v) => ({ membership_no: { equals: v, mode: "insensitive" as const } })),
          ...variants.map((v) => ({ ack_no: { equals: v, mode: "insensitive" as const } })),
          ...variants.map((v) => ({ membership_no: { contains: v, mode: "insensitive" as const } })),
          { mobile: cleanSearch },
          { aadhaar_no: cleanSearch },
          { full_name: { contains: cleanSearch, mode: "insensitive" as const } }
        ]
      }
    });

    if (member) {
      const isApproved = member.status === "APPROVED";
      const certNo = member.membership_no || member.ack_no || "";
      const verificationUrl = `${appUrl}/verify/${encodeURIComponent(certNo)}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${encodeURIComponent(verificationUrl)}`;
      
      const issueDate = member.approved_at 
        ? new Date(member.approved_at).toLocaleDateString("en-IN")
        : new Date(member.created_at).toLocaleDateString("en-IN");

      return {
        found: true,
        certType: "membership",
        certificateNo: certNo,
        ackNo: member.ack_no || "",
        userName: member.full_name,
        fatherName: member.father_name || "N/A",
        courseName: "Membership / Executive Council Certificate",
        designation: member.designation || "Executive Member",
        workingArea: member.working_area || member.district || member.state || "India",
        photoUrl: member.photo_url,
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
