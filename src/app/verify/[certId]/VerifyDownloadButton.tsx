"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { generateCertificatePDFClient } from "@/app/admin/(dashboard)/registrations/CertificateGenerator";
import { generateMembershipPDFClient } from "@/app/admin/(dashboard)/members/MembershipCertificateGenerator";
import { CertificateDetails } from "../actions";

export default function VerifyDownloadButton({ cert }: { cert: CertificateDetails }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      let pdfBlob;
      if (cert.certType === "membership") {
        pdfBlob = await generateMembershipPDFClient({
          membershipNo: cert.certificateNo,
          ackNo: cert.ackNo || "",
          fullName: cert.userName,
          fatherName: cert.fatherName || "N/A",
          designation: cert.designation || "Member",
          workingArea: cert.workingArea || "Human Rights Officer",
          photoUrl: cert.photoUrl,
          issueDateStr: cert.issueDate,
          qrCodeUrl: cert.qrCodeUrl,
          verificationUrl: `${window.location.origin}/verify/${cert.certificateNo}`
        });
      } else {
        pdfBlob = await generateCertificatePDFClient({
          certNo: cert.certificateNo,
          qrCodeUrl: cert.qrCodeUrl,
          verificationUrl: `${window.location.origin}/verify/${cert.certificateNo}`,
          studentName: cert.userName,
          courseTitle: cert.courseName,
          photoUrl: cert.photoUrl,
          fatherName: cert.fatherName || "N/A",
          enrollmentNo: cert.enrollmentNo || "",
          durationFrom: cert.durationFrom || cert.issueDate,
          durationTo: cert.durationTo || cert.issueDate,
          grade: cert.grade || "A",
          venue: cert.venue || "Online (DKFFJ Portal)",
          performance: cert.performance || "Excellent",
          dateStr: cert.issueDate
        });
      }

      // Trigger local browser download
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = cert.certType === "membership"
        ? `Membership_Certificate_${cert.certificateNo}.pdf`
        : `Certificate_${cert.certificateNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Failed to generate PDF:", err);
      alert(`Error generating PDF: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full text-center py-3 rounded-xl bg-[#C00000] text-white hover:bg-[#990000] text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(192, 0, 0,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      Download Certified Copy (PDF)
    </button>
  );
}
