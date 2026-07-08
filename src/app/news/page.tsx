import React from "react";
import Link from "next/link";
import { getAllNews } from "@/app/actions/home";
import { ArrowLeft, Newspaper } from "lucide-react";
import NewsGridClient from "./NewsGridClient";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await getAllNews();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1]">
        <div className="absolute top-[10%] left-[20%] w-[700px] h-[500px] rounded-full bg-[#1565C0]/[0.025] blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-[#C00000]/[0.015] blur-[130px]" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-md z-[60] sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1565C0]/10 to-[#C00000]/5 border border-slate-200 flex items-center justify-center">
              <img src="/logo.png" className="w-7 h-7 object-contain" style={{ clipPath: "circle(48.5%)" }} alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#1565C0] font-bold text-xs tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[8px] text-[#C00000] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1565C0] hover:text-[#0D47A1] transition-colors border border-sky-100 bg-sky-50/50 px-3.5 py-1.5 rounded-lg">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 z-10 relative space-y-10">

        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1565C0] to-[#0D47A1] rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-blue-900/15">
          {/* Dot pattern background */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='16' cy='16' r='1.5' fill='%23ffffff'/%3E%3C/svg%3E")`
            }}
          />
          {/* Glowing blobs */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-[#C00000]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-3.5 py-1.5 rounded-full">
                <Newspaper className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Official Dispatch</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-serif leading-tight">
                Press &amp; Latest News
              </h1>
              <p className="text-blue-100 text-sm leading-relaxed max-w-lg opacity-90">
                Official notices, announcements, and briefings published by the DKFFJ Executive Directorate.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 shrink-0">
              <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-5 text-center min-w-[90px]">
                <p className="text-4xl font-extrabold">{news.length}</p>
                <p className="text-[9px] text-blue-200 font-bold uppercase tracking-widest mt-1">Articles</p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-5 text-center min-w-[90px]">
                <p className="text-4xl font-extrabold">
                  {Array.from(new Set(news.map((n) => n.category))).length}
                </p>
                <p className="text-[9px] text-blue-200 font-bold uppercase tracking-widest mt-1">Categories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Client-side interactive news grid with search + filter */}
        <NewsGridClient initialNews={Array.from(news)} />

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-6 text-center text-xs border-t border-slate-800 z-10 mt-auto">
        <p>&copy; {new Date().getFullYear()} DK Foundation of Freedom and Justice. All rights reserved.</p>
      </footer>
    </div>
  );
}
