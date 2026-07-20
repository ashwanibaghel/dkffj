"use client";

import React, { useState } from "react";
import { Download, Award, ShieldCheck, Heart, GraduationCap, Loader2, CheckCircle2 } from "lucide-react";
import { generateMembershipPDFClient } from "../members/MembershipCertificateGenerator";
import { generateAppreciationPDFClient } from "../appreciation/AppreciationCertificateGenerator";
import { generateCertificatePDFClient } from "../registrations/CertificateGenerator";
import { generateDonationPDFClient } from "@/app/donate/DonationCertificateGenerator";

export default function AshwaniCertsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>("");

  const ashwaniData = {
    fullName: "Ashwani Baghel",
    fatherName: "Manoj Kumar",
    mobile: "+919027872803",
    email: "ashwanibaghel9027@gmail.com",
    address: "Village Garhi Bhakti, Firozabad, Uttar Pradesh",
    photoUrl: "https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/8338bd93-e303-47c4-a62a-3eec7ba79b83/photo_course_1784464640256.jpg",
    issueDateStr: new Date().toLocaleDateString("en-IN", { year: "numeric", month: "2-digit", day: "2-digit" })
  };

  const handleDownloadMembership = async () => {
    setDownloading("membership");
    setSuccessMsg("");
    try {
      const certNo = "DKM-2026-9027";
      const verificationUrl = `${window.location.origin}/verify/${certNo}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;

      const res = await generateMembershipPDFClient({
        membershipNo: certNo,
        ackNo: "DKE-MIG-9027",
        fullName: ashwaniData.fullName,
        fatherName: ashwaniData.fatherName,
        designation: "National RTI Coordinator",
        workingArea: "All India Operations",
        photoUrl: ashwaniData.photoUrl,
        issueDateStr: ashwaniData.issueDateStr,
        qrCodeUrl,
        verificationUrl
      });

      const url = window.URL.createObjectURL(res.pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Membership_Certificate_Ashwani_Baghel.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccessMsg("Membership Certificate downloaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Error generating Membership Certificate");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAppreciation = async () => {
    setDownloading("appreciation");
    setSuccessMsg("");
    try {
      const appNo = "DKA-2026-9027";
      const verificationUrl = `${window.location.origin}/verify/${appNo}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;

      const pdfBlob = await generateAppreciationPDFClient({
        applicationNo: appNo,
        fullName: ashwaniData.fullName,
        socialWorkField: "Human Rights & Right to Information (RTI) Advocacy",
        issueDateStr: ashwaniData.issueDateStr,
        qrCodeUrl,
        verificationUrl,
        fatherName: ashwaniData.fatherName,
        photoUrl: ashwaniData.photoUrl
      });

      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Appreciation_Certificate_Ashwani_Baghel.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccessMsg("Appreciation Certificate downloaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Error generating Appreciation Certificate");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadCourse = async () => {
    setDownloading("course");
    setSuccessMsg("");
    try {
      const certNo = "DKC-2026-00019";
      const verificationUrl = `${window.location.origin}/verify/${certNo}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;

      const res = await generateCertificatePDFClient({
        certNo,
        qrCodeUrl,
        verificationUrl,
        studentName: ashwaniData.fullName,
        courseTitle: "Diploma in Skill Development & Human Rights Studies",
        photoUrl: ashwaniData.photoUrl,
        fatherName: ashwaniData.fatherName,
        enrollmentNo: "DKE-2026-00019",
        durationFrom: "07/2025",
        durationTo: "06/2026",
        grade: "A+",
        venue: "DK Foundation Main Campus",
        performance: "Excellent",
        dateStr: "19/07/2026"
      });

      const url = window.URL.createObjectURL(res.pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Course_Diploma_Certificate_Ashwani_Baghel.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccessMsg("Course/Diploma Certificate downloaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Error generating Course/Diploma Certificate");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadDonation = async () => {
    setDownloading("donation");
    setSuccessMsg("");
    try {
      const orderId = "DKD-2026-9027";
      const verificationUrl = `${window.location.origin}/verify/${orderId}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;

      const pdfBlob = await generateDonationPDFClient({
        orderId,
        fullName: ashwaniData.fullName,
        amount: "5000",
        purpose: "Social Development & Child Welfare Fund",
        issueDateStr: ashwaniData.issueDateStr,
        qrCodeUrl,
        verificationUrl
      });

      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Donation_Certificate_Ashwani_Baghel.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccessMsg("Donation Receipt Certificate downloaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Error generating Donation Certificate");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-[#001C55] dark:text-blue-400" /> Certificate Template Previewer
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Generate and download all 4 certificate designs populated with your personal profile info.
        </p>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Membership Certificate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Membership Certificate</h3>
              <p className="text-[11px] text-slate-500 mt-1">Populated with National RTI Coordinator designation & active NGO seal.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadMembership}
            disabled={downloading !== null}
            className="mt-6 w-full bg-[#001C55] hover:bg-[#001236] text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {downloading === "membership" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Download PDF
          </button>
        </div>

        {/* 2. Appreciation Certificate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Certificate of Appreciation</h3>
              <p className="text-[11px] text-slate-500 mt-1">Given for dedicated social work in Human Rights & RTI advocacy.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadAppreciation}
            disabled={downloading !== null}
            className="mt-6 w-full bg-[#001C55] hover:bg-[#001236] text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {downloading === "appreciation" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Download PDF
          </button>
        </div>

        {/* 3. Course/Diploma Certificate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-100 dark:border-purple-500/20 text-purple-700 dark:text-purple-400 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Course Diploma Certificate</h3>
              <p className="text-[11px] text-slate-500 mt-1">Includes Diploma title, grade A+, student photo, and university-style marks.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadCourse}
            disabled={downloading !== null}
            className="mt-6 w-full bg-[#001C55] hover:bg-[#001236] text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {downloading === "course" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Download PDF
          </button>
        </div>

        {/* 4. Donation Certificate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Donation Certificate</h3>
              <p className="text-[11px] text-slate-500 mt-1">Official donation receipt honoring contribution of ₹5,000.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownloadDonation}
            disabled={downloading !== null}
            className="mt-6 w-full bg-[#001C55] hover:bg-[#001236] text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {downloading === "donation" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Download PDF
          </button>
        </div>

      </div>
    </div>
  );
}
