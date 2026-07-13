"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck, ArrowRight, Home, Copy, Check, Loader2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const docketNo = searchParams.get("id") || "DKC-PENDING";
  const email = searchParams.get("email") || "";
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(docketNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Background radial effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] right-[5%] w-[800px] h-[500px] rounded-full bg-[#C00000]/[0.01] blur-[120px]"></div>
        <div className="absolute bottom-[20%] left-[5%] w-[600px] h-[600px] rounded-full bg-[#001C55]/[0.015] blur-[100px]"></div>
      </div>

      <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-md z-50 sticky top-0">
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
        </div>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto px-6 py-12 sm:py-20 z-10 flex flex-col justify-center">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-8 relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#001C55] via-[#C00000] to-[#001C55]"></div>

          {/* Success Icon */}
          <div className="relative mx-auto w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          {/* Header Title */}
          <div className="space-y-2">
            <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest block">Grievance Lodged</span>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#001C55] tracking-tight">Case File Secured Successfully</h1>
            <div className="h-0.5 w-16 bg-[#1565C0] mx-auto mt-3 rounded-full"></div>
          </div>

          {/* Core message */}
          <div className="space-y-4 text-slate-650 text-xs sm:text-sm leading-relaxed font-medium">
            <p>
              Your official complaint has been safely received and registered in our central grievance registry.
            </p>
            <p className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-500 font-light text-left leading-relaxed">
              <strong className="text-slate-800 font-bold block mb-1">Cell Action Statement:</strong>
              The legal cell and district human rights coordinators of the DK Foundation of Freedom and Justice will review your case file. All details and files provided will be treated with absolute confidentiality. We will initiate necessary action and contact you or the concerned authorities at the earliest possible.
            </p>
          </div>

          {/* Docket Info Box */}
          <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-5 text-left space-y-3.5 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Credentials</span>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> SECURED
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-400 font-semibold">Complaint Docket ID:</span>
                <div className="flex items-center gap-1.5 bg-white border px-2.5 py-1 rounded-lg shadow-sm">
                  <span className="font-mono font-extrabold text-[#C00000] tracking-wide">{docketNo}</span>
                  <button 
                    type="button" 
                    onClick={handleCopy}
                    className="text-slate-400 hover:text-[#001C55] transition-colors"
                    title="Copy Docket Number"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {email && (
                <div className="flex justify-between py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-semibold">Registered Email:</span>
                  <span className="text-slate-800 font-bold font-mono">{email}</span>
                </div>
              )}

              <div className="flex justify-between py-1 border-t border-slate-100">
                <span className="text-slate-400 font-semibold">Lodging Date:</span>
                <span className="text-slate-800 font-bold">{new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/track/complaint?id=${docketNo}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-3.5 rounded-xl bg-[#001C55] hover:bg-[#001236] text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(0,28,85,0.2)]"
            >
              Track Investigation
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-wider transition-colors bg-white"
            >
              <Home className="w-4 h-4 text-slate-400" />
              Return Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#001C55]" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
