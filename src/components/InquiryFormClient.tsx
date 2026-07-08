"use client";

import React, { useState, useTransition } from "react";
import { submitInquiry } from "@/app/actions/inquiry";
import {
  User, Phone, Mail, MessageSquare, Send, CheckCircle2,
  AlertCircle, Loader2, ChevronDown
} from "lucide-react";

const INQUIRY_TYPES = [
  "General Inquiry",
  "Membership Information",
  "RTI Assistance",
  "Legal Guidance",
  "Course / Training Enrollment",
  "Partnership / Collaboration",
  "Media & Press",
  "Other",
];

export default function InquiryFormClient() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    subject: "",
    inquiryType: "General Inquiry",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (result) setResult(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitInquiry(form);
      setResult(res);
      if (res.success) {
        setForm({ name: "", mobile: "", email: "", subject: "", inquiryType: "General Inquiry", message: "" });
      }
    });
  };

  if (result?.success) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-5 py-10">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-800 font-serif">Inquiry Submitted!</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">{result.message}</p>
        </div>
        <button
          onClick={() => setResult(null)}
          className="text-xs font-bold text-[#1565C0] hover:underline"
        >
          Submit another inquiry →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Row 1: Name + Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Full Name <span className="text-[#C00000]">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full pl-9 pr-4 py-3 bg-white border border-sky-100 focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 text-xs text-slate-800 rounded-xl outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Mobile Number <span className="text-[#C00000]">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="tel"
              name="mobile"
              required
              value={form.mobile}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              maxLength={10}
              className="w-full pl-9 pr-4 py-3 bg-white border border-sky-100 focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 text-xs text-slate-800 rounded-xl outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Email + Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Email Address
            <span className="ml-1 text-slate-400 normal-case font-normal">(for confirmation)</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full pl-9 pr-4 py-3 bg-white border border-sky-100 focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 text-xs text-slate-800 rounded-xl outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Inquiry Type <span className="text-[#C00000]">*</span>
          </label>
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              name="inquiryType"
              required
              value={form.inquiryType}
              onChange={handleChange}
              className="w-full appearance-none pl-4 pr-9 py-3 bg-white border border-sky-100 focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 text-xs text-slate-800 rounded-xl outline-none transition-all cursor-pointer"
            >
              {INQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 3: Subject */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Subject <span className="text-[#C00000]">*</span>
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            name="subject"
            required
            value={form.subject}
            onChange={handleChange}
            placeholder="Brief subject of your inquiry"
            className="w-full pl-9 pr-4 py-3 bg-white border border-sky-100 focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 text-xs text-slate-800 rounded-xl outline-none transition-all"
          />
        </div>
      </div>

      {/* Row 4: Message */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Your Message <span className="text-[#C00000]">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={4}
          value={form.message}
          onChange={handleChange}
          placeholder="Describe your query in detail…"
          className="w-full px-4 py-3 bg-white border border-sky-100 focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10 text-xs text-slate-800 rounded-xl outline-none transition-all resize-none"
        />
      </div>

      {/* Error state */}
      {result && !result.success && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {result.message}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 bg-[#1565C0] hover:bg-[#0D47A1] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl mt-1 transition-all active:scale-95 shadow-lg shadow-blue-600/20 cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Sending Inquiry…
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Send Inquiry
          </>
        )}
      </button>

      <p className="text-[10px] text-slate-400 text-center">
        We respond within 24–48 hours. For urgent help call{" "}
        <a href="tel:+919871219033" className="text-[#1565C0] font-semibold">+91 98712 19033</a>
      </p>
    </form>
  );
}
