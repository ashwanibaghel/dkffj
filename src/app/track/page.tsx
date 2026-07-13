"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, UserCheck, FileText, GraduationCap, Award, FileCheck } from "lucide-react";

export default function TrackPage() {
  const cards = [
    {
      title: "Membership Status",
      desc: "Track status of your membership application and download ID Card or Certificate.",
      href: "/track/membership",
      icon: UserCheck,
      color: "from-sky-500 to-[#1565C0]",
      badge: "Secure"
    },
    {
      title: "Grievance Complaint",
      desc: "Monitor real-time progress of filed grievances, investigations, and resolutions.",
      href: "/track/complaint",
      icon: FileText,
      color: "from-blue-600 to-[#0D47A1]",
      badge: "Secure"
    },
    {
      title: "Appreciation Application",
      desc: "Check verification progress of social work appreciation request and download your Certificate.",
      href: "/track/appreciation",
      icon: Award,
      color: "from-indigo-500 to-indigo-650",
      badge: "Secure"
    },
    {
      title: "Academy Course Enrollment",
      desc: "Check enrollment status, payments, and verify course completion credentials.",
      href: "/track/course",
      icon: GraduationCap,
      color: "from-cyan-500 to-sky-600",
      badge: "Secure"
    },
    {
      title: "Certificate Verification",
      desc: "Verify authenticity of official certificates issued by DK Foundation.",
      href: "/track/certificate",
      icon: FileCheck,
      color: "from-emerald-500 to-teal-600",
      badge: "Public"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7ff] via-white to-[#e8f4fd] text-slate-900 flex flex-col font-sans relative">
      {/* Radial mesh decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#1565C0]/[0.03] blur-[100px]"></div>
      </div>

      <header className="border-b border-sky-100 bg-white/95 backdrop-blur-md z-50 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1565C0]/10 to-[#1565C0]/5 border border-sky-100 flex items-center justify-center">
              <img src="/logo.png" className="w-7 h-7 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#1565C0] font-bold text-xs tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[8px] text-[#001C55] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1565C0] hover:text-[#0D47A1] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-16 z-10 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest text-[#1565C0] bg-sky-50 border border-sky-100 uppercase">
            Tracking Portal
          </span>
          <h1 className="text-4xl font-extrabold font-serif text-[#001C55] mt-4 tracking-tight">
            What would you like to track?
          </h1>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            Select a module below to track your application, query grievance updates, or verify official certificates.
          </p>
        </div>

        {/* Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link 
                key={idx}
                href={card.href}
                className="group relative bg-white border border-sky-100 rounded-3xl p-8 hover:shadow-2xl hover:border-sky-300 transition-all duration-300 flex flex-col text-left overflow-hidden"
              >
                {/* Decorative background blur on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sky-50 to-transparent rounded-bl-full group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    card.badge === "Secure" 
                      ? "bg-amber-50 text-amber-700 border border-amber-100" 
                      : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  }`}>
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#1565C0] transition-colors font-serif">
                  {card.title}
                </h3>
                <p className="text-slate-500 text-xs mt-2.5 leading-relaxed flex-1 font-medium">
                  {card.desc}
                </p>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-1.5 text-xs font-bold text-[#1565C0] group-hover:translate-x-1.5 transition-transform duration-300">
                  Proceed to Track <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <footer className="py-8 border-t border-sky-50 text-center text-[10px] text-slate-400 bg-white/50 backdrop-blur-sm z-10">
        &copy; {new Date().getFullYear()} DK Foundation of Freedom & Justice. All Rights Reserved. • Secured Verification Portal
      </footer>
    </div>
  );
}
