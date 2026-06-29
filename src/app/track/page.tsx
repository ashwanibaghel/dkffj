"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Clock, ShieldAlert, Award, Download } from "lucide-react";
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

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold font-serif text-[#001C55]">Track Application Status</h1>
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
                      ? "bg-[#001C55] text-white border-[#001C55] shadow-sm"
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
                      ? "bg-[#001C55] text-white border-[#001C55] shadow-sm"
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
                      ? "bg-[#001C55] text-white border-[#001C55] shadow-sm"
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
                  className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/20 focus:border-[#001C55] transition-all bg-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1 top-1 bottom-1 px-4 rounded-md bg-[#001C55] text-white hover:bg-[#001236] flex items-center justify-center disabled:opacity-50 transition-colors"
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
            <Loader2 className="w-8 h-8 animate-spin text-[#001C55] mx-auto mb-3" />
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

                  {/* Membership Details Card */}
                  {result.type === "membership" && result.memberDetails && (
                    <div className="mb-8 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                      <div className="bg-[#001C55]/5 px-5 py-3.5 border-b border-slate-200/60 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#001C55] uppercase tracking-wider">Official Membership Card Details</span>
                        {result.status === "APPROVED" && (
                          <span className="text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                            Active ID Card
                          </span>
                        )}
                      </div>
                      <div className="p-5 flex flex-col md:flex-row gap-6">
                        {/* Profile Photo */}
                        <div className="flex flex-col items-center shrink-0">
                          <img
                            src={result.memberDetails.photo_url || "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=300"}
                            alt={result.name}
                            className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-sm"
                          />
                          <span className="text-[10px] text-slate-400 font-bold uppercase mt-2">Verified Photo</span>
                        </div>
                        
                        {/* Profile Details Grid */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 text-left">
                          <div>
                            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Full Name</span>
                            <span className="text-slate-900 mt-0.5 block">{result.name}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Father's Name</span>
                            <span className="text-slate-850 mt-0.5 block">{result.memberDetails.father_name}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">DOB & Gender</span>
                            <span className="text-slate-850 mt-0.5 block">{result.memberDetails.dob} ({result.memberDetails.gender})</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Designation / Role</span>
                            <span className="text-amber-800 font-extrabold mt-0.5 block uppercase tracking-wide">{result.memberDetails.designation || "Human Rights Officer"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Email & Mobile</span>
                            <span className="text-slate-850 mt-0.5 block">{result.memberDetails.email} / {result.memberDetails.mobile}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Working Area</span>
                            <span className="text-slate-850 mt-0.5 block">{result.memberDetails.working_area || "N/A"}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Official Address</span>
                            <span className="text-slate-850 mt-0.5 block leading-relaxed">{result.memberDetails.address}, {result.memberDetails.district}, {result.memberDetails.state} - {result.memberDetails.pincode}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Certificate Download Card */}
                  {result.certificate && (
                    <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Award className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="text-xs text-left">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Official Credential Generated
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm mt-2 font-serif">Certificate No: {result.certificate.certificate_no}</h4>
                          <p className="text-slate-500 text-[11px] mt-0.5">Your graduation certificate is available for download as a verified PDF.</p>
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
                          <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#001C55] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#001C55]"></div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">
                                Status changed to <span className="text-[#001C55] font-extrabold">{log.toStatus}</span>
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
        <Loader2 className="w-8 h-8 animate-spin text-[#001C55]" />
      </div>
    }>
      <TrackPageContent />
    </Suspense>
  );
}
