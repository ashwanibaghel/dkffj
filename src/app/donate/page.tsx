"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Loader2, DollarSign, CheckCircle2, Shield } from "lucide-react";
import { submitDonation } from "./actions";

const PRESETS = [500, 1000, 2500, 5000, 10000];
const PURPOSES = [
  "General Donation",
  "Child Education Support",
  "Women Empowerment & Safety",
  "Legal Aid & Human Rights Advocacy",
  "Disaster Relief & Rehabilitation",
  "Consumer Rights Awareness"
];

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("General Donation");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const getAmountValue = (): number => {
    if (selectedAmount === "custom") {
      const val = parseFloat(customAmount);
      return isNaN(val) ? 0 : val;
    }
    return selectedAmount;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    
    const amount = getAmountValue();
    if (amount <= 0) {
      setErrorMsg("Please enter or select a valid donation amount.");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("amount", amount.toString());
    formData.set("purpose", purpose);

    try {
      const res = await submitDonation(formData);
      if (res.success && res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        setErrorMsg(res.error || "Something went wrong.");
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during submission.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[850px] h-[450px] rounded-full bg-[#001C55]/[0.015] blur-[120px]"></div>
      </div>

      {/* Header */}
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

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Impact Showcase */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-[10px] font-extrabold text-[#C00000] uppercase tracking-wider mb-3">
              <Heart className="w-3 h-3 fill-current" /> Save Humanity
            </div>
            <h1 className="text-3xl font-extrabold font-serif text-[#001C55] leading-tight">Make a Difference Today</h1>
            <p className="text-slate-500 text-xs mt-2.5 leading-relaxed">
              Your generous contribution directly funds free legal aid cells, primary education supplies, emergency medical assistance, and human rights advocacy camps across remote Indian communities.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-2">Donation Impact</h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="p-1 rounded-full bg-emerald-50 text-emerald-600 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                <div>
                  <strong className="text-slate-800">₹500</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">Sponsors classroom study kits for 3 underprivileged child officers.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="p-1 rounded-full bg-emerald-50 text-emerald-600 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                <div>
                  <strong className="text-slate-800">₹1,500</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">Funds legal counsel drafting charges for a victim of civil rights violation.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="p-1 rounded-full bg-emerald-50 text-emerald-600 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                <div>
                  <strong className="text-slate-800">₹5,000</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">Organizes a rural human rights awareness session and local distribution drive.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-300 flex items-center gap-3 text-left">
            <Shield className="w-8 h-8 text-[#001C55] shrink-0" />
            <div>
              <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Appreciation Certificate</h4>
              <p className="text-slate-500 text-[10px] mt-0.5">Every donor receives a verified **Certificate of Appreciation** and tax deduction receipt upon successful transaction.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl shadow-md p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            
            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Choose Donation Amount (INR)</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PRESETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setErrorMsg("");
                    }}
                    className={`py-2 rounded-lg border text-xs font-bold tracking-wide transition-all ${
                      selectedAmount === amt
                        ? "bg-[#001C55] text-white border-[#001C55] shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/80"
                    }`}
                  >
                    ₹{amt.toLocaleString("en-IN")}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedAmount("custom")}
                  className={`py-2 col-span-1 rounded-lg border text-xs font-bold tracking-wide transition-all ${
                    selectedAmount === "custom"
                      ? "bg-[#001C55] text-white border-[#001C55] shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/80"
                  }`}
                >
                  Custom
                </button>
              </div>

              {selectedAmount === "custom" && (
                <div className="mt-3 relative flex rounded-lg shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder="Enter custom amount..."
                    min="10"
                    className="w-full px-3 py-2 rounded-r-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#001C55] bg-white font-bold text-slate-700"
                  />
                </div>
              )}
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Purpose of Donation</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001C55] bg-white font-bold text-slate-700 cursor-pointer"
              >
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <hr className="border-slate-100" />

            {/* Personal Details */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Donor Information</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Full Name</span>
                  <input
                    type="text"
                    name="donorName"
                    required
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001C55] bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Email Address</span>
                  <input
                    type="email"
                    name="donorEmail"
                    required
                    placeholder="e.g. john@example.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001C55] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Mobile Number</span>
                  <input
                    type="tel"
                    name="donorMobile"
                    required
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001C55] bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">Permanent Address</span>
                  <input
                    type="text"
                    name="donorAddress"
                    required
                    placeholder="e.g. City, State"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#001C55] bg-white"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-[11px] text-rose-800 font-semibold rounded-lg">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-current" /> Donate Now (₹{getAmountValue().toLocaleString("en-IN")})
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
