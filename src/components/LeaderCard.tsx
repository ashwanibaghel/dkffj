"use client";

import { useState } from "react";

interface LeaderCardProps {
  name: string;
  role: string;
  imageSrc: string;
  description: string;
  isPrimary?: boolean;
}

export default function LeaderCard({ name, role, imageSrc, description, isPrimary = false }: LeaderCardProps) {
  const [hasError, setHasError] = useState(false);

  // Helper to get initials (e.g. "Danish Khan" -> "DK", "Mohd Wasim Qureshi" -> "MWQ")
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    return parts
      .map((n) => n[0])
      .slice(0, 3)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="relative bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 text-center flex flex-col items-center gap-5 hover:border-[#0F4C81]/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(15,76,129,0.08)] hover:-translate-y-2 group overflow-hidden">
      
      {/* Decorative inner mesh glows visible on hover */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#0F4C81]/[0.03] blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#D62828]/[0.03] blur-2xl"></div>
      </div>

      {/* Avatar Wrapper with Premium Glowing Outer Ring */}
      <div className={`relative w-24 h-24 rounded-full p-1 flex items-center justify-center transition-all duration-500 group-hover:scale-105 shadow-sm
        ${isPrimary 
          ? "bg-gradient-to-br from-[#D62828] via-[#D62828]/50 to-[#0F4C81] shadow-[#D62828]/10" 
          : "bg-gradient-to-br from-[#0F4C81] via-[#0F4C81]/30 to-[#0F4C81]/10 shadow-[#0F4C81]/5"
        }`}
      >
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-slate-50 flex items-center justify-center relative shadow-inner">
          {!hasError && imageSrc ? (
            <img
              src={imageSrc}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt={name}
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-50 via-slate-100 to-slate-50 select-none">
              <span className={`text-2xl font-black font-serif tracking-widest bg-gradient-to-r bg-clip-text text-transparent
                ${isPrimary 
                  ? "from-[#D62828] to-[#0F4C81]" 
                  : "from-[#0F4C81] to-[#3b82f6]"
                }`}
              >
                {getInitials(name)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Leader Information */}
      <div className="flex flex-col items-center gap-2.5 z-10">
        <div className="flex flex-col gap-0.5">
          <h4 className="text-base font-bold text-slate-800 tracking-wide transition-colors duration-300 group-hover:text-[#0F4C81]">
            {name}
          </h4>
          
          {/* Custom Pill Badge for Role */}
          <div className="flex justify-center mt-1">
            <span className={`text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border
              ${isPrimary 
                ? "bg-[#D62828]/5 text-[#D62828] border-[#D62828]/15" 
                : "bg-[#0F4C81]/5 text-[#0F4C81] border-[#0F4C81]/15"
              }`}
            >
              {role}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 font-light leading-relaxed max-w-[210px] h-12 overflow-hidden text-ellipsis line-clamp-3">
          {description}
        </p>
      </div>

      {/* Social / Contact Icons */}
      <div className="flex gap-4 mt-2 pt-3.5 border-t border-slate-100 w-full justify-center opacity-60 group-hover:opacity-100 transition-all duration-300 z-10">
        <a 
          href="#contact" 
          aria-label="Email Member"
          className="p-2 rounded-xl bg-slate-100/80 hover:bg-[#0F4C81]/10 hover:text-[#0F4C81] text-slate-400 transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </a>
        <a 
          href="#contact" 
          aria-label="Connect via LinkedIn"
          className="p-2 rounded-xl bg-slate-100/80 hover:bg-[#0F4C81]/10 hover:text-[#0F4C81] text-slate-400 transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" fill="currentColor" />
          </svg>
        </a>
      </div>
    </div>
  );
}
