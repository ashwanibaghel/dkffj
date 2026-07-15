"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { sendAppreciationOtp, verifyAppreciationOtp, submitAppreciationApplication } from "./actions";
import { ArrowLeft, ArrowRight, Loader2, Check, AlertCircle, FileText, Upload, Shield, Eye, EyeOff } from "lucide-react";
import { indiaStatesDistricts, countriesList } from "@/lib/data/indiaStatesDistricts";

const SOCIAL_WORK_FIELDS = [
  "Human Rights Protection & Advocacy",
  "Women Empowerment & Gender Equality",
  "Child Rights & Child Welfare",
  "Education Support & Free Literacy",
  "Environmental Protection & Conservation",
  "Anti-Corruption & RTI Activism",
  "Medical & Disaster Relief Services",
  "Youth Empowerment & Skill Development",
  "Consumer Rights & Public Advocacy",
  "Other Social Activism / Support Services"
];

export default function ApplyAppreciationPage() {
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
  const [country, setCountry] = useState<string>("India");
  const [countryCode, setCountryCode] = useState<string>("+91");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState<string>("+91");
  const [mobile, setMobile] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // OTP states
  const [otpCode, setOtpCode] = useState<string>("");
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [verifyingOtp, setVerifyingOtp] = useState<boolean>(false);

  // Address & Field of Work
  const [address, setAddress] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [socialWorkField, setSocialWorkField] = useState<string>(SOCIAL_WORK_FIELDS[0]);
  const [customSocialWorkField, setCustomSocialWorkField] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Documents
  const [photo, setPhoto] = useState<File | null>(null);
  const [idProof, setIdProof] = useState<File | null>(null);
  const [achievementProof, setAchievementProof] = useState<File | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const activeStateObj = indiaStatesDistricts.find((s) => s.state === state);
  const districtsList = activeStateObj ? activeStateObj.districts : [];

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
      const fullMobile = countryCode + mobile;
      const res = await sendAppreciationOtp(fullMobile, email);
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
      const fullMobile = countryCode + mobile;
      const res = await verifyAppreciationOtp(fullMobile, otpCode);
      if (res.success) {
        setOtpVerified(true);
        setSuccessMsg("Mobile and Email verified successfully!");
        setStep(3); // Auto-advance on success
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
      if (!/^\d{10}$/.test(mobile)) {
        setErrorMsg("Mobile number must be exactly 10 digits.");
        return;
      }
      if (whatsapp && !/^\d{10}$/.test(whatsapp)) {
        setErrorMsg("WhatsApp number must be exactly 10 digits.");
        return;
      }

      // DOB constraint
      const dobDate = new Date(dob);
      const dobYear = dobDate.getFullYear();
      const currentYear = new Date().getFullYear();
      if (isNaN(dobYear) || dobYear < 1920 || dobYear > currentYear) {
        setErrorMsg(`Please enter a valid Date of Birth (Year must be between 1920 and ${currentYear}).`);
        return;
      }

      // Email constraint
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMsg("Please enter a valid email address.");
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
      if (!address || !district || !state || !pincode || !socialWorkField || !description) {
        setErrorMsg("Please fill in all address and social work fields.");
        return;
      }
      if (socialWorkField === "Other Social Activism / Support Services" && !customSocialWorkField) {
        setErrorMsg("Please specify your custom social work field.");
        return;
      }
      if (country === "India" && !/^\d{6}$/.test(pincode)) {
        setErrorMsg("Pincode must be exactly 6 digits for India.");
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

    if (!photo || !idProof) {
      setErrorMsg("Please upload your Passport Photo and Govt Identity Proof.");
      return;
    }

    if (!isLoggedIn) {
      if (!password || !confirmPassword) {
        setErrorMsg("Please select and confirm a password for your account.");
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
      formData.append("country", country);
      formData.append("mobile", countryCode + mobile);
      formData.append("whatsapp", whatsapp ? (whatsappCountryCode + whatsapp) : (countryCode + mobile));
      formData.append("email", email);
      formData.append("otpCode", otpCode);
      formData.append("address", address);
      formData.append("district", district);
      formData.append("state", state);
      formData.append("pincode", pincode);
      formData.append("socialWorkField", socialWorkField === "Other Social Activism / Support Services" ? customSocialWorkField : socialWorkField);
      formData.append("description", description);
      formData.append("photo", photo);
      formData.append("idProof", idProof);
      if (achievementProof) {
        formData.append("achievementProof", achievementProof);
      }
      if (!isLoggedIn) {
        formData.append("password", password);
      }

      const res = await submitAppreciationApplication(null, formData);

      if (res.success && res.checkoutUrl) {
        setSuccessMsg(res.message || "Application logged. Redirecting to payment...");
        setTimeout(() => {
          router.push(res.checkoutUrl);
        }, 1500);
      } else {
        setErrorMsg(res.error || "Submission failed. Please check details.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Visual background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[8%] right-[5%] w-[800px] h-[500px] rounded-full bg-[#001C55]/[0.02] blur-[140px]" />
        <div className="absolute bottom-[10%] left-[2%] w-[600px] h-[600px] rounded-full bg-[#C00000]/[0.015] blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#001C55]/10 to-[#C00000]/5 border border-slate-200 flex items-center justify-center">
              <img src="/logo.png" className="w-7 h-7 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#001C55] font-bold text-xs tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[8px] text-[#C00000] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-650 hover:text-[#001C55] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Form container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 z-10">
        <div className="mb-8 text-center">
          <span className="px-3 py-1 rounded-full bg-[#001C55]/5 border border-[#001C55]/10 text-[#001C55] text-[10px] font-bold uppercase tracking-wider">
            Certificate of Appreciation
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#001C55] mt-2">Appreciation Certificate Application</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5">Apply for formal recognition and appreciation of social activism or outstanding services.</p>
        </div>

        {/* Progress Tracker */}
        <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-center justify-around shadow-sm">
          {[
            { label: "Personal", stepNo: 1 },
            { label: "Verify", stepNo: 2 },
            { label: "Activities", stepNo: 3 },
            { label: "Documents", stepNo: 4 }
          ].map((st) => (
            <div key={st.stepNo} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                step >= st.stepNo ? "bg-[#001C55] text-white ring-4 ring-[#001C55]/10" : "bg-slate-100 text-slate-400"
              }`}>
                {step > st.stepNo ? <Check className="w-3 h-3 text-white" /> : st.stepNo}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${
                step >= st.stepNo ? "text-[#001C55]" : "text-slate-400"
              }`}>{st.label}</span>
            </div>
          ))}
        </div>

        {/* Form panel */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-8 shadow-sm">
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
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-4">Step 1: Applicant Profile</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Country *</label>
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      if (e.target.value === "India") {
                        setCountryCode("+91");
                        setWhatsappCountryCode("+91");
                      }
                    }}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] bg-white"
                  >
                    {countriesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {country === "India" ? "Full Name (as in Aadhaar) *" : "Full Name (as in Passport/Govt ID) *"}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoggedIn}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] disabled:bg-slate-50"
                    placeholder="e.g. Ramesh Kumar Gupta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Father's / Spouse's Name *</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                    placeholder="e.g. Shri Vijay Kumar Gupta"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] bg-white"
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
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mobile Number *</label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-24 px-2 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] bg-white shrink-0"
                      >
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US/CA)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+61">+61 (AU)</option>
                        <option value="+971">+971 (AE)</option>
                        <option value="+92">+92 (PK)</option>
                        <option value="+880">+880 (BD)</option>
                        <option value="+977">+977 (NP)</option>
                        <option value="+94">+94 (LK)</option>
                        <option value="+65">+65 (SG)</option>
                        <option value="+49">+49 (DE)</option>
                      </select>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").substring(0, 10))}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">WhatsApp Number</label>
                    <div className="flex gap-2">
                      <select
                        value={whatsappCountryCode}
                        onChange={(e) => setWhatsappCountryCode(e.target.value)}
                        className="w-24 px-2 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] bg-white shrink-0"
                      >
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US/CA)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+61">+61 (AU)</option>
                        <option value="+971">+971 (AE)</option>
                        <option value="+92">+92 (PK)</option>
                        <option value="+880">+880 (BD)</option>
                        <option value="+977">+977 (NP)</option>
                        <option value="+94">+94 (LK)</option>
                        <option value="+65">+65 (SG)</option>
                        <option value="+49">+49 (DE)</option>
                      </select>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, "").substring(0, 10))}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="10-digit whatsapp number (Optional)"
                      />
                    </div>
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
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] disabled:bg-slate-50"
                    placeholder="e.g. ramesh.gupta@gmail.com"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Verification */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-4">Step 2: Contact Verification</h3>
                
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/65 text-xs text-slate-600 leading-relaxed">
                  To ensure security, we verify your email address. Click &ldquo;Send OTP Code&rdquo; below, and we will send a 6-digit confirmation code to your email <strong className="text-slate-800">{email}</strong>.
                </div>

                {!otpSent ? (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      className="px-6 py-3 rounded-lg bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-[0_4px_12px_rgba(0, 28, 85,0.15)] disabled:opacity-50"
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
                        className="text-[10px] font-bold text-[#C00000] hover:underline uppercase tracking-wider disabled:opacity-50"
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
                        className="w-full text-center tracking-[12px] text-lg font-bold px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
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

            {/* Step 3: Address & Activities details */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-4">Step 3: Residential & Social Contributions</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Residential Address *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                    placeholder="e.g. Makan No. 12, Shiv Colony, Kanpur"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">State *</label>
                    {country === "India" ? (
                      <select
                        value={state}
                        onChange={(e) => {
                          setState(e.target.value);
                          setDistrict(""); // Reset district
                        }}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] bg-white"
                      >
                        <option value="">Select State</option>
                        {indiaStatesDistricts.map((st) => (
                          <option key={st.state} value={st.state}>{st.state}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="e.g. California"
                      />
                    )}
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">District *</label>
                    {country === "India" ? (
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        required
                        disabled={!state}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] bg-white disabled:bg-slate-50"
                      >
                        <option value="">Select District</option>
                        {districtsList.map((dist) => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="e.g. Los Angeles"
                      />
                    )}
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {country === "India" ? "Pincode *" : "Zip Code *"}
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                      maxLength={country === "India" ? 6 : 12}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                      placeholder={country === "India" ? "e.g. 110001" : "e.g. 90210"}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Primary Field of Social Work *</label>
                    <select
                      value={socialWorkField}
                      onChange={(e) => setSocialWorkField(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] bg-white"
                    >
                      {SOCIAL_WORK_FIELDS.map((field) => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>

                  {socialWorkField === "Other Social Activism / Support Services" && (
                    <div className="animate-fadeIn">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Specify Field of Work *</label>
                      <input
                        type="text"
                        value={customSocialWorkField}
                        onChange={(e) => setCustomSocialWorkField(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="e.g. Animal Welfare, Senior Citizen Support"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Summary of Achievements & Contributions *</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={4}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                      placeholder="Please summarize your social achievements, awards, and contributions to society..."
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
                  <div className="border border-slate-200 rounded-xl p-4 text-center hover:border-[#001C55]/30 transition-all flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Passport Photo *</span>
                    <label className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 text-slate-600 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Upload className="w-5 h-5 text-sky-600" />
                    </label>
                    <span className="text-[10px] text-slate-400 mt-2 block overflow-hidden max-w-full text-ellipsis whitespace-nowrap">
                      {photo ? photo.name : "JPEG/PNG (Max 2MB)"}
                    </span>
                  </div>

                  {/* ID Proof */}
                  <div className="border border-slate-200 rounded-xl p-4 text-center hover:border-[#001C55]/30 transition-all flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      {country === "India" ? "Aadhaar Card *" : "Identity Proof (Passport/ID) *"}
                    </span>
                    <label className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 text-slate-600 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => setIdProof(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </label>
                    <span className="text-[10px] text-slate-400 mt-2 block overflow-hidden max-w-full text-ellipsis whitespace-nowrap">
                      {idProof ? idProof.name : "JPEG/PNG/PDF (Max 5MB)"}
                    </span>
                  </div>

                  {/* Achievement Proof */}
                  <div className="border border-slate-200 rounded-xl p-4 text-center hover:border-[#001C55]/30 transition-all flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Achievement Proof</span>
                    <label className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 text-slate-600 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => setAchievementProof(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <Upload className="w-5 h-5 text-rose-600" />
                    </label>
                    <span className="text-[10px] text-slate-400 mt-2 block overflow-hidden max-w-full text-ellipsis whitespace-nowrap">
                      {achievementProof ? achievementProof.name : "JPEG/PNG/PDF (Max 10MB)"}
                    </span>
                  </div>
                </div>

                {/* Password setup if not logged in */}
                {!isLoggedIn && (
                  <div className="border-t pt-4 mt-4 space-y-3">
                    <div className="p-3 bg-amber-50 rounded-lg text-[10px] text-amber-800 border border-amber-200 leading-normal flex items-start gap-2">
                      <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Setup a password to create your portal account. This allows you to log in and track the status of your appreciation application later.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Choose Password *</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] pr-10"
                            placeholder="Min 8 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirm Password *</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] pr-10"
                            placeholder="Re-enter password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                  <p><strong>Note:</strong> Applying for a Certificate of Appreciation requires a processing fee of <strong>INR 1,500.00</strong>. Clicking submit will redirect you to PhonePe secure checkout.</p>
                </div>
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="border-t pt-6 flex justify-between items-center gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-5 py-2.5 rounded-lg bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-[0_4px_12px_rgba(0, 28, 85,0.1)]"
                >
                  Next Step <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-[0_4px_12px_rgba(16, 185, 129,0.15)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Submit & Pay Fee
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-450">
          &copy; {new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
