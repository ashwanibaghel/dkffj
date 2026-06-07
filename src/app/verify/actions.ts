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
}

export async function verifyCertificate(certificateNo: string): Promise<CertificateDetails | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const searchStr = certificateNo.trim();

  if (!searchStr) return null;

  const { data: cert, error } = await supabase
    .from("certificates")
    .select("certificate_no, user_name, course_name, issue_date, status, pdf_url, qr_code_url")
    .eq("certificate_no", searchStr)
    .maybeSingle();

  if (error) {
    console.error("Error verifying certificate:", error);
    return { found: false, certificateNo: searchStr, userName: "", courseName: "", issueDate: "", status: "", pdfUrl: "", qrCodeUrl: "" };
  }

  if (!cert) {
    return { found: false, certificateNo: searchStr, userName: "", courseName: "", issueDate: "", status: "", pdfUrl: "", qrCodeUrl: "" };
  }

  return {
    found: true,
    certificateNo: cert.certificate_no,
    userName: cert.user_name,
    courseName: cert.course_name,
    issueDate: new Date(cert.issue_date).toLocaleDateString("en-IN"),
    status: cert.status,
    pdfUrl: cert.pdf_url,
    qrCodeUrl: cert.qr_code_url
  };
}
