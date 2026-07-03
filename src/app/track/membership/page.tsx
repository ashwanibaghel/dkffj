"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Award, Download, IdCard, ShieldAlert } from "lucide-react";
import { getSecureMembershipDetails, TrackingResult } from "../actions";
import { generateMembershipPDFClient } from "../../admin/(dashboard)/members/MembershipCertificateGenerator";
import { generateMembershipIdCardPDFClient } from "../../admin/(dashboard)/members/MembershipIdCardGenerator";

function MembershipTrackContent() {
  const searchParams = useSearchParams();
  const [ackNo, setAckNo] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [downloadingCert, setDownloadingCert] = useState<boolean>(false);
  const [downloadingIdCard, setDownloadingIdCard] = useState<boolean>(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setAckNo(id);
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ackNo.trim() || !contact.trim()) {
      setErrorMsg("Please enter both Acknowledgement Number and registered Contact.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSearched(true);
    try {
      const res = await getSecureMembershipDetails(ackNo, contact);
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

  const handleDownloadCertificate = async (member: any) => {
    setDownloadingCert(true);
    try {
      const appUrl = window.location.origin;
      const certNo = member.membership_no || member.ack_no || result?.number;
      const verificationUrl = `${appUrl}/verify/${certNo}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;
      
      const issueDateStr = member.approved_at 
        ? new Date(member.approved_at).toLocaleDateString("en-IN")
        : (member.created_at ? new Date(member.created_at).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"));

      const pdfBlob = await generateMembershipPDFClient({
        membershipNo: member.membership_no || certNo || "",
        ackNo: member.ack_no || certNo || "",
        fullName: result?.name || "",
        fatherName: member.father_name,
        designation: member.designation,
        workingArea: member.working_area,
        photoUrl: member.photo_url,
        issueDateStr,
        qrCodeUrl,
        verificationUrl
      });

      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Membership_Certificate_${certNo}.pdf`;
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

  const handleDownloadIdCard = async (member: any) => {
    setDownloadingIdCard(true);
    try {
      const appUrl = window.location.origin;
      const certNo = member.membership_no || member.ack_no || result?.number;
      const verificationUrl = `${appUrl}/verify/${certNo}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verificationUrl)}`;
      
      const issueDate = member.approved_at ? new Date(member.approved_at) : (member.created_at ? new Date(member.created_at) : new Date());
      const issueDateStr = issueDate.toLocaleDateString("en-IN");
      
      const validFromStr = issueDate.toISOString().split("T")[0];
      const validToDate = new Date(issueDate);
      validToDate.setFullYear(validToDate.getFullYear() + 1);
      validToDate.setDate(validToDate.getDate() - 1);
      const validToStr = validToDate.toISOString().split("T")[0];

      const pdfBlob = await generateMembershipIdCardPDFClient({
        membershipNo: member.membership_no || certNo || "",
        ackNo: member.ack_no || certNo || "",
        fullName: result?.name || "",
        fatherName: member.father_name,
        designation: member.designation,
        workingArea: member.working_area,
        photoUrl: member.photo_url,
        issueDateStr,
        validFromStr,
        validToStr,
        addressStr: member.address || "",
        districtStr: member.district || "",
        stateStr: member.state || "",
        pincodeStr: member.pincode || "",
        mobileStr: member.mobile || "",
        qrCodeUrl,
        verificationUrl
      });

      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Membership_ID_Card_${certNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert(`Error generating ID Card: ${err.message || err}`);
    } finally {
      setDownloadingIdCard(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (["APPROVED", "VALID"].includes(s)) return "bg-emerald-50 text-emerald-750 border-emerald-200";
    if (["PENDING", "SUBMITTED"].includes(s)) return "bg-amber-50 text-amber-750 border-amber-200";
    if (["UNDER_REVIEW", "IN_PROGRESS"].includes(s)) return "bg-sky-50 text-sky-750 border-sky-200";
    return "bg-rose-50 text-rose-750 border-rose-200";
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
            Membership Status Verification
          </span>
          <h1 className="text-3xl font-extrabold font-serif text-[#001C55] mt-4">Track Membership</h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Enter your application/membership ID and registered contact details to securely view status logs.
          </p>
        </div>

        {/* Secure Form */}
        <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-xl shadow-sky-500/5 mb-8">
          <form onSubmit={handleSearch} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Acknowledgement / Membership No.
              </label>
              <input
                type="text"
                value={ackNo}
                onChange={(e) => setAckNo(e.target.value)}
                placeholder="e.g., ACK-2026-00001"
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
                placeholder="e.g., 9876543210 or name@example.com"
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
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Track Status
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
                    Membership Verified
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 mt-0.5">{result.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ref ID: <span className="font-semibold text-slate-700">{result.number}</span> | Registered on {result.date}
                  </p>
                </div>
                <div className="self-start sm:self-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(result.status)}`}>
                    {result.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Official Membership Card Details */}
                {result.memberDetails && (
                  <div className="mb-8 border border-sky-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-[#1565C0]/5 px-5 py-3.5 border-b border-sky-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#1565C0] uppercase tracking-wider">Official Card Details</span>
                    </div>
                    <div className="p-5 flex flex-col sm:flex-row gap-6">
                      <div className="flex flex-col items-center shrink-0">
                        <img
                          src={result.memberDetails.photo_url || "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=300"}
                          alt={result.name}
                          className="w-24 h-24 object-cover rounded-xl border border-sky-100 shadow-sm"
                        />
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-2">Member Photo</span>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 text-left">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Full Name</span>
                          <span className="text-slate-900 mt-0.5 block">{result.name}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Designation / Role</span>
                          <span className="text-[#1565C0] font-extrabold mt-0.5 block uppercase tracking-wide">
                            {result.memberDetails.designation || "Human Rights Officer"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">DOB & Gender</span>
                          <span className="text-slate-800 mt-0.5 block">{result.memberDetails.dob} ({result.memberDetails.gender})</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Working Area</span>
                          <span className="text-slate-800 mt-0.5 block">{result.memberDetails.working_area || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Download Actions - APPROVED ONLY */}
                {result.status === "APPROVED" && result.memberDetails ? (
                  <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Credentials Ready
                        </span>
                        <h4 className="font-bold text-slate-850 text-sm mt-2 font-serif">Download Membership Documents</h4>
                        <p className="text-slate-500 text-[11px] mt-0.5">Your official membership ID card and certificate are ready.</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadCertificate(result.memberDetails)}
                        disabled={downloadingCert || downloadingIdCard}
                        className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        {downloadingCert ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        Certificate
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadIdCard(result.memberDetails)}
                        disabled={downloadingCert || downloadingIdCard}
                        className="px-4 py-2 bg-[#1565C0] text-white hover:bg-[#0D47A1] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        {downloadingIdCard ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <IdCard className="w-3.5 h-3.5" />}
                        ID Card
                      </button>
                    </div>
                  </div>
                ) : (
                  result.status !== "APPROVED" && (
                    <div className="mb-8 p-5 rounded-2xl bg-amber-50/50 border border-amber-100 text-left text-xs text-amber-800 flex items-start gap-2.5">
                      <Award className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <span className="font-bold">Certificate & ID Card Under Review:</span>
                        <p className="mt-0.5 text-[11px] text-amber-700/95 leading-relaxed">
                          Your membership application is currently in the review stage. Certificates and official ID Cards are automatically generated once our executive review board grants approval.
                        </p>
                      </div>
                    </div>
                  )
                )}

                {/* Timeline */}
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6 text-left">Status Log Timeline</h4>
                {result.timeline.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-50 text-sky-850 border border-sky-100 text-xs text-left">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Application registered. Verification is under process. No updates yet.</span>
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
                          {/* Standard remarks only in public portal */}
                          <p className="text-xs text-slate-500 mt-1.5 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            &ldquo;Application status updated to {log.toStatus}.&rdquo;
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

export default function MembershipTrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
      </div>
    }>
      <MembershipTrackContent />
    </Suspense>
  );
}
