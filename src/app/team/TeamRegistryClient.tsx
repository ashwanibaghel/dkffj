"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, GraduationCap, MapPin, Phone, ShieldCheck, Briefcase } from "lucide-react";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  education: string;
  location: string;
  mobile: string;
  photo: string;
  status: number;
  showHome: number;
}

interface TeamRegistryClientProps {
  teamMembers: TeamMember[];
}

export default function TeamRegistryClient({ teamMembers }: TeamRegistryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All");

  // Get unique list of states/locations for filtering
  const statesList = ["All", ...Array.from(new Set(teamMembers.map(m => {
    const parts = m.location.split(",");
    return parts[parts.length - 1].trim();
  }))).sort()];

  // Filter members based on search and state select
  const filteredMembers = teamMembers.filter((m) => {
    const matchSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.education.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.includes(searchQuery);

    const parts = m.location.split(",");
    const memberState = parts[parts.length - 1].trim();
    const matchState = selectedState === "All" || memberState === selectedState;

    return matchSearch && matchState;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-hidden">
      
      {/* Mesh Background Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#0F4C81]/[0.02] blur-[100px]"></div>
        <div className="absolute bottom-10 left-10 w-[600px] h-[600px] rounded-full bg-[#D62828]/[0.01] blur-[120px]"></div>
      </div>

      {/* Mini-Header for Navigation */}
      <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#0F4C81] transition-colors">
            <ArrowLeft className="w-4 h-4 text-[#D62828]" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="w-8 h-8 object-contain" alt="DKFFJ Logo" />
            <div className="flex flex-col text-left">
              <span className="text-[#0F4C81] font-bold text-xs font-serif leading-tight">DK Foundation</span>
              <span className="text-[7px] text-[#D62828] font-bold tracking-wider leading-none">REGISTRY PORTAL</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 relative z-20">
        
        {/* Page Headings */}
        <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col gap-3">
          <div className="inline-flex items-center gap-1 bg-[#0F4C81]/10 text-[#0F4C81] rounded-full px-3 py-1 self-center text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> Official Member Directory
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
            Full Executive Council & Activists Registry
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed font-light">
            Verified list of national directors, state presidents, legal advisors, and human rights coordinators actively serving across 28+ States in India.
          </p>
          <div className="h-1 w-16 bg-[#D62828] mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm max-w-4xl mx-auto mb-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search Input */}
          <div className="md:col-span-7 relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, designation, state, qualification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-xs px-11 py-3.5 rounded-xl outline-none transition-all placeholder-slate-400"
            />
          </div>

          {/* State Select Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-xs px-4 py-3.5 rounded-xl outline-none transition-all text-slate-700"
            >
              {statesList.map((state) => (
                <option key={state} value={state}>
                  {state === "All" ? "Filter State: All" : state}
                </option>
              ))}
            </select>
          </div>

          {/* Status Counter */}
          <div className="md:col-span-2 text-center md:text-right text-[11px] font-bold text-[#0F4C81]">
            Found: {filteredMembers.length} Members
          </div>

        </div>

        {/* Cards Grid */}
        {filteredMembers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm max-w-md mx-auto">
            <span className="text-3xl">🔍</span>
            <h4 className="text-base font-bold text-slate-800 mt-3 font-serif">No Council Member Found</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              We couldn't find any member matching your search query. Try checking the spelling or using a different keyword.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member) => {
              // Calculate initials for fallback photo
              const nameParts = member.name.split(" ");
              const initials = nameParts.length > 1 
                ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                : nameParts[0].slice(0, 2).toUpperCase();

              const isOfficialLead = member.photo !== "";

              return (
                <div 
                  key={member.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-[#0F4C81]/30 transition-all duration-300 flex flex-col justify-between h-full group"
                >
                  <div>
                    {/* Top Row: Verification ID Code & Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider">
                        REG-ID: {member.id}
                      </span>
                      <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider border ${
                        member.status === 1
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-amber-50 text-amber-600 border-amber-200"
                      }`}>
                        {member.status === 1 ? "Active" : "Coordinator"}
                      </span>
                    </div>

                    {/* Member Profile Block */}
                    <div className="flex gap-4 items-start mb-5">
                      {/* Photo or Initials Fallback */}
                      {isOfficialLead ? (
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-[#0F4C81]/20 shadow-inner shrink-0 bg-slate-100">
                          <img src={member.photo} className="w-full h-full object-cover" alt={member.name} />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0F4C81]/15 to-[#D62828]/5 border border-slate-200 text-[#0F4C81] font-bold text-sm flex items-center justify-center shrink-0 shadow-inner">
                          {initials}
                        </div>
                      )}

                      {/* Name & Designation */}
                      <div className="flex flex-col text-left">
                        <h4 className="text-sm font-bold text-slate-800 tracking-wide font-serif leading-tight group-hover:text-[#0F4C81] transition-colors">
                          {member.name}
                        </h4>
                        <span className="text-[10px] text-[#D62828] font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {member.role}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Specs (Education & State) */}
                    <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5 text-[10px] text-slate-600 text-left">
                      {/* Qualification */}
                      <div className="flex items-start gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-semibold leading-none mb-0.5">Qualification</p>
                          <p className="font-medium text-slate-700 leading-tight">{member.education}</p>
                        </div>
                      </div>

                      {/* State Location */}
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-semibold leading-none mb-0.5">Jurisdiction</p>
                          <p className="font-medium text-slate-700 leading-tight">{member.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Contact Information */}
                  {member.mobile && (
                    <div className="border-t border-slate-100 mt-4 pt-3 flex items-center gap-2 text-[10px]">
                      <Phone className="w-3 h-3 text-[#0F4C81] shrink-0" />
                      <span className="text-slate-400 font-mono">Contact:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {member.mobile.includes("hold") || member.mobile.includes("id") 
                          ? "Protected" 
                          : member.mobile}
                      </span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Footer bar */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} DKFFJ. All rights reserved.</span>
          <span className="text-[10px] font-mono">Official NGO Registry Authority - Section 8, Companies Act, 2013</span>
        </div>
      </footer>

    </div>
  );
}
