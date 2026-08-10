"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Building2,
  User,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Lock,
  Sparkles
} from "lucide-react";
import { initiateAffiliationPayment, getAffiliationPaymentDetails, bypassAffiliationPayment } from "../apply/actions";
import { AFFILIATION_FEE_AMOUNT, AFFILIATION_FEE_DESCRIPTION, AFFILIATION_FEE_NOTE } from "@/lib/affiliation-config";

// Inner component that uses useSearchParams — must be wrapped in Suspense
function AffiliationPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [bypassLoading, setBypassLoading] = useState(false);
  const [error, setError] = useState("");
  const [appData, setAppData] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      setError("No application ID provided.");
      setLoading(false);
      return;
    }

    getAffiliationPaymentDetails(id).then((res) => {
      if (res.appData) {
        const app = res.appData as any;
        setAppData(app);
        if (app.status === "SUBMITTED" || app.payment?.status === "COMPLETED") {
          const appNo = app.applicationNo;
          if (appNo && appNo.startsWith("AFF-") && !appNo.startsWith("AFF-DRAFT-")) {
            router.push(`/affiliation/success?appNo=${appNo}`);
            return;
          }
        }
      }
      setLoading(false);
    });
  }, [id, router]);

  // Real Gateway Checkout
  const handlePayNow = async () => {
    if (!id) return;
    setPayLoading(true);
    setError("");

    try {
      const res = await initiateAffiliationPayment(id);
      if (res.error) {
        setError(res.error);
        setPayLoading(false);
      } else if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (err: any) {
      setError(err.message || "Failed to launch payment checkout.");
      setPayLoading(false);
    }
  };

  // Dev Test Bypass Checkout
  const handleDevBypass = async () => {
    if (!id) return;
    setBypassLoading(true);
    setError("");

    try {
      const res = await bypassAffiliationPayment(id);
      if (res.success && res.applicationNo) {
        router.push(`/affiliation/success?appNo=${res.applicationNo}`);
      } else {
        setError(res.error || "Failed to complete test payment bypass.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process test payment verification.");
    } finally {
      setBypassLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
          <p className="text-sm font-medium text-slate-300">Loading Application Summary...</p>
        </div>
      </div>
    );
  }

  if (error && !appData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold">Application Not Found</h2>
          <p className="text-sm text-slate-400">{error}</p>
          <Link href="/affiliation/apply" className="inline-block px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-slate-900 text-sm">
            Back to Apply Page
          </Link>
        </div>
      </div>
    );
  }

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl w-full mx-auto relative z-10 space-y-6 my-auto">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Secure Checkout
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Institute Affiliation Fee
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            DK Foundation of Freedom and Justice (Regd. Section 8 NGO)
          </p>
        </div>

        {/* Application Summary Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Reference Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Draft Reference ID</span>
              <span className="font-mono text-base font-bold text-amber-400">{appData?.applicationNo || id}</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              Status: Draft (Pending Payment)
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-800/50 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                <Building2 className="w-3.5 h-3.5 text-amber-400" /> Institute Name
              </div>
              <p className="font-bold text-white text-sm truncate">{appData?.organizationName}</p>
              <p className="text-[11px] text-slate-400">{appData?.organizationType}</p>
            </div>

            <div className="p-3.5 bg-slate-800/50 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                <User className="w-3.5 h-3.5 text-amber-400" /> Applicant
              </div>
              <p className="font-bold text-white text-sm truncate">{appData?.applicant?.fullName}</p>
              <p className="text-[11px] text-slate-400">{appData?.applicant?.email}</p>
            </div>
          </div>

          {/* Fee Amount Callout */}
          <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-amber-500/5 border border-amber-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-300 block">{AFFILIATION_FEE_DESCRIPTION}</span>
                <span className="text-[11px] text-slate-400">One-time processing fee for inspection &amp; review</span>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">₹{AFFILIATION_FEE_AMOUNT.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-400 font-bold block">Inclusive of processing</span>
              </div>
            </div>

            <div className="pt-3 border-t border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>100% Refund Guarantee:</strong> {AFFILIATION_FEE_NOTE}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handlePayNow}
              disabled={payLoading || bypassLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {payLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Redirecting to Gateway...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" /> Pay ₹{AFFILIATION_FEE_AMOUNT.toLocaleString()} via PhonePe <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Dev Test Bypass Option */}
            {isDev && (
              <div className="pt-3 border-t border-slate-800 text-center space-y-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400/80 block">
                  Local Dev Testing Mode
                </span>
                <button
                  onClick={handleDevBypass}
                  disabled={bypassLoading || payLoading}
                  className="w-full py-2.5 rounded-xl border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  {bypassLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  Complete Payment (Test Mode / Bypass)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-xs">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> 256-bit SSL Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> PhonePe Verified Gateway
          </span>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton shown while Suspense waits
function PaymentPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
        <p className="text-sm font-medium text-slate-300">Loading Payment Page...</p>
      </div>
    </div>
  );
}

// Default export wraps the content in Suspense to satisfy Next.js requirement
export default function AffiliationPaymentPage() {
  return (
    <Suspense fallback={<PaymentPageSkeleton />}>
      <AffiliationPaymentContent />
    </Suspense>
  );
}
