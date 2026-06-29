"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyAndCompletePayment } from "./actions";
import { ShieldCheck, CreditCard, Landmark, QrCode, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

function PaymentMockPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const orderId = searchParams.get("orderId") || "";
  const amount = searchParams.get("amount") || "1000";
  const email = searchParams.get("email") || "";
  const mobile = searchParams.get("mobile") || "";

  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  const handlePay = async () => {
    if (!orderId) {
      setErrorMsg("Invalid transaction reference.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await verifyAndCompletePayment(orderId);
      if (res.success) {
        setCompleted(true);
        setTimeout(() => {
          router.push(`/track?type=${res.type}&id=${res.refId}`);
        }, 2000);
      } else {
        setErrorMsg(res.error || "Simulation failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("An error occurred during payment simulation.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-[#001C55] text-white p-5 text-center relative">
          <div className="absolute top-4 left-4 inline-flex items-center gap-1 bg-amber-500 text-slate-950 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider shadow">
            <AlertTriangle className="w-2.5 h-2.5" /> Sandbox Testing
          </div>
          <h2 className="text-lg font-serif font-bold tracking-wide mt-3">DKFFJ Secure Payments</h2>
          <p className="text-[10px] text-sky-200/90 tracking-wider font-semibold uppercase mt-0.5">Secure Transaction Gateway</p>
        </div>

        {/* Info Area */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Transaction Reference</span>
            <span className="text-xs font-mono font-bold text-slate-700">{orderId || "MOCK-TXN-REF"}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Payable Amount</span>
            <span className="text-base font-extrabold text-[#C00000]">INR {amount}.00</span>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-100 text-[11px] text-rose-800 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Box */}
        {!completed ? (
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Select Payment Mode</label>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-[10px] font-bold ${
                    paymentMethod === "card"
                      ? "border-[#001C55] bg-[#001C55]/5 text-[#001C55]"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                  }`}
                >
                  <CreditCard className="w-5 h-5" /> Card Payment
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-[10px] font-bold ${
                    paymentMethod === "upi"
                      ? "border-[#001C55] bg-[#001C55]/5 text-[#001C55]"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                  }`}
                >
                  <QrCode className="w-5 h-5" /> UPI Scan
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("net")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-[10px] font-bold ${
                    paymentMethod === "net"
                      ? "border-[#001C55] bg-[#001C55]/5 text-[#001C55]"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
                  }`}
                >
                  <Landmark className="w-5 h-5" /> Net Banking
                </button>
              </div>

              {/* Detail fields based on payment method */}
              <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                {paymentMethod === "card" && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Card Number (XXXX XXXX XXXX XXXX)"
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none"
                      disabled
                      value="4111 2222 3333 4444"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none text-center"
                        disabled
                        value="12/29"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        className="px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none text-center"
                        disabled
                        value="123"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "upi" && (
                  <div className="text-center py-2 space-y-2 flex flex-col items-center">
                    <div className="w-24 h-24 border-2 border-slate-200 bg-white rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
                      {/* Fake QR pattern */}
                      <div className="w-full h-full bg-slate-950 flex flex-wrap gap-0.5 opacity-20">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-black" />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-white/95">
                        <QrCode className="w-12 h-12 text-[#001C55]" />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">Scan using any UPI App (GPay/PhonePe)</span>
                  </div>
                )}

                {paymentMethod === "net" && (
                  <div className="space-y-2">
                    <select className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none" disabled>
                      <option>State Bank of India</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Dev notice */}
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-[10px] text-amber-800 leading-relaxed">
                This is a secure simulation page. Clicking &ldquo;Simulate Payment Success&rdquo; will send a mock success callback to the portal server, transitioning your application state to review. No real money will be charged.
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="mt-6 w-full py-3 rounded-lg bg-[#C00000] text-white hover:bg-[#990000] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(192, 0, 0,0.15)] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Connection...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Simulate Payment Success
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-8 text-center flex-1 flex flex-col justify-center items-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-scaleUp" />
            <h3 className="text-lg font-bold text-slate-800">Payment Completed!</h3>
            <p className="text-xs text-slate-500 mt-1">Your transaction has been processed successfully.</p>
            <div className="mt-6 flex items-center gap-2 text-slate-400 text-[10px]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Redirecting to status desk...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentMockPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#001C55]" />
      </div>
    }>
      <PaymentMockPageContent />
    </Suspense>
  );
}
