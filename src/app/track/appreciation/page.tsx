"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Award, Download } from "lucide-react";
import { getSecureAppreciationDetails, TrackingResult } from "../actions";
import { generateAppreciationPDFClient } from "../../admin/(dashboard)/appreciation/AppreciationCertificateGenerator";

function AppreciationTrackContent() {
  const searchParams = useSearchParams();
  const [appNo, setAppNo] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [downloadingCert, setDownloadingCert] = useState<boolean>(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setAppNo(id);
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appNo.trim() || !contact.trim()) {
      setErrorMsg("Please enter both Application Number and registered Contact (Email or Mobile).");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSearched(true);
    try {
      const res = await getSecureAppreciationDetails(appNo, contact);
      setResult(res);
      if (res && !res.found) {
        setErrorMsg("Record not found or contact details do not match.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong while fetching details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (app: any) => {
    setDownloadingCert(true);
    try {
      const appUrl = window.location.origin;
      const refNo = app.ack_no || result?.number;
      const verificationUrl = `${appUrl}/verify/${refNo}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;
      
      const issueDateStr = app.approved_at 
        ? new Date(app.approved_at).toLocaleDateString("en-IN")
        : (app.created_at ? new Date(app.created_at).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"));

      const pdfBlob = await generateAppreciationPDFClient({
        applicationNo: refNo || "",
        fullName: result?.name || "",
        socialWorkField: app.working_area || "",
        issueDateStr,
        qrCodeUrl,
        verificationUrl
      });

      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Appreciation_Certificate_${refNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert(`Error generating certificate: ${err.message || err}`);
    } finally {
      setDownloadingCert(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (["APPROVED", "VALID"].includes(s)) return "bg-emerald-50 text-emerald-755 border-emerald-200";
    if (["PENDING", "SUBMITTED"].includes(s)) return "bg-amber-50 text-amber-755 border-amber-200";
    if (["UNDER_REVIEW"].includes(s)) return "bg-blue-50 text-blue-755 border-blue-200";
    return "bg-rose-50 text-rose-755 border-rose-200";
  };

  return (
    <div className="space-y-6">
      {/* Search Box Card */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Application Reference Number *</label>
              <input
                type="text"
                placeholder="e.g. DKA-100234"
                value={appNo}
                onChange={(e) => setAppNo(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#001C55]/10"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Registered Email or Mobile *</label>
              <input
                type="text"
                placeholder="e.g. ramesh.gupta@gmail.com"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#001C55]/10"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#001C55] hover:bg-[#001236] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Track Status
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-xl flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result Display */}
      {searched && result?.found && result.memberDetails && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main info card */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm relative overflow-hidden">
            {/* Visual top bar based on status */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              result.status === "APPROVED" ? "bg-emerald-500" :
              result.status === "REJECTED" ? "bg-rose-500" :
              "bg-amber-500"
            }`} />

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 border overflow-hidden shrink-0 flex items-center justify-center">
                  {result.memberDetails.photo_url ? (
                    <img src={result.memberDetails.photo_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Award className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">{result.name}</h2>
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">Applicant Reference: {result.number}</p>
                </div>
              </div>

              <div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(result.status)}`}>
                  {result.status === "UNDER_REVIEW" ? "Awaiting Review" : result.status}
                </span>
              </div>
            </div>

            {/* Remarks / Review Notes */}
            {result.details && (
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed italic">
                <strong>Board Message:</strong> &ldquo;{result.details}&rdquo;
              </div>
            )}

            {/* Approved - Show download button */}
            {result.status === "APPROVED" && (
              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={downloadingCert}
                  onClick={() => handleDownloadCertificate(result.memberDetails)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {downloadingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download Appreciation Certificate
                </button>
              </div>
            )}
          </div>

          {/* Timeline Tracking */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-4">Application Lifecycle Timeline</h3>

            <div className="relative border-l border-slate-200 pl-5 ml-2.5 space-y-6">
              {result.timeline.map((log) => (
                <div key={log.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-700">
                        Status Transition: {log.fromStatus} &rarr; <span className="text-[#001C55]">{log.toStatus}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{log.remarks}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 font-semibold shrink-0">{log.date}</span>
                  </div>
                </div>
              ))}

              {/* Initial submit log entry */}
              <div className="relative">
                <div className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-slate-700">Application Submitted</div>
                    <p className="text-[11px] text-slate-500 mt-1">Application successfully filed in DKFFJ database.</p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold shrink-0">{result.date}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackAppreciationPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] right-[5%] w-[800px] h-[500px] rounded-full bg-[#001C55]/[0.015] blur-[120px]" />
      </div>

      <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#001C55]/10 to-[#C00000]/5 border border-slate-200 flex items-center justify-center">
              <img src="/logo.png" className="w-7 h-7 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#001C55] font-bold text-xs tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[8px] text-[#C00000] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#001C55] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 z-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#001C55]">Appreciation Application Tracker</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">Track the progress of your social appreciation application and download certificate.</p>
        </div>

        <Suspense fallback={
          <div className="p-20 text-center flex flex-col items-center justify-center gap-3 bg-white border rounded-2xl shadow-sm">
            <Loader2 className="w-8 h-8 text-[#001C55] animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Loading tracker tools...</span>
          </div>
        }>
          <AppreciationTrackContent />
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-450">
          &copy; {new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
