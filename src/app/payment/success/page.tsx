"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, ArrowRight, Home } from "lucide-react";

type Status = "verifying" | "success" | "failed" | "pending";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId") || "";

  const [status, setStatus] = useState<Status>("verifying");
  const [paymentType, setPaymentType] = useState<string>("");
  const [refId, setRefId] = useState<string>("");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }

    let tries = 0;
    const MAX_TRIES = 10;
    const INTERVAL = 3000; // poll every 3 seconds

    const poll = async () => {
      try {
        const res = await fetch(`/api/phonepe/verify?orderId=${encodeURIComponent(orderId)}`);
        const data = await res.json();

        if (data.success && data.status === "COMPLETED") {
          setStatus("success");
          // Determine type from orderId prefix
          if (orderId.startsWith("MBR")) setPaymentType("membership");
          else if (orderId.startsWith("DKD") || orderId.startsWith("DON")) setPaymentType("donation");
          else if (orderId.startsWith("CRS")) setPaymentType("enrollment");
          else setPaymentType("donation"); // default fallback
          setRefId(orderId);
          clearInterval(timer);
        } else if (data.status === "FAILED" || data.status === "PAYMENT_ERROR") {
          setStatus("failed");
          clearInterval(timer);
        } else {
          tries++;
          setAttempts(tries);
          if (tries >= MAX_TRIES) {
            setStatus("pending");
            clearInterval(timer);
          }
        }
      } catch {
        tries++;
        if (tries >= MAX_TRIES) {
          setStatus("failed");
          clearInterval(timer);
        }
      }
    };

    poll(); // immediate first check
    const timer = setInterval(poll, INTERVAL);
    return () => clearInterval(timer);
  }, [orderId]);

  const trackUrl =
    paymentType === "membership"
      ? `/track?type=membership&id=${refId}`
      : paymentType === "enrollment"
      ? `/track?type=enrollment&id=${refId}`
      : `/track?type=donation&id=${refId}`; // donation is default

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#e8f4fd] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-sky-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#1565C0] px-8 py-6 text-center">
          <p className="text-sky-200 text-[10px] font-bold uppercase tracking-[0.3em]">DK Foundation of Freedom & Justice</p>
          <h1 className="text-white font-bold text-lg mt-1 font-serif">Payment Status</h1>
        </div>

        <div className="px-8 py-10 text-center">
          {/* Verifying */}
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-sky-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#1565C0] animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Verifying Payment…</h2>
              <p className="text-sm text-slate-500">
                Please wait while we confirm your payment with PhonePe.
                {attempts > 0 && <span className="block mt-1 text-xs text-slate-400">Checking… ({attempts}/10)</span>}
              </p>
              <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-4 py-2">
                Do <strong>not</strong> close this page.
              </p>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Payment Successful! 🎉</h2>
              <p className="text-sm text-slate-500">
                Your payment has been verified successfully. A confirmation email has been sent to you.
              </p>
              <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-3 w-full text-left">
                <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Reference ID</p>
                <p className="text-sm font-mono font-bold text-green-800 mt-0.5 break-all">{orderId}</p>
              </div>
              <div className="flex flex-col gap-3 w-full mt-2">
                <Link
                  href={trackUrl}
                  className="flex items-center justify-center gap-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold text-sm py-3.5 rounded-xl transition-all"
                >
                  Track & Download Certificate <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm py-3.5 rounded-xl transition-all border border-slate-200"
                >
                  <Home className="w-4 h-4" /> Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Failed */}
          {status === "failed" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Payment Failed</h2>
              <p className="text-sm text-slate-500">
                Your payment could not be completed. No amount has been deducted. Please try again.
              </p>
              <div className="flex flex-col gap-3 w-full mt-2">
                <button
                  onClick={() => router.back()}
                  className="flex items-center justify-center gap-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold text-sm py-3.5 rounded-xl transition-all"
                >
                  Try Again
                </button>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm py-3.5 rounded-xl transition-all border border-slate-200"
                >
                  <Home className="w-4 h-4" /> Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Pending — took too long */}
          {status === "pending" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Payment Pending</h2>
              <p className="text-sm text-slate-500">
                Your payment is still being processed by PhonePe. This may take a few minutes.
                Please check your email or track your application below.
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-3 w-full text-left">
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Order Reference</p>
                <p className="text-sm font-mono font-bold text-amber-800 mt-0.5 break-all">{orderId}</p>
              </div>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm py-3.5 rounded-xl transition-all border border-slate-200 w-full"
              >
                <Home className="w-4 h-4" /> Back to Home
              </Link>
            </div>
          )}
        </div>

        <div className="px-8 pb-6 text-center">
          <p className="text-[10px] text-slate-400">
            Secured by PhonePe • 256-bit SSL Encrypted • DKFFJ | Section 8 Company
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
