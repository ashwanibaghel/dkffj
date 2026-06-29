"use client";

import React, { useState } from "react";
import Link from "next/link";
import { verifyCertificate, CertificateDetails } from "./actions";
import { ArrowLeft, Search, Loader2, CheckCircle, XCircle, AlertCircle, FileText, Download, Award } from "lucide-react";

export default function VerifySearchPage() {
  const [certNo, setCertNo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [result, setResult] = useState<CertificateDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNo.trim()) {
      setErrorMsg("Please enter a certificate number.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSearched(true);
    try {
      const res = await verifyCertificate(certNo);
      setResult(res);
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#001C55]/[0.02] blur-[100px]"></div>
      </div>

      <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-md z-10 sticky top-0">
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
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#001C55] hover:text-[#001C55]/80 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 z-10">
        <div className="text-center mb-10">
          <Award className="w-12 h-12 text-[#001C55] mx-auto mb-3" />
          <h1 className="text-3xl font-extrabold font-serif text-[#001C55]">Certificate Verification</h1>
          <p className="text-slate-500 text-sm mt-2">Verify the authenticity of educational certificates issued by the DKFFJ Academy.</p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Certificate Number *</label>
              <div className="relative flex rounded-lg shadow-sm">
                <input
                  type="text"
                  value={certNo}
                  onChange={(e) => setCertNo(e.target.value)}
                  placeholder="e.g. DKCERT-2026-00001"
                  required
                  className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/25 focus:border-[#001C55] transition-all bg-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1 top-1 bottom-1 px-4 rounded-md bg-[#001C55] text-white hover:bg-[#001236] flex items-center justify-center disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
              {errorMsg && <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errorMsg}</p>}
            </div>
          </form>
        </div>

        {/* Results output */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#001C55] mx-auto mb-3" />
            <p className="text-sm text-slate-500">Retrieving certificate registry data...</p>
          </div>
        )}

        {!loading && searched && result && (
          <div className="space-y-6 animate-fadeIn">
            {result.found ? (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Result header */}
                <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Verified authentic
                      </span>
                      <h3 className="text-lg font-bold text-slate-800 mt-2 font-serif">{result.userName}</h3>
                    </div>
                  </div>
                  <div className="self-start md:self-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      result.status === "VALID"
                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-700 border-rose-500/20"
                    }`}>
                      {result.status}
                    </span>
                  </div>
                </div>

                {/* Details list */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Course Title</span>
                      <span className="text-slate-800 font-bold mt-1 block">{result.courseName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Certificate Number</span>
                      <span className="text-slate-800 font-mono font-bold mt-1 block">{result.certificateNo}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Issue Date</span>
                      <span className="text-slate-800 font-bold mt-1 block">{result.issueDate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Status Details</span>
                      <span className="text-slate-800 font-bold mt-1 block">
                        {result.status === "VALID" ? "This certificate is active and in good standing." : "This certificate has been revoked."}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-5 mt-5 flex justify-end">
                    <a
                      href={result.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-lg bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-sm"
                    >
                      <Download className="w-4 h-4" /> Download Certificate
                    </a>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center">
                <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-rose-900">Verification Failed</h3>
                <p className="text-rose-700/80 text-sm mt-1 max-w-md mx-auto">
                  We could not find any active certificate matching &ldquo;{result.certificateNo}&rdquo; in our registry vault. Please make sure the number is typed correctly.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
