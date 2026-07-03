"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Award, Download } from "lucide-react";
import { getSecureCourseDetails, TrackingResult } from "../actions";

function CourseTrackContent() {
  const searchParams = useSearchParams();
  const [enrollmentNo, setEnrollmentNo] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setEnrollmentNo(id);
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentNo.trim() || !email.trim()) {
      setErrorMsg("Please enter both Enrollment Number and registered Email.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSearched(true);
    try {
      const res = await getSecureCourseDetails(enrollmentNo, email);
      setResult(res);
      if (res && !res.found) {
        setErrorMsg("Enrollment record not found or email address does not match.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong while fetching details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (["APPROVED", "COMPLETED", "VALID"].includes(s)) return "bg-emerald-50 text-emerald-755 border-emerald-200";
    if (["PENDING", "SUBMITTED"].includes(s)) return "bg-amber-50 text-amber-755 border-amber-200";
    return "bg-rose-50 text-rose-755 border-rose-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#e8f4fd] text-slate-900 flex flex-col font-sans relative">
      <header className="border-b border-sky-100 bg-white/80 backdrop-blur-md z-10 sticky top-0">
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
          <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest text-[#1565C0] bg-sky-50 border border-sky-100 uppercase">
            Academy Course Tracking
          </span>
          <h1 className="text-3xl font-extrabold font-serif text-[#001C55] mt-4">Track Course Status</h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Enter your Enrollment ID (DKE-...) and registered email address to securely track your admission and certificate status.
          </p>
        </div>

        {/* Secure Form */}
        <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-xl shadow-sky-500/5 mb-8">
          <form onSubmit={handleSearch} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Course Enrollment ID
              </label>
              <input
                type="text"
                value={enrollmentNo}
                onChange={(e) => setEnrollmentNo(e.target.value)}
                placeholder="e.g., DKE-2026-00001"
                className="w-full px-4 py-3 rounded-xl border border-sky-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] transition-all bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Registered Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., student@example.com"
                className="w-full px-4 py-3 rounded-xl border border-sky-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] transition-all bg-slate-50/50"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 p-3.5 rounded-xl font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#1565C0] hover:bg-[#0D47A1] text-white text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-sky-600/10 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Fetching Enrollment...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Track Course
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {!loading && searched && result && result.found && (
          <div className="space-y-6">
            <div className="bg-white border border-sky-100 rounded-3xl overflow-hidden shadow-xl shadow-sky-500/5">
              <div className="bg-slate-50/50 px-6 py-5 border-b border-sky-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#1565C0] uppercase tracking-wider">
                    Enrollment Verified
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 mt-0.5">{result.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ID: <span className="font-semibold text-slate-700">{result.number}</span> | Enrolled on {result.date}
                  </p>
                </div>
                <div className="self-start sm:self-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(result.status)}`}>
                    {result.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Details Section */}
                {result.details && (
                  <div className="mb-8 p-5 rounded-2xl bg-sky-50/20 border border-sky-100 text-left text-xs text-slate-700">
                    <span className="font-bold text-slate-850 block mb-1">Official Remarks / Updates</span>
                    <p className="leading-relaxed font-medium">{result.details}</p>
                  </div>
                )}

                {/* Certificate Download Card */}
                {result.certificate ? (
                  <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Certificate Issued
                        </span>
                        <h4 className="font-bold text-slate-850 text-sm mt-2 font-serif">Certificate: {result.certificate.certificate_no}</h4>
                        <p className="text-slate-500 text-[11px] mt-0.5">Your official course completion certificate is ready for download.</p>
                      </div>
                    </div>
                    <a
                      href={result.certificate.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg shrink-0 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download Certificate
                    </a>
                  </div>
                ) : (
                  <div className="mb-8 p-5 rounded-2xl bg-amber-50/50 border border-amber-100 text-left text-xs text-amber-800 flex items-start gap-2.5">
                    <Award className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-bold">Certificate Processing:</span>
                      <p className="mt-0.5 text-[11px] text-amber-700/95 leading-relaxed">
                        Your course certificate will be generated and available for download here upon successfully passing the course evaluation by academy admins.
                      </p>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6 text-left">Enrollment Timeline</h4>
                {result.timeline.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-50 text-sky-850 border border-sky-100 text-xs text-left">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Admission registered. Payment and document verification is in progress.</span>
                  </div>
                ) : (
                  <div className="relative pl-6 border-l-2 border-sky-100 space-y-8 ml-3 text-left">
                    {result.timeline.map((log) => (
                      <div key={log.id} className="relative">
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#1565C0] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#1565C0]"></div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              Status changed to <span className="text-[#1565C0] font-extrabold">{log.toStatus}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{log.date}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1.5 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                            &ldquo;{log.remarks}&rdquo;
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CourseTrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
      </div>
    }>
      <CourseTrackContent />
    </Suspense>
  );
}
