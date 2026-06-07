"use client";

import React, { useState, useEffect } from "react";
import { registerForCourse } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { BookOpen, Clock, Award, Loader2, AlertCircle, Shield, Check, Eye, EyeOff, User } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  fees: string;
  eligibility: string;
  image_url: string | null;
}

export default function CourseCard({ course }: { course: Course }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form inputs
  const [fullName, setFullName] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      const checkUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsLoggedIn(true);
          setEmail(user.email || "");
          setFullName(user.user_metadata?.full_name || "");
        }
      };
      checkUser();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!fullName || !mobile || !email) {
      setErrorMsg("All registration fields are required.");
      return;
    }

    if (!isLoggedIn && !password) {
      setErrorMsg("Please choose a password to register your academy portal account.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("courseId", course.id);
      formData.append("fullName", fullName);
      formData.append("mobile", mobile);
      formData.append("email", email);
      if (!isLoggedIn) {
        formData.append("password", password);
      }

      const res = await registerForCourse(null, formData);

      if (res.success && res.checkoutUrl) {
        setSuccessMsg(res.message || "Registration logged! Redirecting to payment...");
        setTimeout(() => {
          window.location.href = res.checkoutUrl;
        }, 1500);
      } else {
        setErrorMsg(res.error || "Registration failed. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during submission.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Card Visual layout */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col h-full group">
        <div className="h-44 w-full relative overflow-hidden bg-slate-900">
          <img
            src={course.image_url || "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800"}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 bg-[#0F4C81] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {course.duration}
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 font-serif leading-snug group-hover:text-[#0F4C81] transition-colors">{course.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed">{course.description}</p>
            
            <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 border-slate-100 text-[11px] text-slate-600 font-medium">
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Fees</span>
                <span className="text-sm font-extrabold text-[#D62828] mt-0.5 block">INR {Number(course.fees).toLocaleString("en-IN")}.00</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Eligibility</span>
                <span className="text-[11px] text-slate-700 font-semibold truncate mt-0.5 block">{course.eligibility}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="mt-5 w-full py-2.5 rounded-lg bg-[#0F4C81] text-white hover:bg-[#0c3c66] text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            Enroll in Course
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden my-8 flex flex-col relative animate-scaleUp">
            
            {/* Header */}
            <div className="bg-[#0F4C81] text-white p-5 text-left">
              <span className="text-[9px] font-bold text-sky-200 uppercase tracking-widest block">Course Registration</span>
              <h3 className="text-base font-bold font-serif mt-1 leading-snug">{course.title}</h3>
              <p className="text-[10px] text-slate-300 mt-1">Duration: {course.duration} | Fees: INR {Number(course.fees).toLocaleString("en-IN")}.00</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-[11px] text-rose-800 font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 font-semibold flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoggedIn}
                  placeholder="Your official name"
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoggedIn}
                  placeholder="e.g. you@example.com"
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 disabled:bg-slate-50"
                />
              </div>

              {!isLoggedIn && (
                <div className="border-t pt-3 mt-3 space-y-3">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Shield className="w-3.5 h-3.5 text-[#0F4C81]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Portal Security</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Choose Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="At least 6 characters"
                        className="w-full px-3 py-2 pr-9 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-4 mt-4 gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#D62828] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#b02020] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Pay INR {Number(course.fees).toLocaleString("en-IN")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
