import Link from "next/link";
import VerificationWidget from "@/components/VerificationWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* Premium Mesh/Geometric Background & Radial Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Golden Radial Center Glow */}
        <div className="absolute top-[25%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-amber-500/[0.04] blur-[130px]"></div>
        <div className="absolute top-[30%] left-[30%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full bg-emerald-500/[0.02] blur-[120px]"></div>
        
        {/* Mesh Line Vectors (Simulating Abstract Triangles) */}
        <svg className="absolute w-full h-[700px] opacity-[0.03] text-slate-500" xmlns="http://www.w3.org/2000/svg">
          <line x1="10%" y1="10%" x2="90%" y2="80%" stroke="currentColor" strokeWidth="1" />
          <line x1="90%" y1="10%" x2="20%" y2="90%" stroke="currentColor" strokeWidth="1" />
          <line x1="30%" y1="0" x2="60%" y2="100%" stroke="currentColor" strokeWidth="1" />
          <line x1="0" y1="40%" x2="100%" y2="60%" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      {/* Navigation Header */}
      <header className="border-b border-white/[0.04] bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          
          {/* Logo with Crest Icon */}
          <Link href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-amber-500/10 border border-white/[0.08] flex items-center justify-center transition-all group-hover:border-amber-500/20">
              {/* Crest Icon SVG */}
              <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.905 0-5.64-.73-8.028-2.018" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[9px] text-slate-400 font-medium tracking-wider leading-none">of Freedom and Justice</span>
            </div>
          </Link>

          {/* Navigation Links with separators */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Link href="#" className="text-amber-500 hover:text-amber-400 transition-colors">Home</Link>
            <Link href="#" className="hover:text-slate-200 transition-colors">About Us</Link>
            <Link href="#" className="hover:text-slate-200 transition-colors">Our Impact</Link>
            <Link href="#" className="hover:text-slate-200 transition-colors">Support</Link>
            <Link href="#" className="hover:text-slate-200 transition-colors">Contact</Link>
            <span className="text-white/[0.08] font-light">|</span>
            <Link href="#" className="hover:text-slate-200 transition-colors">Login</Link>
          </nav>

          {/* Donate button on the right */}
          <div>
            <Link 
              href="#" 
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-bold px-6 py-2.5 rounded-lg hover:from-amber-400 hover:to-yellow-400 active:scale-95 transition-all shadow-[0_4px_20px_rgba(245,158,11,0.15)] border border-amber-500/10"
            >
              Donate
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            
            {/* Main Header Serif Layout (Cinzel Roman style) */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wide text-white leading-tight font-serif">
              Guardians of <br />
              <span className="text-yellow-500">Freedom</span>, <br />
              Champions of <br />
              <span className="text-emerald-400">Justice</span>
            </h1>

            {/* Subtext description */}
            <p className="text-slate-400 text-sm leading-relaxed max-w-lg font-light tracking-wide">
              Defending fundamental human rights globally through advocacy, legal aid, and unwavering justice for the marginalized.
            </p>

            {/* Action Buttons with glowing borders */}
            <div className="flex flex-wrap gap-4 mt-4">
              
              {/* File a Complaint Button */}
              <Link 
                href="#" 
                className="bg-[#121c2c]/40 hover:bg-[#121c2c]/80 text-white font-bold text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-full border border-amber-500/40 glow-gold transition-all active:scale-95 flex items-center gap-2"
              >
                {/* Document Icon */}
                <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                File a Complaint
              </Link>
              
              {/* Join Foundation Button */}
              <Link 
                href="#" 
                className="bg-[#121c2c]/40 hover:bg-[#121c2c]/80 text-white font-bold text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-full border border-emerald-500/40 glow-emerald transition-all active:scale-95 flex items-center gap-2"
              >
                {/* User Icon */}
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Join the Foundation
              </Link>

            </div>

          </div>

          {/* Right Hero Column (Dashboard Interface) */}
          <div className="lg:col-span-5 w-full flex items-center justify-center lg:justify-end">
            <VerificationWidget />
          </div>

        </section>
      </main>

      {/* Footer (Matches mockup bottom columns) */}
      <footer className="border-t border-white/[0.04] bg-[#020617] py-10 px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          
          {/* Column 1: Recent News */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Recent News</span>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              DK Foundation of Freedom and Justice
            </p>
          </div>

          {/* Column 2: News Highlights */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">News Highlights</span>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Breakthrough in community news translation
            </p>
          </div>

          {/* Column 3: News Impacts */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">News Impacts</span>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Impact of DK Foundation of Freedom and Justice
            </p>
          </div>

          {/* Column 4: Social Icons & Copyright */}
          <div className="flex flex-col items-start md:items-end gap-4">
            <div className="flex gap-4 text-slate-500">
              <a href="#" className="hover:text-slate-300 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="hover:text-slate-300 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="hover:text-slate-300 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.325-.593 1.325-1.324v-21.35c0-.732-.595-1.325-1.325-1.325z"/></svg>
              </a>
            </div>
            <span className="text-[10px] text-slate-600">
              &copy; {new Date().getFullYear()} DKFFJ. All rights reserved.
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
}
