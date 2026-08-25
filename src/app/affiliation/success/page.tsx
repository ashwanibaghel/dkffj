"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Copy,
  Check,
  Search,
  Download,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText
} from "lucide-react";

function AffiliationSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const testAppNo = searchParams.get("appNo") || "";
  const isLocalTestResult = process.env.NODE_ENV === "development" && searchParams.get("test") === "1" && Boolean(orderId) && Boolean(testAppNo);
  const [appNo, setAppNo] = useState(isLocalTestResult ? testAppNo : "");
  const [verificationStatus, setVerificationStatus] = useState<"verifying" | "success" | "failed">(isLocalTestResult ? "success" : orderId ? "verifying" : "failed");
  const [verificationError, setVerificationError] = useState(orderId ? "" : "Payment reference is missing. Please use the affiliation tracking page.");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId || isLocalTestResult) return;
    let cancelled = false;
    let attempts = 0;
    const verify = async () => {
      try {
        const response = await fetch(`/api/phonepe/verify?orderId=${encodeURIComponent(orderId)}`);
        const data = await response.json();
        if (cancelled) return;
        if (data.success && data.status === "COMPLETED" && data.details?.paymentType === "affiliation" && data.details?.ackOrEnrollmentNo) {
          setAppNo(data.details.ackOrEnrollmentNo);
          setVerificationStatus("success");
          return;
        }
        attempts += 1;
        if (data.status === "FAILED" || attempts >= 15) {
          setVerificationError(data.error || "Payment verification is still pending. Please use your payment reference to contact support.");
          setVerificationStatus("failed");
          return;
        }
        window.setTimeout(verify, 2000);
      } catch {
        attempts += 1;
        if (attempts >= 15) {
          setVerificationError("Unable to verify payment right now. Please do not pay again; try tracking after a few minutes.");
          setVerificationStatus("failed");
        } else {
          window.setTimeout(verify, 2000);
        }
      }
    };
    void verify();
    return () => { cancelled = true; };
  }, [orderId, isLocalTestResult]);

  const copyToClipboard = () => {
    if (!appNo) return;
    navigator.clipboard.writeText(appNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (verificationStatus !== "success") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4 bg-slate-900 border border-slate-800 rounded-3xl p-8">
          {verificationStatus === "verifying" ? <Sparkles className="w-9 h-9 text-amber-400 animate-spin mx-auto" /> : <FileText className="w-9 h-9 text-rose-400 mx-auto" />}
          <h1 className="text-xl font-black">{verificationStatus === "verifying" ? "Verifying Payment…" : "Payment Verification Pending"}</h1>
          <p className="text-sm text-slate-400">{verificationStatus === "verifying" ? "Please wait. Do not make another payment." : verificationError}</p>
          {orderId && <p className="text-[11px] font-mono text-slate-500 break-all">Reference: {orderId}</p>}
          <Link href="/affiliation/track" className="inline-flex px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold">Go to Affiliation Tracking</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-xl w-full mx-auto relative z-10 space-y-6 my-auto">
        {/* Header Badge */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
            <CheckCircle className="w-10 h-10 text-emerald-400 animate-scaleUp" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Application Submitted Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Your ₹2,100 processing fee payment has been verified. Your application is now queued for executive board inspection &amp; approval.
          </p>
        </div>

        {/* Official Application Number Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 text-center">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block">
              Official Application Number
            </span>
            <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
              <span className="font-mono text-xl sm:text-2xl font-black text-emerald-400 tracking-wider">
                {appNo}
              </span>
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy ID"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Please save or copy this Application Number for tracking your approval status online.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-left text-xs">
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-bold">Payment Verified</span>
              <strong className="text-emerald-400 text-sm font-mono">₹2,100.00</strong>
            </div>
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-bold">Current Status</span>
              <strong className="text-amber-400 text-xs font-bold">SUBMITTED (In Review)</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* 1. Track Application Button */}
            <Link
              href={`/affiliation/track?app=${encodeURIComponent(appNo)}`}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Search className="w-4 h-4" /> Track Application Status <ArrowRight className="w-4 h-4" />
            </Link>

            {/* 2. Download Receipt Button */}
            <a
              href={`/api/affiliation/receipt?orderId=${encodeURIComponent(orderId)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" /> Download Payment Receipt PDF
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>An official receipt &amp; submission confirmation email has also been sent to your registered email address.</p>
          <Link href="/" className="text-amber-400 hover:underline font-bold text-xs inline-block pt-1">
            Back to DKFFJ Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AffiliationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="text-center space-y-2">
            <Sparkles className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
            <p className="text-xs text-slate-400">Loading submission status...</p>
          </div>
        </div>
      }
    >
      <AffiliationSuccessContent />
    </Suspense>
  );
}
