"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Clock, ShieldAlert, Award } from "lucide-react";
import { getTrackingDetails, TrackingResult } from "./actions";

function TrackPageContent() {
  const searchParams = useSearchParams();
  const [trackingType, setTrackingType] = useState<string>("membership");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    if (type && ["membership", "complaint", "enrollment"].includes(type)) {
      setTrackingType(type);
    }
    if (id) {
      setTrackingNumber(id);
      handleSearch(type || "membership", id);
    }
  }, [searchParams]);

  const handleSearch = async (type: string, number: string) => {
    if (!number.trim()) {
      setErrorMsg("Please enter a valid tracking number.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSearched(true);
    try {
      const res = await getTrackingDetails(type, number);
      setResult(res);
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong while fetching details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(trackingType, trackingNumber);
  };

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (["APPROVED", "RESOLVED", "COMPLETED", "VALID"].includes(s)) {
      return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
    }
    if (["PENDING", "SUBMITTED"].includes(s)) {
      return "bg-amber-500/10 text-amber-700 border-amber-500/20";
    }
    if (["UNDER_REVIEW", "UNDER_INVESTIGATION", "IN_PROGRESS"].includes(s)) {
      return "bg-sky-500/10 text-sky-700 border-sky-500/20";
    }
    if (["REJECTED", "CLOSED", "REVOKED"].includes(s)) {
      return "bg-rose-500/10 text-rose-700 border-rose-500/20";
    }
    return "bg-slate-500/10 text-slate-700 border-slate-500/20";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Radial mesh background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#0F4C81]/[0.02] blur-[100px]"></div>
      </div>

      <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-md z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0F4C81]/10 to-[#D62828]/5 border border-slate-200 flex items-center justify-center">
              <img src="/logo.png" className="w-7 h-7 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#0F4C81] font-bold text-xs tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[8px] text-[#D62828] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F4C81] hover:text-[#0F4C81]/80 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold font-serif text-[#0F4C81]">Track Application Status</h1>
          <p className="text-slate-500 text-sm mt-2">Enter your Acknowledgement, Docket, or Enrollment number to get real-time tracking details.</p>
        </div>

        {/* Search Panel Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm mb-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tracking Module</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTrackingType("membership")}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-semibold tracking-wide transition-all ${
                    trackingType === "membership"
                      ? "bg-[#0F4C81] text-white border-[#0F4C81] shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Membership
                </button>
                <button
                  type="button"
                  onClick={() => setTrackingType("complaint")}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-semibold tracking-wide transition-all ${
                    trackingType === "complaint"
                      ? "bg-[#0F4C81] text-white border-[#0F4C81] shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Complaint (Grievance)
                </button>
                <button
                  type="button"
                  onClick={() => setTrackingType("enrollment")}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-semibold tracking-wide transition-all ${
                    trackingType === "enrollment"
                      ? "bg-[#0F4C81] text-white border-[#0F4C81] shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Academy Course
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {trackingType === "membership" && "Acknowledgement / Membership No."}
                {trackingType === "complaint" && "Grievance Docket No. (DKC-...)"}
                {trackingType === "enrollment" && "Course Enrollment No. (DKE-...)"}
              </label>
              <div className="relative flex rounded-lg shadow-sm">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder={
                    trackingType === "membership" ? "e.g., ACK-2026-00001 or DKM-..." :
                    trackingType === "complaint" ? "e.g., DKC-2026-00001" : "e.g., DKE-2026-00001"
                  }
                  className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/20 focus:border-[#0F4C81] transition-all bg-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1 top-1 bottom-1 px-4 rounded-md bg-[#0F4C81] text-white hover:bg-[#0c3c66] flex items-center justify-center disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
              {errorMsg && <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errorMsg}</p>}
            </div>
          </form>
        </div>

        {/* Results Desk */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F4C81] mx-auto mb-3" />
            <p className="text-sm text-slate-500">Searching records, please wait...</p>
          </div>
        )}

        {!loading && searched && result && (
          <div className="space-y-6">
            {result.found ? (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Header detail */}
                <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {result.type} Record Found
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-0.5">{result.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Ref ID: <span className="font-semibold text-slate-700">{result.number}</span> | Registered on {result.date}</p>
                  </div>
                  <div className="self-start md:self-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {result.details && (
                    <div className="mb-6 p-4 rounded-xl bg-slate-50 text-slate-600 border border-slate-200/50 text-xs leading-relaxed">
                      <span className="font-bold text-slate-700 block mb-1">Details:</span>
                      {result.details}
                    </div>
                  )}

                  {/* Timeline */}
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Status Log Timeline</h4>
                  {result.timeline.length === 0 ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-50 text-sky-800 border border-sky-100 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Record registered. Verification is under process. No timeline updates yet.</span>
                    </div>
                  ) : (
                    <div className="relative pl-6 border-l-2 border-slate-100 space-y-8 ml-3">
                      {result.timeline.map((log) => (
                        <div key={log.id} className="relative">
                          {/* Dot indicator */}
                          <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#0F4C81] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0F4C81]"></div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">
                                Status changed to <span className="text-[#0F4C81] font-extrabold">{log.toStatus}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">{log.date}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              &ldquo;{log.remarks}&rdquo;
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center">
                <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-rose-900">Record Not Found</h3>
                <p className="text-rose-700/80 text-sm mt-1 max-w-md mx-auto">
                  We could not find any active {trackingType} records matching &ldquo;{trackingNumber}&rdquo;. Please make sure you have entered the number correctly and selected the correct category above.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F4C81]" />
      </div>
    }>
      <TrackPageContent />
    </Suspense>
  );
}
