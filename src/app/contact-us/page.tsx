import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  Clock,
  MessageSquare,
  Shield,
  Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | DK Foundation of Freedom and Justice",
  description:
    "Get in touch with DK Foundation of Freedom and Justice. Reach us at our Kanpur head office, call us on 9871219033 or 7080403333, or email info@dkffj.org for membership, legal aid, or human rights support.",
  openGraph: {
    title: "Contact Us | DK Foundation of Freedom and Justice",
    description:
      "Reach us at our Kanpur head office or contact us via phone, email, or our online form.",
    url: "https://www.dkffj.org/contact-us",
  },
  alternates: {
    canonical: "https://www.dkffj.org/contact-us",
  },
};

const CONTACT_DETAILS = [
  {
    icon: Building2,
    label: "Head Office",
    lines: [
      "117/M/29-C, Kakadeo M-block,",
      "Madhuvan Appt. Road,",
      "Kanpur Nagar – 208019 (U.P.), India",
    ],
    color: "text-[#001C55]",
    bg: "bg-[#001C55]/5",
    border: "border-[#001C55]/15",
  },
  {
    icon: Phone,
    label: "Phone / WhatsApp",
    lines: ["+91 98712 19033", "+91 70804 03333"],
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["info@dkffj.org", "dkfoundationoffreedom@gmail.com"],
    color: "text-[#C00000]",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    icon: Globe,
    label: "Website",
    lines: ["www.dkffj.org"],
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    icon: Clock,
    label: "Office Hours",
    lines: ["Monday – Saturday: 10:00 AM – 6:00 PM", "Sunday: Closed"],
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
];

const QUICK_LINKS = [
  { label: "Membership Application", href: "/apply" },
  { label: "Appreciation Certificate", href: "/apply-appreciation" },
  { label: "Grievance / Complaint", href: "/complaint" },
  { label: "Donate to the Foundation", href: "/donate" },
  { label: "Verify a Certificate", href: "/verify" },
];

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200/70 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 h-18 flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#001C55]/10 to-[#C00000]/5 border border-slate-200 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" className="w-7 h-7 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#001C55] font-bold text-xs tracking-wide font-serif leading-tight">
                DK Foundation
              </span>
              <span className="text-[8px] text-[#C00000] font-bold tracking-wider leading-none">
                OF FREEDOM AND JUSTICE
              </span>
            </div>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#001C55] hover:text-[#001C55]/70 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-[#001C55] text-white py-16 px-5">
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="text-[10px] font-bold whitespace-nowrap tracking-widest w-full text-center"
              style={{ marginTop: i === 0 ? "8px" : "28px" }}
            >
              {"DK FOUNDATION OF FREEDOM AND JUSTICE   ".repeat(6)}
            </div>
          ))}
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-extrabold uppercase tracking-wider mb-5 text-white/80">
            <MessageSquare className="w-3 h-3" /> Contact Us
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-serif leading-tight mb-4">
            Get in Touch With Us
          </h1>
          <p className="text-white/70 text-sm max-w-xl mx-auto leading-relaxed">
            Whether you need legal aid guidance, want to apply for membership, or
            have a human rights concern — our team is here to help. Reach out using
            any of the details below.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-5 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left: Contact Details */}
        <div className="lg:col-span-5 space-y-5">
          <h2 className="text-lg font-extrabold text-slate-800 font-serif border-b border-slate-100 pb-3">
            Contact Information
          </h2>

          {CONTACT_DETAILS.map((item) => (
            <div
              key={item.label}
              className={`flex items-start gap-4 p-4 rounded-xl border ${item.bg} ${item.border}`}
            >
              <div className={`p-2 rounded-lg bg-white/80 shadow-sm flex-shrink-0 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  {item.label}
                </p>
                {item.lines.map((line) => (
                  <p key={line} className={`text-sm font-semibold ${item.color} leading-relaxed`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* Quick Links */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm mt-4">
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#001C55]" /> Quick Links
            </h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-xs font-semibold text-[#001C55] hover:text-[#C00000] transition-colors group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#001C55]/30 group-hover:bg-[#C00000] transition-colors flex-shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Map + Online Form Callout */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-lg font-extrabold text-slate-800 font-serif border-b border-slate-100 pb-3">
            Our Location
          </h2>

          {/* Google Map Embed — Kakadeo, Kanpur */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md w-full" style={{ height: "320px" }}>
            <iframe
              title="DK Foundation Office Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.3!2d80.3071!3d26.4499!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDI2JzU5LjYiTiA4MMKwMTgnMjUuNiJF!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Address Card */}
          <div className="bg-[#001C55] text-white rounded-2xl p-6 flex items-start gap-4 shadow-md">
            <MapPin className="w-6 h-6 text-white/70 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-sm tracking-wide mb-1">DK Foundation Head Office</p>
              <p className="text-white/80 text-xs leading-relaxed">
                117/M/29-C, Kakadeo M-block, Madhuvan Appt. Road,
                <br />
                Kanpur Nagar – 208019 (Uttar Pradesh), India
              </p>
              <a
                href="https://maps.google.com/?q=Kakadeo,+Kanpur+Nagar,+UP+208019"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-[10px] font-extrabold uppercase tracking-wider text-white/60 hover:text-white transition-colors"
              >
                <Globe className="w-3 h-3" /> Open in Google Maps →
              </a>
            </div>
          </div>

          {/* Reach Out Callout */}
          <div className="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
            <MessageSquare className="w-6 h-6 text-[#C00000] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-sm text-slate-800 mb-1">Have a Grievance or Query?</p>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                For Human Rights complaints, RTI applications, or urgent legal aid
                requirements, you can also lodge your grievance directly through our
                online portal for faster response.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/complaint"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C00000] text-white text-xs font-bold hover:bg-[#a00000] transition-colors shadow-sm"
                >
                  Lodge a Complaint
                </Link>
                <Link
                  href="/apply"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#001C55] text-white text-xs font-bold hover:bg-[#001C55]/90 transition-colors shadow-sm"
                >
                  Apply for Membership
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-4">
        <div className="max-w-6xl mx-auto px-5 text-center text-slate-500 text-[11px] space-y-1">
          <p className="font-bold text-slate-700">DK Foundation of Freedom and Justice</p>
          <p>Under Section 8 of The Companies Act, 2013 | CIN: U88900UP2023NPL185611</p>
          <p className="mt-2">© {new Date().getFullYear()} DK Foundation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
