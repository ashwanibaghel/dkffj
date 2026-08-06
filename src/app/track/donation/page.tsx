"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Heart, Download, ShieldCheck } from "lucide-react";
import { getSecureDonationDetails, downloadDonationReceiptPdfAction } from "../actions";

function DonationTrackContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [downloadingReceipt, setDownloadingReceipt] = useState<boolean>(false);

  useEffect(() => {
    const id = searchParams.get("id");
    const contactParam = searchParams.get("contact") || searchParams.get("phone") || searchParams.get("email");
    if (id) {
      setOrderId(id);
    }
    if (contactParam) {
      setContact(contactParam);
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !contact.trim()) {
      setErrorMsg("Please enter both Donation Order ID and registered Contact (Email or Mobile).");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSearched(true);
    try {
      const res = await getSecureDonationDetails(orderId, contact);
      setResult(res);
      if (res && !res.found) {
        setErrorMsg("Donation record not found or contact details do not match.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong while fetching details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!result || !result.found) return;
    setDownloadingReceipt(true);
    try {
      const base64Pdf = await downloadDonationReceiptPdfAction(result.number, contact);
      const binaryString = window.atob(base64Pdf);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Donation_Receipt_${result.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download receipt error:", err);
      alert(`Failed to generate PDF receipt: ${err.message || err}`);
    } finally {
      setDownloadingReceipt(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form Box */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Donation Order ID *</label>
              <input
                type="text"
                placeholder="e.g. DKD-2026-10254"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#C00000]/10"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Registered Email or Mobile *</label>
              <input
                type="text"
                placeholder="e.g. ramesh.gupta@gmail.com"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#C00000]/10"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#C00000] hover:bg-[#900000] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Track Donation
            </button>
          </div>
        </form>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-xl flex items-start gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result Display */}
      {searched && result && result.found && (
        <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ORDER ID: {result.number}</span>
                <h3 className="text-xl font-bold font-serif text-slate-900 mt-0.5">{result.name}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider ${
                result.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {result.status}
              </span>
            </div>
          </div>

          {/* Key Donation Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Donated Amount</span>
              <span className="text-lg font-black text-[#001C55] mt-1 block font-mono">₹{result.amount.toLocaleString("en-IN")}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Purpose / Campaign</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block">{result.purpose}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Transaction ID</span>
              <span className="font-mono font-bold text-slate-800">{result.transactionId}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Donation Date</span>
              <span className="font-semibold text-slate-800">{result.date}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Email Address</span>
              <span className="font-semibold text-slate-800">{result.email}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Contact Mobile</span>
              <span className="font-semibold text-slate-800">{result.mobile}</span>
            </div>
          </div>

          {/* Action Footer Button */}
          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official 80G Compliant Payment Receipt Issued by DK Foundation</span>
            </div>

            <button
              onClick={handleDownloadReceipt}
              disabled={downloadingReceipt}
              className="px-6 py-3 rounded-xl bg-[#001C55] hover:bg-[#001236] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer w-full sm:w-auto justify-center"
            >
              {downloadingReceipt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download Official PDF Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackDonationPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-20">
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
          <Link href="/track" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#001C55] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tracking Menu
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 z-10">
        <div className="mb-8 text-center">
          <span className="px-3 py-1 rounded-full bg-[#C00000]/5 border border-[#C00000]/10 text-[#C00000] text-[10px] font-bold uppercase tracking-wider">
            Donation Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#001C55] mt-2">Track Donation & Download Receipt</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5">Verify your contribution status and download your official PDF payment receipt.</p>
        </div>

        <Suspense fallback={
          <div className="text-center py-12 bg-white border rounded-2xl">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#001C55]" />
          </div>
        }>
          <DonationTrackContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-450">
          &copy; {new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
