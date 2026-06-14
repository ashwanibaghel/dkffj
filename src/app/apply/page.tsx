"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { sendMembershipOtp, verifyMembershipOtp, submitMembershipApplication } from "./actions";
import { ArrowLeft, ArrowRight, Loader2, Check, AlertCircle, FileText, Upload, Shield, Eye, EyeOff } from "lucide-react";

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // User auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form states
  const [fullName, setFullName] = useState<string>("");
  const [fatherName, setFatherName] = useState<string>("");
  const [gender, setGender] = useState<string>("Male");
  const [dob, setDob] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // OTP states
  const [otpCode, setOtpCode] = useState<string>("");
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);

  // Address & Profession
  const [address, setAddress] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [profession, setProfession] = useState<string>("");
  const [workingArea, setWorkingArea] = useState<string>("");
  const [designation, setDesignation] = useState<string>("");

  // Documents
  const [photo, setPhoto] = useState<File | null>(null);
  const [aadhaar, setAadhaar] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Check login status on load
  useEffect(() => {
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
  }, []);

  const handleSendOtp = async () => {
    if (!mobile || !email) {
      setErrorMsg("Mobile and Email are required to send OTP.");
      return;
    }
    setSendingOtp(true);
    setErrorMsg("");
    try {
      const res = await sendMembershipOtp(mobile, email);
      if (res.success) {
        setOtpSent(true);
        setSuccessMsg(res.message || "OTP sent successfully.");
      } else {
        setErrorMsg(res.error || "Failed to send OTP.");
      }
    } catch (err) {
      setErrorMsg("An error occurred. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      setErrorMsg("Please enter the 6-digit OTP code.");
      return;
    }
    setVerifyingOtp(true);
    setErrorMsg("");
    try {
      const res = await verifyMembershipOtp(mobile, otpCode);
      if (res.success) {
        setOtpVerified(true);
        setSuccessMsg("Mobile and Email verified successfully!");
        setStep(3); // Auto-advance to step 3 on success
      } else {
        setErrorMsg(res.error || "Incorrect OTP code.");
      }
    } catch (err) {
      setErrorMsg("Verification error. Please retry.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleNextStep = () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (step === 1) {
      if (!fullName || !fatherName || !dob || !mobile || !email) {
        setErrorMsg("Please fill in all personal details.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!otpVerified) {
        setErrorMsg("You must verify your contact details with OTP first.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!address || !district || !state || !pincode || !education || !profession || !workingArea || !designation) {
        setErrorMsg("Please fill in all address and professional fields.");
        return;
      }
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg("");
    setSuccessMsg("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!photo || !aadhaar || !signature) {
      setErrorMsg("All documents (Photo, Aadhaar Card, Signature) must be uploaded.");
      return;
    }

    if (!isLoggedIn) {
      if (!password || !confirmPassword) {
        setErrorMsg("Please choose and confirm your password.");
        return;
      }
      if (password.length < 8) {
        setErrorMsg("Password must be at least 8 characters long.");
        return;
      }
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        setErrorMsg("Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("fatherName", fatherName);
      formData.append("gender", gender);
      formData.append("dob", dob);
      formData.append("mobile", mobile);
      formData.append("whatsapp", whatsapp || mobile);
      formData.append("email", email);
      formData.append("otpCode", otpCode);
      formData.append("address", address);
      formData.append("district", district);
      formData.append("state", state);
      formData.append("pincode", pincode);
      formData.append("education", education);
      formData.append("profession", profession);
      formData.append("workingArea", workingArea);
      formData.append("designation", designation);
      formData.append("photo", photo);
      formData.append("aadhaar", aadhaar);
      formData.append("signature", signature);
      if (!isLoggedIn) {
        formData.append("password", password);
      }

      const res = await submitMembershipApplication(null, formData);

      if (res.success && res.checkoutUrl) {
        setSuccessMsg(res.message || "Enrollment logged. Redirecting to payment...");
        setTimeout(() => {
          router.push(res.checkoutUrl);
        }, 1500);
      } else {
        setErrorMsg(res.error || "Submission failed. Please check details.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Visual meshes background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[15%] left-[5%] w-[600px] h-[600px] rounded-full bg-[#0F4C81]/[0.02] blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[500px] rounded-full bg-[#D62828]/[0.01] blur-[120px]"></div>
      </div>

      <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-md z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0F4C81]/10 to-[#D62828]/5 border border-slate-200 flex items-center justify-center">
              <img src="/logo.png" className="w-7 h-7 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#0F4C81] font-bold text-xs tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[8px] text-[#D62828] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0F4C81] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Cancel Application
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 z-10">
        {/* Progress Tracker header */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0F4C81]">NGO Membership Enrollment</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">Become a certified member & human rights advocate in DKFFJ.</p>

          <div className="flex items-center justify-center gap-2 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <React.Fragment key={i}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                    step === i
                      ? "bg-[#0F4C81] text-white border-[#0F4C81] scale-110 shadow-sm"
                      : step > i
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-slate-400 border-slate-200"
                  }`}
                >
                  {step > i ? <Check className="w-4 h-4" /> : i}
                </div>
                {i < 4 && (
                  <div
                    className={`w-8 h-0.5 transition-all ${
                      step > i ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-100 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-4">Step 1: Personal Profile</h3>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name (as in Aadhaar) *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoggedIn}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81] disabled:bg-slate-50"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Father's / Spouse's Name *</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                    placeholder="Enter father's or spouse's name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81] bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date of Birth *</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mobile Number *</label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                      placeholder="Same as mobile if blank"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoggedIn}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81] disabled:bg-slate-50"
                    placeholder="e.g. name@domain.com"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Verification */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-4">Step 2: Contact Verification</h3>
                
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 leading-relaxed">
                  To ensure security, we verify your email address. Click &ldquo;Send OTP&rdquo; below, and we will send a 6-digit confirmation code to your email <strong className="text-slate-800">{email}</strong>.
                </div>

                {!otpSent ? (
                  <div className="text-center py-4">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      className="px-6 py-3 rounded-lg bg-[#0F4C81] text-white hover:bg-[#0c3c66] text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-[0_4px_12px_rgba(15,76,129,0.15)] disabled:opacity-50"
                    >
                      {sendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Send OTP Code
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Enter 6-Digit OTP *</label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp}
                        className="text-[10px] font-bold text-[#D62828] hover:underline uppercase tracking-wider disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    </div>

                    <div className="flex gap-4">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="w-full text-center tracking-[12px] text-lg font-bold px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                        placeholder="000000"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp || otpVerified}
                        className="px-6 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
                      >
                        {verifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Address & Profession */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-4">Step 3: Residential & Professional Info</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Residential Address *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                    placeholder="House/Street details"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">State *</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                      placeholder="e.g. Delhi"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">District *</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                      placeholder="e.g. New Delhi"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pincode *</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                      maxLength={6}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                      placeholder="e.g. 110001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Highest Education *</label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                      placeholder="e.g. Graduate, LLB"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Profession *</label>
                    <input
                      type="text"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                      placeholder="e.g. Advocate, Teacher"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Working Area *</label>
                    <input
                      type="text"
                      value={workingArea}
                      onChange={(e) => setWorkingArea(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                      placeholder="e.g. Local District, State Level"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Designation (Desired) *</label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                      placeholder="e.g. Legal Officer, Volunteer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Documents Upload & Authentication */}
            {step === 4 && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-4">Step 4: Upload Verification Documents</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Photo */}
                  <div className="border border-slate-200 rounded-xl p-4 text-center hover:border-[#0F4C81]/30 transition-all flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Passport Photo *</span>
                    <label className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 text-slate-600 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Upload className="w-5 h-5" />
                    </label>
                    <span className="text-[10px] text-slate-400 mt-2 block overflow-hidden max-w-full text-ellipsis whitespace-nowrap">
                      {photo ? photo.name : "JPEG/PNG (Max 2MB)"}
                    </span>
                  </div>

                  {/* Aadhaar */}
                  <div className="border border-slate-200 rounded-xl p-4 text-center hover:border-[#0F4C81]/30 transition-all flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Aadhaar Card *</span>
                    <label className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 text-slate-600 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => setAadhaar(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <FileText className="w-5 h-5" />
                    </label>
                    <span className="text-[10px] text-slate-400 mt-2 block overflow-hidden max-w-full text-ellipsis whitespace-nowrap">
                      {aadhaar ? aadhaar.name : "JPEG/PNG/PDF (Max 5MB)"}
                    </span>
                  </div>

                  {/* Signature */}
                  <div className="border border-slate-200 rounded-xl p-4 text-center hover:border-[#0F4C81]/30 transition-all flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Specimen Signature *</span>
                    <label className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 text-slate-600 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => setSignature(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Upload className="w-5 h-5 text-sky-600" />
                    </label>
                    <span className="text-[10px] text-slate-400 mt-2 block overflow-hidden max-w-full text-ellipsis whitespace-nowrap">
                      {signature ? signature.name : "JPEG/PNG (Max 1MB)"}
                    </span>
                  </div>
                </div>

                {/* Password for Account Creation */}
                {!isLoggedIn && (
                  <div className="border-t pt-4 mt-4 space-y-3">
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <Shield className="w-4 h-4 text-[#0F4C81] shrink-0" />
                      <span className="text-xs font-semibold">Account Security Credentials</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border text-[11px] text-slate-500 mb-2 leading-relaxed">
                      We will automatically register a portal account using your email so you can track this membership, register for academy courses, or file grievances.
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Choose Portal Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                          placeholder="Min 8 chars: A-z, 0-9, @#$%"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm Portal Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/15 focus:border-[#0F4C81]"
                          placeholder="Retype password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions footer */}
            <div className="flex items-center justify-between border-t pt-6 mt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 bg-[#0F4C81] text-white rounded-lg text-xs font-bold text-white hover:bg-[#0c3c66] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  Next Step <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#D62828] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#b02020] transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(214,40,40,0.2)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Submit & Pay INR 1,000
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
