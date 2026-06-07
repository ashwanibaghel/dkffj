"use client";

import { useState } from "react";
import { verifyCertificate } from "@/app/verify/actions";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Member | null | undefined>(undefined);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setLoading(true);
    setResult(undefined);

    // 1. Try mock members
    const match = mockMembers[query];
    if (match) {
      setResult(match);
      setLoading(false);
      return;
    }

    // 2. Query real Supabase certificates database
    try {
      const liveCert = await verifyCertificate(query);
      if (liveCert && liveCert.found) {
        setResult({
          id: liveCert.certificateNo,
          name: liveCert.userName,
          role: liveCert.courseName,
          state: "All India (Academy)",
          mobile: "Verified Certificate",
          status: liveCert.status === "VALID" ? "Active" : "Revoked",
          addedDate: liveCert.issueDate,
        });
      } else {
        setResult(null);
      }
    } catch (err) {
      console.error(err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-white border border-slate-200/80 rounded-3xl p-6 shadow-[0_15px_40px_rgba(15,76,129,0.06)] transition-all">
      
      {/* Header */}
      <div className="flex flex-col mb-5 pb-4 border-b border-slate-100">
        <span className="text-[10px] text-[#D62828] font-bold uppercase tracking-widest mb-1">DKFFJ Verification Registry</span>
        <h3 className="text-lg font-bold text-[#0F4C81] tracking-wide font-serif">
          Verify Certificate
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Verify NGO member certificates or official coordinator designations. Try entering ID <code className="text-[#0F4C81] font-mono font-bold">1252</code> or <code className="text-[#0F4C81] font-mono font-bold">1238</code>.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Certificate / Enrollment No."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-slate-800 rounded-xl px-4 py-3 text-xs transition-all outline-none"
          />
          <button
            type="submit"
            className="bg-[#0F4C81] hover:bg-[#0c3e6b] text-white font-bold px-6 py-3 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center min-w-[80px] cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Verify"
            )}
          </button>
        </form>

        {/* Verification Results */}
        <div>
          {result === null && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-center text-xs font-semibold">
              ❌ Invalid Certificate / Enrollment ID.
            </div>
          )}

          {result && (
            <div className="bg-slate-50 border border-[#0F4C81]/30 rounded-2xl p-4 shadow-inner relative overflow-hidden animate-fade-in">
              <div className="absolute top-3 right-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Verified
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-200 border border-slate-300 rounded-full flex items-center justify-center font-bold text-sm text-[#0F4C81]">
                  {result.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h4 className="text-slate-800 font-bold text-xs">{result.name}</h4>
                  <p className="text-slate-500 text-[10px] font-mono">ID: {result.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-slate-200/60 pt-3 text-[10px]">
                <div>
                  <p className="text-slate-500 mb-0.5">Designation</p>
                  <p className="text-slate-800 font-bold">{result.role}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Jurisdiction</p>
                  <p className="text-slate-800 font-bold">{result.state}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Contact</p>
                  <p className="text-slate-800 font-mono font-bold">{result.mobile}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-0.5">Joined Date</p>
                  <p className="text-slate-800 font-mono font-bold">{result.addedDate}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Small trust indicators */}
        <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 mt-2 text-center text-[10px] font-semibold text-slate-500">
          <div className="flex items-center justify-center gap-1">
            <span className="text-[#0F4C81]">✓</span> Official Records
          </div>
          <div className="flex items-center justify-center gap-1 border-x border-slate-100">
            <span className="text-[#0F4C81]">✓</span> QR Verified
          </div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-[#0F4C81]">✓</span> Instant Verification
          </div>
        </div>

      </div>
    </div>
  );
}
