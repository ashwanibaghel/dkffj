"use client";

import { useState } from "react";

interface Member {
  id: string;
  name: string;
  role: string;
  state: string;
  mobile: string;
  status: string;
  addedDate: string;
}

const mockMembers: Record<string, Member> = {
  "1252": {
    id: "1252",
    name: "Sanjay Kumar Singh",
    role: "Joint Secretary",
    state: "Uttar Pradesh",
    mobile: "+91 9839281815",
    status: "Active Member",
    addedDate: "2026-03-16",
  },
  "1238": {
    id: "1238",
    name: "Raj Bahadur Singh",
    role: "Vice President",
    state: "Uttar Pradesh",
    mobile: "+91 8874281876",
    status: "Active Member",
    addedDate: "2026-05-06",
  },
  "1235": {
    id: "1235",
    name: "Zamin Khan",
    role: "Nodal Officer",
    state: "Uttar Pradesh",
    mobile: "+91 9997335392",
    status: "Active Member",
    addedDate: "2026-05-20",
  },
};

export default function VerificationWidget() {
  const [activeTab, setActiveTab] = useState<"stats" | "verify">("stats");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Member | null | undefined>(undefined);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setResult(undefined);

    setTimeout(() => {
      const match = mockMembers[searchQuery.trim()];
      setResult(match || null);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-[420px] bg-[#162031]/40 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] transition-all">
      
      {/* Header and Tab Toggles */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.05]">
        <div className="flex flex-col">
          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Dashboard</span>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase font-serif">
            {activeTab === "stats" ? "Impact Overview" : "Verify Credentials"}
          </h3>
        </div>
        
        {/* Toggle Controls */}
        <div className="flex bg-slate-950/60 p-0.5 rounded-lg border border-white/[0.03]">
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
              activeTab === "stats"
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab("verify")}
            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
              activeTab === "verify"
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Verify
          </button>
        </div>
      </div>

      {/* Tab 1: Stats Layout (Matches mockup image) */}
      {activeTab === "stats" && (
        <div className="flex flex-col gap-4">
          
          {/* Item 1: Active Advocates */}
          <div className="bg-[#0b1322]/50 border border-white/[0.02] rounded-2xl p-4 flex justify-between items-center hover:bg-[#0b1322]/80 transition-all">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-white tracking-tight">1,489</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Active Advocates</span>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">+5%</span>
              <svg className="h-6 w-16 text-emerald-400" viewBox="0 0 40 20" fill="currentColor">
                <rect x="0" y="10" width="3" height="10" rx="1" />
                <rect x="6" y="14" width="3" height="6" rx="1" />
                <rect x="12" y="8" width="3" height="12" rx="1" />
                <rect x="18" y="12" width="3" height="8" rx="1" />
                <rect x="24" y="4" width="3" height="16" rx="1" />
                <rect x="30" y="0" width="3" height="20" rx="1" />
              </svg>
            </div>
          </div>

          {/* Item 2: Complaints Resolved */}
          <div className="bg-[#0b1322]/50 border border-white/[0.02] rounded-2xl p-4 flex justify-between items-center hover:bg-[#0b1322]/80 transition-all">
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-white tracking-tight">350+</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Complaints Resolved</span>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[9px] text-yellow-500 font-bold bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">+12%</span>
              <svg className="h-6 w-16 text-yellow-500" viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M0,15 Q8,18 16,10 T32,5 T40,2" />
                <circle cx="40" cy="2" r="1.5" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* Grid for two smaller items */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Item 3: Global Reach */}
            <div className="bg-[#0b1322]/50 border border-white/[0.02] rounded-2xl p-4 flex flex-col justify-between hover:bg-[#0b1322]/80 transition-all min-h-[110px]">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-white tracking-tight">82%</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Global Reach</span>
              </div>
              <div className="flex justify-start">
                <svg className="h-10 w-20 text-emerald-500/40" viewBox="0 0 80 40" fill="currentColor">
                  <path d="M5,5 Q15,10 15,20 T25,25 Q15,30 10,25 Z" />
                  <path d="M22,23 Q28,28 25,38 T20,35 Z" />
                  <path d="M38,5 Q45,2 48,15 T42,32 Q35,28 38,18 Z" />
                  <path d="M48,5 Q65,0 72,15 T60,30 Q52,25 48,15 Z" />
                  <path d="M68,28 Q75,32 70,36 T65,30 Z" />
                </svg>
              </div>
            </div>

            {/* Item 4: Funds Distributed */}
            <div className="bg-[#0b1322]/50 border border-white/[0.02] rounded-2xl p-4 flex flex-col justify-between hover:bg-[#0b1322]/80 transition-all min-h-[110px]">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-white tracking-tight">$1.2M</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Funds Distributed</span>
              </div>
              <div className="flex justify-start">
                <svg className="h-6 w-20 text-emerald-400" viewBox="0 0 50 20" fill="currentColor">
                  <rect x="0" y="12" width="3" height="8" rx="1" />
                  <rect x="8" y="6" width="3" height="14" rx="1" />
                  <rect x="16" y="14" width="3" height="6" rx="1" />
                  <rect x="24" y="10" width="3" height="10" rx="1" />
                  <rect x="32" y="4" width="3" height="16" rx="1" />
                  <rect x="40" y="12" width="3" height="8" rx="1" />
                  <rect x="48" y="2" width="3" height="18" rx="1" />
                </svg>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Verification Panel */}
      {activeTab === "verify" && (
        <div className="flex flex-col gap-4">
          <p className="text-[11px] text-slate-400 text-center mb-2 leading-relaxed">
            Enter the Enrollment ID (try <code className="text-yellow-500 font-mono">1252</code> or <code className="text-yellow-500 font-mono">1238</code>) to query the active database.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Enrollment ID Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-white/[0.06] focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-white rounded-xl px-4 py-3 text-xs transition-all outline-none"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center min-w-[70px]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Verify"
              )}
            </button>
          </form>

          {/* Verification Results */}
          <div className="mt-2">
            {result === null && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-center text-xs font-semibold">
                ❌ Invalid Enrollment ID.
              </div>
            )}

            {result && (
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-inner relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  Verified
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center font-bold text-sm text-yellow-500">
                    {result.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xs">{result.name}</h4>
                    <p className="text-yellow-500 text-[10px] font-mono">ID: {result.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-white/[0.04] pt-3 text-[10px]">
                  <div>
                    <p className="text-slate-500 mb-0.5">Designation</p>
                    <p className="text-slate-300 font-bold">{result.role}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">Jurisdiction</p>
                    <p className="text-slate-300 font-bold">{result.state}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">Contact</p>
                    <p className="text-slate-300 font-mono font-bold">{result.mobile}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">Joined Date</p>
                    <p className="text-slate-300 font-mono font-bold">{result.addedDate}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
