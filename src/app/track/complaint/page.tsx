"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowLeft, Loader2, CheckCircle2, AlertCircle, ShieldAlert, FileText, ClipboardList } from "lucide-react";
import { getSecureComplaintDetails, TrackingResult } from "../actions";

const parseDetails = (text: string) => {
  if (!text) return null;
  try {
    if (text.startsWith("{")) {
      return JSON.parse(text);
    }
  } catch (e) {
    // ignore
  }
  return null;
};

function ComplaintTrackContent() {
  const searchParams = useSearchParams();
  const [complaintNo, setComplaintNo] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setComplaintNo(id);
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintNo.trim() || !contact.trim()) {
      setErrorMsg("Please enter both Complaint Number and registered Contact.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSearched(true);
    try {
      const res = await getSecureComplaintDetails(complaintNo, contact);
      setResult(res);
      if (res && !res.found) {
        setErrorMsg("Complaint record not found or contact details do not match.");
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
    if (["RESOLVED", "CLOSED"].includes(s)) return "bg-emerald-50 text-emerald-750 border-emerald-200";
    if (["SUBMITTED", "PENDING"].includes(s)) return "bg-amber-50 text-amber-750 border-amber-200";
    if (["UNDER_INVESTIGATION", "UNDER_REVIEW", "IN_PROGRESS"].includes(s)) return "bg-sky-50 text-sky-750 border-sky-200";
    return "bg-rose-50 text-rose-750 border-rose-200";
  };

  const getPublicTimelineStatus = (toStatus: string) => {
    const s = toStatus.toUpperCase();
    if (["SUBMITTED", "PENDING"].includes(s)) return "Grievance Filed & Submitted";
    if (["UNDER_REVIEW", "UNDER_INVESTIGATION", "IN_PROGRESS"].includes(s)) return "Under Official Investigation & Review";
    if (["RESOLVED", "CLOSED"].includes(s)) return "Grievance Successfully Resolved";
    return `Status: ${toStatus}`;
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
          <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest text-[#1565C0] bg-sky-50 border border-sky-100 uppercase">
            Grievance Tracking Module
          </span>
          <h1 className="text-3xl font-extrabold font-serif text-[#001C55] mt-4">Track Complaint</h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Enter your Grievance Docket Number (DKC-...) and registered contact details to securely monitor complaint resolution.
          </p>
        </div>

        {/* Secure Form */}
        <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-xl shadow-sky-500/5 mb-8">
          <form onSubmit={handleSearch} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Grievance Docket Number
              </label>
              <input
                type="text"
                value={complaintNo}
                onChange={(e) => setComplaintNo(e.target.value)}
                placeholder="e.g., DKC-2026-00001"
                className="w-full px-4 py-3 rounded-xl border border-sky-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#1565C0]/20 focus:border-[#1565C0] transition-all bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Registered Contact (Mobile / Email)
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g., 9876543210 or grievant@example.com"
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
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Records...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Verify Grievance
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
                    Grievance Verified
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 mt-0.5">{result.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Docket ID: <span className="font-semibold text-slate-700">{result.number}</span> | Filed on {result.date}
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
                 {result.details && (() => {
                   const parsed = parseDetails(result.details);
                   if (parsed) {
                     return (
                       <div className="space-y-4 mb-8 text-left">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl">
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Incident Category</span>
                             <span className="text-xs font-bold text-rose-800">{parsed.incident_category}</span>
                           </div>
                           <div className="p-4 bg-sky-50/50 border border-sky-100 rounded-xl">
                             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Incident Date</span>
                             <span className="text-xs font-bold text-[#001C55]">{parsed.incident_date}</span>
                           </div>
                         </div>
                         <div className="p-5 rounded-2xl bg-sky-50/20 border border-sky-100 text-xs text-slate-700">
                           <span className="font-bold text-slate-800 block mb-1">Grievance Narrative / Description</span>
                           <p className="leading-relaxed font-medium whitespace-pre-line">{parsed.complaint_text}</p>
                         </div>
                       </div>
                     );
                   }
                   return (
                     <div className="mb-8 p-5 rounded-2xl bg-sky-50/20 border border-sky-100 text-left text-xs text-slate-700">
                       <span className="font-bold text-slate-850 block mb-1">Grievance Summary / Subject</span>
                       <p className="leading-relaxed font-medium whitespace-pre-line">{result.details}</p>
                     </div>
                   );
                 })()}

                {/* Secure message banner */}
                <div className="mb-8 p-4 rounded-xl bg-slate-50 border border-slate-100 text-left text-slate-500 text-[11px] leading-relaxed flex items-start gap-2.5">
                  <ClipboardList className="w-4 h-4 text-[#1565C0] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-700">Privacy Protection Enabled:</span>
                    <p className="mt-0.5 font-medium">
                      Detailed internal investigation logs and officer remarks are redacted from this public tracking desk to safeguard privacy. Contact the Investigation Cell using your Docket ID for any detailed case inquiries.
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6 text-left">Grievance Timeline</h4>
                {result.timeline.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-50 text-sky-850 border border-sky-100 text-xs text-left">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Grievance successfully submitted. Verification is under process.</span>
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
                              {getPublicTimelineStatus(log.toStatus)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{log.date}</span>
                          </div>
                          {/* Standard remarks only in public portal */}
                          <p className="text-xs text-slate-500 mt-1.5 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                            &ldquo;Our executive team has updated this docket to {log.toStatus}.&rdquo;
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

export default function ComplaintTrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
      </div>
    }>
      <ComplaintTrackContent />
    </Suspense>
  );
}
