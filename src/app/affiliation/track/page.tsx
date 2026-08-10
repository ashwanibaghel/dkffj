"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Download,
  FileText,
  Loader2,
  ExternalLink,
  MapPin
} from "lucide-react";
import { maskPAN, maskIDProof } from "@/lib/affiliation-utils";
import { downloadAffiliationAnnexureAction } from "@/app/admin/(dashboard)/affiliations/actions";

function TrackContent() {
  const searchParams = useSearchParams();
  const initialApp = searchParams.get("app") || "";
  const initialContact = searchParams.get("contact") || "";

  const [applicationNo, setApplicationNo] = useState(initialApp);
  const [contact, setContact] = useState(initialContact);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [result, setResult] = useState<any>(null);
  const [downloadingAnnexure, setDownloadingAnnexure] = useState(false);

  const fetchTrackingDetails = async (appNo: string, contactStr: string) => {
    if (!appNo.trim()) return;
    setLoading(true);
    setErrorMessage("");
    setResult(null);

    try {
      const res = await fetch(`/api/affiliation/track?app=${encodeURIComponent(appNo.trim())}&contact=${encodeURIComponent(contactStr.trim())}`);
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (_) {
        data = { error: "Server returned a non-JSON response. Please try again." };
      }

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "No record found matching the provided application number and contact.");
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to fetch tracking details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialApp) {
      fetchTrackingDetails(initialApp, initialContact);
    }
  }, [initialApp, initialContact]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationNo.trim()) {
      setErrorMessage("Please enter an Application Number.");
      return;
    }
    fetchTrackingDetails(applicationNo, contact);
  };

  return (
    <div className="space-y-8">
      {/* Search Input Box */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl max-w-xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Application Number *</label>
            <input
              type="text"
              value={applicationNo}
              onChange={(e) => setApplicationNo(e.target.value.toUpperCase())}
              placeholder="e.g. AFF-2026-000001"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono uppercase font-bold focus:ring-2 focus:ring-[#001C55] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email / Mobile *</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Enter registered email or mobile number"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#001C55] focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#001C55] hover:bg-[#001C55]/90 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Searching Application..." : "Track Application"}
          </button>
        </form>

        {errorMessage && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Tracking Result Card */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl max-w-3xl mx-auto space-y-8 animate-scaleUp">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Application Number</span>
              <h2 className="text-xl sm:text-2xl font-black font-mono text-[#001C55]">{result.applicationNo}</h2>
              <p className="text-xs text-slate-600 mt-0.5">Submitted on: {result.createdAt}</p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase inline-flex items-center gap-1.5 ${
                  result.status === "APPROVED"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : result.status === "REJECTED"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : result.status === "UNDER_REVIEW"
                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                    : result.status === "INSPECTION_PENDING"
                    ? "bg-purple-100 text-purple-800 border border-purple-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                {result.status === "APPROVED" && <CheckCircle className="w-3.5 h-3.5" />}
                {result.status === "REJECTED" && <XCircle className="w-3.5 h-3.5" />}
                {result.status !== "APPROVED" && result.status !== "REJECTED" && <Clock className="w-3.5 h-3.5" />}
                Status: {result.status.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Institute Info</span>
              <strong className="text-sm font-bold text-slate-900 block">{result.organizationName}</strong>
              <p className="text-slate-600">{result.organizationType}</p>
              <div className="flex items-center gap-1 text-slate-500 text-[11px] pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{result.district}, {result.state}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant Info</span>
              <strong className="text-sm font-bold text-slate-900 block">{result.applicantName}</strong>
              <p className="text-slate-600">{result.designation}</p>
              {result.affiliationNo && (
                <div className="pt-1 text-[#001C55] font-mono font-bold">
                  Affiliation No: {result.affiliationNo}
                </div>
              )}
            </div>
          </div>

          {/* Payment & Refund Ledger Card */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Payment & Refund Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                result.payment?.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                result.payment?.status === "REFUNDED" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
                result.payment?.status === "REFUND_INITIATED" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                "bg-amber-500/20 text-amber-300 border-amber-500/30"
              }`}>
                ● {result.payment?.status || "PENDING"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 block">Fee Amount</span>
                <strong className="text-white text-sm font-mono">₹{result.payment?.amount || 2100}</strong>
              </div>

              {result.payment?.status === "COMPLETED" && (
                <a
                  href={`/api/affiliation/receipt?orderId=${result.applicationNo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  Download E-Receipt PDF ↓
                </a>
              )}

              {result.status === "DRAFT" && (
                <Link
                  href={`/affiliation/payment?id=${result.applicationNo}`}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                >
                  Complete ₹2,100 Payment Now →
                </Link>
              )}
            </div>

            {/* Refund Info Notice for Rejected Applications */}
            {result.payment?.refundId && (
              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                  <span className="text-slate-300">Refund Ref ID: <strong className="text-amber-300 font-mono">{result.payment.refundId}</strong></span>
                  <span className="text-slate-400">{result.payment.refundedAt ? `Refunded: ${result.payment.refundedAt}` : "Refund Processing"}</span>
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  ℹ️ Refund has been initiated. The credit timeline depends on your bank/payment provider.
                </p>
              </div>
            )}
          </div>

          {/* Approved Affiliation Action Banner */}
          {result.status === "APPROVED" && (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">Affiliation Approved & Granted!</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Approved Programs: <strong>{result.approvedCourseCount || 0} of {result.requestedCourseCount || 0} Requested</strong> (Valid {result.validFrom} to {result.validTo})
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={async () => {
                      if (!result.id) return;
                      setDownloadingAnnexure(true);
                      const res = await downloadAffiliationAnnexureAction(result.id);
                      setDownloadingAnnexure(false);
                      if (res.pdfBase64) {
                        const link = document.createElement("a");
                        link.href = `data:application/pdf;base64,${res.pdfBase64}`;
                        link.download = res.fileName || "Annexure-A.pdf";
                        link.click();
                      }
                    }}
                    disabled={downloadingAnnexure}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    {downloadingAnnexure ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3 text-amber-400" />}
                    Download Annexure-A PDF
                  </button>
                  <Link
                    href={`/affiliation/verify/${result.verificationToken}`}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Public QR Record
                  </Link>
                </div>
              </div>

              {result.approvedCourses && result.approvedCourses.length > 0 && (
                <div className="pt-3 border-t border-emerald-200/80 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider block">
                    Authorized Courses List (Annexure-A Data)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {result.approvedCourses.map((ac: any) => (
                      <div key={ac.courseId} className="p-2 bg-white/80 border border-emerald-200 rounded-lg text-xs flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-2">
                          <strong className="text-slate-900 block truncate">{ac.title}</strong>
                          <span className="text-[10px] text-slate-500 block truncate">{ac.sector}</span>
                        </div>
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold shrink-0">
                          {ac.programType === "DIPLOMA" ? "Diploma" : "Cert."}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Remarks Box */}
          {result.publicRemarks && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-[#001C55]">
              <strong>Official Remarks:</strong> {result.publicRemarks}
            </div>
          )}

          {/* Timeline Audit Trail */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-bold text-slate-900">Application Processing Timeline</h3>

            <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {result.timeline?.map((log: any, idx: number) => (
                <div key={idx} className="flex items-start gap-4 relative">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 z-10">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 uppercase text-[11px]">{log.toStatus.replace("_", " ")}</span>
                      <span className="text-[10px] text-slate-400">{log.date}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{log.remarks}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AffiliationTrackPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#001C55]/10 to-[#C00000]/5 border border-slate-200 flex items-center justify-center">
              <img src="/logo.png" className="w-7 h-7 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#001C55] font-bold text-xs tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[8px] text-[#C00000] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
            </div>
          </Link>
          <Link href="/affiliation/apply" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#001C55] hover:text-[#001C55]/80 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Application Form
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#001C55] text-xs font-bold uppercase tracking-wider mb-3">
            <Search className="w-3.5 h-3.5 text-[#001C55]" /> Live Tracking Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#001C55]">
            Track Institute Affiliation Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Track real-time approval status, review timeline, and view public verification certificates upon approval.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-xs text-slate-400 py-10">Loading tracking portal...</div>}>
          <TrackContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-auto">
        <p>&copy; {new Date().getFullYear()} DK Foundation of Freedom and Justice. Official Registry Portal.</p>
      </footer>
    </div>
  );
}
