import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Users, Award, Landmark, BookOpen } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[20%] w-[700px] h-[500px] rounded-full bg-[#1565C0]/[0.02] blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-[#C00000]/[0.015] blur-[130px]"></div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-md z-10 sticky top-0 shadow-sm">
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
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 z-10 space-y-16">
        
        {/* Title Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest font-sans">Who We Are</span>
          <h1 className="text-3xl md:text-5xl font-black font-serif text-slate-900 mt-2 tracking-tight">
            About Our Organization
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-4 leading-relaxed font-medium">
            DK Foundation of Freedom and Justice (DKFFJ) is a registered constitutional rights advocacy organ working to secure public grievances redressal, legal representation, and social justice.
          </p>
          <div className="h-1 w-20 bg-[#1565C0] mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Section 1: Director's Profile (High Impact Editoral Profile Card) */}
        <section className="bg-white rounded-3xl border border-sky-100 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">
          <div className="md:col-span-5 bg-gradient-to-br from-[#1565C0] to-[#0A2E66] p-8 flex flex-col justify-center items-center text-center text-white relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08)_0%,transparent_70%)]"></div>
            <div className="w-40 h-40 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl relative mb-6">
              <img src="/leaders/1000.jpg" alt="Danish Khan" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-2xl font-serif font-black tracking-wide">DANISH KHAN</h3>
            <p className="text-xs text-yellow-300 font-extrabold uppercase tracking-widest mt-1">Founder &amp; National Director</p>
            <p className="text-[10px] text-blue-200 mt-2 font-mono">Kanpur / Rampur, Uttar Pradesh</p>
          </div>
          <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-6">
            <h4 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#C00000]" /> RTI Activist &amp; Legal Advocate Profile
            </h4>
            <div className="text-slate-600 text-xs md:text-sm leading-relaxed space-y-4">
              <p>
                <strong>Danish Khan</strong> is one of India&apos;s most prominent RTI &amp; Social Activists, widely recognized for his continuous efforts toward administrative reform, transparency, and public welfare. Over a career spanning more than 15 years, he has raised his voice against custodial deaths, systemic corruption, and social injustice before both regional courts and national media.
              </p>
              <p>
                Having filed thousands of Right to Information (RTI) petitions, his work has consistently exposed financial scams and administrative irregularities. For his contributions to accountability and civic awareness, he has repeatedly received recognition and appreciation letters from various administrative organs.
              </p>
              <p>
                Danish Khan has been featured prominently in India&apos;s leading national and international media houses, including <strong>BBC, ANI, Aaj Tak, Zee News, ABP News, Hindustan, Navbharat Times, Times of India, and The Hindu</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Mission & Objectives Grid */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-slate-950">Our Operational Objectives</h2>
            <p className="text-slate-400 text-xs mt-1">DKFFJ runs under standard guidelines with a dedicated framework</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1565C0] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Human Rights Protection</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Direct assistance to victims of human rights violations, police atrocities, illegal detentions, and administrative suppression.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#C00000] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">RTI &amp; Civic Awareness</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Empowering the public with knowledge of their constitutional rights and the practical usage of RTI tools for transparency.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Legal Representation</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Providing standard legal guidance and panel advocates references to fight corruption and file public interest complaints.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Regulators & Accreditation Logos Grid */}
        <section className="bg-sky-50/50 p-8 rounded-3xl border border-sky-100 text-center space-y-6">
          <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">Regd by Ministry of Corporate Affairs, Govt. of India</span>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-85">
            <img src="/images/mca_logo.png" alt="MCA" className="h-10 md:h-12 object-contain" />
            <img src="/images/niti_aayog.png" alt="NITI Aayog" className="h-10 md:h-12 object-contain" />
            <img src="/images/emblem_of_india.png" alt="Govt. of India" className="h-10 md:h-12 object-contain" />
          </div>
        </section>
        
      </main>

      {/* Footer copyright bar */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-6 text-center text-xs border-t border-slate-800 z-10">
        <p>&copy; {new Date().getFullYear()} DK Foundation of Freedom and Justice. All rights reserved.</p>
      </footer>
    </div>
  );
}
