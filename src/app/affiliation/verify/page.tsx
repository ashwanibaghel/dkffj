"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, ArrowLeft, Building2 } from "lucide-react";

export default function AffiliationVerifyPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    const clean = encodeURIComponent(searchValue.trim());
    router.push(`/affiliation/verify/${clean}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
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
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-16 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#001C55] text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#001C55]" /> Institutional Verification Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#001C55]">
            Verify Institute Affiliation
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
            Search by official Affiliation Number (e.g. DKFFJ/F/2026/0001) or Verification Token to verify authentic registry status.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Affiliation Serial / Token *</label>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="e.g. DKFFJ/F/2026/0001 or Token"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#001C55] hover:bg-[#001C55]/90 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Search className="w-4 h-4" /> Verify Registry Record
            </button>
          </form>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-auto">
        <p>&copy; {new Date().getFullYear()} DK Foundation of Freedom and Justice. Official Registry Portal.</p>
      </footer>
    </div>
  );
}
