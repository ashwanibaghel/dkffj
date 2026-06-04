"use client";

import { useState } from "react";

export default function GrievanceForm() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    type: "General Legal Inquiry",
    details: "",
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; success: boolean }>({
    show: false,
    message: "",
    success: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showNotification = (message: string, success: boolean = true) => {
    setToast({ show: true, message, success });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mobile number validation (simple 10-digit check)
    const cleanMobile = formData.mobile.replace(/\D/g, "");
    if (cleanMobile.length < 10) {
      showNotification("Please enter a valid 10-digit mobile number.", false);
      return;
    }

    setLoading(true);

    // Mock API request
    setTimeout(() => {
      setLoading(false);
      const refId = `DK-${Math.floor(100000 + Math.random() * 900000)}`;
      showNotification(`Grievance registered successfully! Ref ID: ${refId}`);
      
      // Reset form
      setFormData({
        name: "",
        mobile: "",
        email: "",
        type: "General Legal Inquiry",
        details: "",
      });
    }, 1500);
  };

  return (
    <div className="relative w-full">
      {/* Dynamic Success/Error Toast notification */}
      <div
        className={`fixed top-28 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl transition-all duration-500 max-w-sm transform
          ${toast.show ? "translate-x-0 opacity-100 scale-100" : "translate-x-12 opacity-0 scale-95 pointer-events-none"}
          ${toast.success 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"}`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
          ${toast.success ? "bg-emerald-100" : "bg-red-100"}`}
        >
          {toast.success ? (
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold font-sans">
            {toast.success ? "Success" : "Validation Error"}
          </span>
          <span className="text-[10px] opacity-90 leading-tight">
            {toast.message}
          </span>
        </div>
      </div>

      {/* Grievance Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Full Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="bg-slate-50 border border-slate-200 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-xs px-4 py-3 rounded-lg outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Mobile No. *</label>
            <input
              type="text"
              name="mobile"
              required
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Phone Number"
              className="bg-slate-50 border border-slate-200 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-xs px-4 py-3 rounded-lg outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              className="bg-slate-50 border border-slate-200 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-xs px-4 py-3 rounded-lg outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Grievance Type *</label>
            <select
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="bg-slate-50 border border-slate-200 focus:border-[#0F4C81] text-xs px-4 py-3 rounded-lg outline-none transition-all cursor-pointer"
            >
              <option value="General Legal Inquiry">General Legal Inquiry</option>
              <option value="Human Rights Infringement">Human Rights Infringement</option>
              <option value="RTI Drafting Request">RTI Drafting Request</option>
              <option value="Membership Query">Membership Query</option>
              <option value="Grievance / Public complaint">Grievance / Public complaint</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase text-slate-500">Details / Complaint Text *</label>
          <textarea
            name="details"
            required
            rows={4}
            value={formData.details}
            onChange={handleChange}
            placeholder="State your problem clearly with landmarks, dates, and names of officers involved if applicable..."
            className="bg-slate-50 border border-slate-200 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-xs px-4 py-3 rounded-lg outline-none resize-none transition-all h-28"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#0F4C81] hover:bg-[#0c3e6b] disabled:bg-[#0F4C81]/70 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-lg mt-2 transition-all active:scale-95 shadow-[0_4px_12px_rgba(15,76,129,0.15)] flex items-center justify-center min-h-[48px] cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Submit Application"
          )}
        </button>
      </form>
    </div>
  );
}
