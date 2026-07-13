"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Award, Download, ShieldCheck, ShieldAlert } from "lucide-react";
import { getCertificateVerificationDetails } from "../actions";

function CertificateTrackContent() {
  const searchParams = useSearchParams();
  const [certNo, setCertNo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setCertNo(id);
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNo.trim()) {
      setErrorMsg("Please enter a Certificate Number.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSearched(true);
    try {
      const res = await getCertificateVerificationDetails(certNo);
      setResult(res);
      if (res && !res.found) {
        setErrorMsg("No active certificate found matching this certificate number.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#e8f4fd] text-slate-900 flex flex-col font-sans relative">
      <header className="border-b border-sky-100 bg-white/95 backdrop-blur-md z-50 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/track" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1565C0]/10 to-[#1565C0]/5 border border-sky-100 flex items-center justify-center">
              <img src="/logo.png" className="w-7 h-7 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#1565C0] font-bold text-xs tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[8px] text-[#001C55] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
            </div>
          </Link>
          <Link href="/track" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1565C0] hover:text-[#0D47A1] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 z-10">
        <div className="text-center mb-10">
          <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 uppercase">
            Public Certificate Verification
          </span>
          <h1 className="text-3xl font-extrabold font-serif text-[#001C55] mt-4">Verify Certificate</h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Verify the authenticity of a graduation or completion certificate issued by DK Foundation of Freedom & Justice.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-xl shadow-sky-500/5 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={certNo}
                onChange={(e) => setCertNo(e.target.value)}
                placeholder="Enter Certificate Number (e.g. DKC-2026-... or DKM-...)"
                className="w-full px-4 py-3.5 rounded-xl border border-sky-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] transition-all bg-slate-50/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-3.5 px-6 rounded-xl bg-[#1565C0] hover:bg-[#0D47A1] text-white text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-sky-600/10 shrink-0 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Verify
            </button>
          </form>
          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 p-3 mt-3 rounded-xl font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {!loading && searched && result && result.found && (
          <div className="bg-white border border-emerald-100 rounded-3xl overflow-hidden shadow-xl shadow-emerald-500/5 text-left">
            <div className="bg-emerald-50/50 px-6 py-5 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold uppercase text-[10px] tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Authenticity Verified
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                {result.status}
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-semibold text-slate-700">
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Certificate Number</span>
                  <span className="text-slate-900 mt-1 block font-mono font-bold text-sm">{result.certificate_no}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Recipient Name</span>
                  <span className="text-slate-900 mt-1 block text-sm font-bold font-serif">{result.user_name}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Course / Certification</span>
                  <span className="text-[#1565C0] mt-1 block text-sm font-extrabold uppercase">{result.course_name}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Date of Issue</span>
                  <span className="text-slate-800 mt-1 block">{result.issue_date}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Duration</span>
                  <span className="text-slate-800 mt-1 block">
                    {result.duration_from} to {result.duration_to}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Grade & Performance</span>
                  <span className="text-slate-800 mt-1 block">
                    {result.grade} ({result.performance})
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Venue / Location</span>
                  <span className="text-slate-850 mt-1 block">{result.venue}</span>
                </div>
              </div>

              {/* Secure message banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-[10px] leading-relaxed flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-700">Official Record Verified:</span>
                  <p className="mt-0.5">
                    This certificate is official, valid, and authenticated directly from the central database of DK Foundation of Freedom & Justice.
                  </p>
                </div>
              </div>

              {result.pdf_url && (
                <a
                  href={result.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Authenticated Certificate (PDF)
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CertificateVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
      </div>
    }>
      <CertificateTrackContent />
    </Suspense>
  );
}
