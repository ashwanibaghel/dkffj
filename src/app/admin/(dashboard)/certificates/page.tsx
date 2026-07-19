"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { getCertificates, toggleCertificateStatus, getCertificateRegenerationData } from "./actions";
import { Award, Search, Loader2, Download, AlertTriangle, ShieldCheck, QrCode, Clock, FileCheck2 } from "lucide-react";
import { generateCertificatePDFClient } from "../registrations/CertificateGenerator";
import { createClient } from "@/utils/supabase/client";
import { AdminToast, useAdminFeedback } from "../components/AdminFeedback";

type CertificateRecord = {
  id: string;
  registration_id: string;
  certificate_no: string;
  user_name: string;
  course_name: string;
  issue_date: string;
  status: string;
  qr_code_url: string;
};

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const { toast, showToast } = useAdminFeedback();

  async function fetchData() {
    setLoading(true);
    try {
      const data = await getCertificates();
      setCertificates(data as CertificateRecord[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      void fetchData();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const statusFilters = ["ALL", "VALID", "REVOKED"];

  const statusCounts = useMemo(() => {
    return certificates.reduce(
      (acc, cert) => {
        acc.ALL += 1;
        acc[cert.status] = (acc[cert.status] || 0) + 1;
        return acc;
      },
      { ALL: 0 } as Record<string, number>
    );
  }, [certificates]);

  const filteredCerts = useMemo(() => {
    let result = certificates;
    if (statusFilter !== "ALL") {
      result = result.filter((cert) => cert.status === statusFilter);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (cert) =>
          cert.user_name.toLowerCase().includes(q) ||
          cert.certificate_no.toLowerCase().includes(q) ||
          cert.course_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [certificates, searchQuery, statusFilter]);

  const handleDownloadDynamic = async (cert: CertificateRecord) => {
    setDownloadLoading(cert.id);
    try {
      const metaRes = await getCertificateRegenerationData(cert.registration_id);
      if (!metaRes.success) {
        showToast(metaRes.error || "Failed to load certificate data.", "error");
        return;
      }

      const resultFiles = await generateCertificatePDFClient({
        certNo: cert.certificate_no,
        qrCodeUrl: cert.qr_code_url,
        verificationUrl: `${window.location.origin}/verify/${cert.certificate_no}`,
        studentName: metaRes.studentName!,
        courseTitle: metaRes.courseTitle!,
        photoUrl: metaRes.photoUrl,
        fatherName: metaRes.fatherName!,
        enrollmentNo: metaRes.enrollmentNo!,
        durationFrom: metaRes.durationFrom!,
        durationTo: metaRes.durationTo!,
        grade: metaRes.grade!,
        venue: metaRes.venue!,
        performance: metaRes.performance!,
        dateStr: metaRes.dateStr!
      });

      const pdfBlob = resultFiles.pdfBlob;

      // Sync/overwrite updated PDF in storage
      try {
        const supabase = createClient();
        const pdfPath = `certs/cert_${cert.certificate_no}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from("certificates")
          .upload(pdfPath, pdfBlob, { contentType: "application/pdf", upsert: true });
 
        if (uploadError) {
          console.error("Failed to sync regenerated certificate to cloud storage:", uploadError.message);
        }
      } catch (uploadErr) {
        console.error("Error uploading regenerated PDF:", uploadErr);
      }
 
      // Trigger local browser download
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Certificate_${cert.certificate_no}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast("Certificate PDF regenerated and downloaded.");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      showToast(`Error generating PDF: ${message}`, "error");
    } finally {
      setDownloadLoading(null);
    }
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    setToggleLoading(id);
    try {
      const res = await toggleCertificateStatus(id, currentStatus);
      if (res.success) {
        await fetchData(); // Refresh
        showToast("Certificate status updated.");
      } else {
        showToast(res.error || "Failed to update certificate status.", "error");
      }
    } catch {
      showToast("Error updating certificate status.", "error");
    } finally {
      setToggleLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    return status === "VALID"
      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20"
      : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/20";
  };

  return (
    <div className="space-y-6">
      <AdminToast toast={toast} />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Award className="w-5 h-5 text-[#001C55] dark:text-blue-400" /> Academy Certificates Registry
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Review generated academic credentials, manage QR-code validation pathways, and revoke certificates.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
          <Clock className="w-3.5 h-3.5" />
          <span>{filteredCerts.length} visible of {certificates.length} certificates</span>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statusFilters.map((status) => {
          const isActive = statusFilter === status;
          const label = status === "ALL" ? "All Certificates" : status;
          const count = statusCounts[status] || 0;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                isActive
                  ? "bg-[#001C55] text-white border-[#001C55] shadow-lg shadow-blue-950/10"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/40 hover:-translate-y-0.5"
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-[0.14em] ${isActive ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>
                {label}
              </span>
              <span className="block text-2xl font-black mt-2 tracking-tight">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm dark:shadow-none">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                statusFilter === status
                  ? "bg-[#001C55] text-white border-[#001C55]"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {status === "ALL" ? "All Records" : status}
            </button>
          ))}
        </div>
        
        {/* Search */}
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search by student, course, certificate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 font-semibold"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
        </div>
      </div>

      {/* Registry */}
      {loading ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#001C55] mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading certificate registry...</p>
        </div>
      ) : filteredCerts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-500 dark:text-slate-400">No certificate records found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
          <div className="hidden lg:grid grid-cols-[minmax(280px,1.35fr)_minmax(230px,1fr)_130px_120px_210px] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 sticky top-0 z-10">
            <span>Certificate</span>
            <span>Course</span>
            <span>Issued</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredCerts.map((cert) => (
              <div
                key={cert.id}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(280px,1.35fr)_minmax(230px,1fr)_130px_120px_210px] gap-4 px-4 py-4 lg:px-5 lg:py-3 items-center hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                    {cert.qr_code_url ? (
                      <Image src={cert.qr_code_url} alt="Verification QR" width={48} height={48} className="h-full w-full object-contain" unoptimized />
                    ) : (
                      <QrCode className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide block truncate">{cert.certificate_no}</span>
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm truncate">{cert.user_name}</h3>
                  </div>
                </div>

                <div className="min-w-0 text-xs">
                  <span className="lg:hidden text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Course</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{cert.course_name}</span>
                </div>

                <div className="text-xs">
                  <span className="lg:hidden text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Issued</span>
                  <span className="text-slate-600 dark:text-slate-300 font-semibold">{new Date(cert.issue_date).toLocaleDateString("en-IN")}</span>
                </div>

                <div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(cert.status)}`}>
                    <FileCheck2 className="w-3 h-3" />
                    {cert.status}
                  </span>
                </div>

                <div className="flex flex-wrap justify-start lg:justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(cert.id, cert.status)}
                    disabled={toggleLoading === cert.id}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer disabled:opacity-60 ${
                      cert.status === "VALID"
                        ? "border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-300"
                        : "border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    }`}
                  >
                    {toggleLoading === cert.id ? (
                      <Loader2 className="w-3 animate-spin" />
                    ) : cert.status === "VALID" ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" /> Revoke
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> Activate
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadDynamic(cert)}
                    disabled={downloadLoading === cert.id}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-60"
                  >
                    {downloadLoading === cert.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-[#001C55] dark:text-blue-400" />
                    )}
                    PDF copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
