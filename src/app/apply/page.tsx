"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { sendMembershipOtp, verifyMembershipOtp, submitMembershipApplication } from "./actions";
import { ArrowLeft, ArrowRight, Loader2, Check, AlertCircle, FileText, Upload, Shield, Eye, EyeOff } from "lucide-react";

import { indiaStatesDistricts, countriesList } from "@/lib/data/indiaStatesDistricts";

const DESIGNATIONS = [
  "DIRECTOR", "ADD DIRECTOR", "National President", "PRESIDENT", "Secretary",
  "Executive President", "Chief Executive Officer", "Deputy Executive President",
  "Vice President", "Deputy Vice President", "General Secretary", "National Secretary",
  "National Co-ordinator", "Chief Secretary", "Deputy Chief Secretary", "Joint Secretary",
  "Chief Observer", "Deputy Chief Observer", "Chief Reporting Officer",
  "Deputy Chief Reporting Officer", "Chief Co-ordinator", "Co-ordinator",
  "Deputy Chief Co-ordinator", "Minority Welfare Secretary", "Women Empowerment Secretary",
  "Social Welfare Secretary", "Consumer Welfare Secretary", "Human Welfare Secretary",
  "Administrative Secretary", "Information Secretary", "Organising Secretary",
  "Legal Advisor", "Social Media Activist", "Human Rights Activist", "Member",
  "RTI Activist", "Nodal Officer", "Social Activist", "Brand Ambassador",
  "Spokesperson", "Content Writer", "System Administrator", "General Counsel",
  "IT Cell Incharge", "YouTube Media Partner", "Chartered Accountant", "Other"
];

const PROFESSIONS = [
  "Service", "Business", "Private Sector", "Government Sector", "House Wife", "Retired", "Unemployed", "Student"
];

const EDUCATION_OPTIONS = [
  "High School (10th)",
  "Intermediate (12th)",
  "Diploma",
  "B.A. (Bachelor of Arts)",
  "B.Sc. (Bachelor of Science)",
  "B.Com. (Bachelor of Commerce)",
  "B.Tech. (Bachelor of Technology)",
  "B.C.A. (Bachelor of Computer Applications)",
  "B.B.A. (Bachelor of Business Administration)",
  "LLB (Bachelor of Laws)",
  "BA LLB (Integrated Law)",
  "B.Ed. (Bachelor of Education)",
  "M.A. (Master of Arts)",
  "M.Sc. (Master of Science)",
  "M.Com. (Master of Commerce)",
  "M.Tech. (Master of Technology)",
  "M.C.A. (Master of Computer Applications)",
  "M.B.A. (Master of Business Administration)",
  "LLM (Master of Laws)",
  "Ph.D. (Doctor of Philosophy)",
  "Other"
];

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
  const [country, setCountry] = useState<string>("India");
  const [countryCode, setCountryCode] = useState<string>("+91");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState<string>("+91");
  const [mobile, setMobile] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [joiningType, setJoiningType] = useState<"direct" | "referred">("direct");
  const [referralCode, setReferralCode] = useState<string>("");

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
  const [showEduDropdown, setShowEduDropdown] = useState<boolean>(false);
  const [profession, setProfession] = useState<string>("Service");
  const [workingArea, setWorkingArea] = useState<string>("");
  const [designation, setDesignation] = useState<string>("Member");
  const [policeStation, setPoliceStation] = useState<string>("");

  // Pledge Checkboxes
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [agreePledge, setAgreePledge] = useState<boolean>(false);
  const [declareCorrect, setDeclareCorrect] = useState<boolean>(false);

  // Documents
  const [photo, setPhoto] = useState<File | null>(null);
  const [aadhaar, setAadhaar] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
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
      const res = await sendMembershipOtp(fullMobile, email);
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
      const res = await verifyMembershipOtp(fullMobile, otpCode);
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
      if (country === "India" && !/^\d{10}$/.test(mobile)) {
        setErrorMsg("Mobile number must be exactly 10 digits for India.");
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
      if (!address || !district || !state || !pincode || !education || !profession || !workingArea || !designation || !policeStation) {
        setErrorMsg("Please fill in all address, professional, and police station fields.");
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

    if (!photo || !aadhaar || !signature) {
      setErrorMsg("All documents (Photo, Aadhaar Card, Signature) must be uploaded.");
      return;
    }

    if (!agreeTerms || !agreePledge || !declareCorrect) {
      setErrorMsg("You must read and agree to all terms, pledges, and declarations.");
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

    if (joiningType === "referred" && !referralCode.trim()) {
      setErrorMsg("Please enter a Referral Member ID.");
      return;
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
      formData.append("education", education);
      formData.append("profession", profession);
      formData.append("workingArea", workingArea);
      formData.append("designation", designation);
      formData.append("policeStation", policeStation);
      formData.append("photo", photo);
      formData.append("aadhaar", aadhaar);
      formData.append("signature", signature);
      if (joiningType === "referred") {
        formData.append("referralCode", referralCode.trim());
      }
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
        <div className="absolute top-[15%] left-[5%] w-[600px] h-[600px] rounded-full bg-[#001C55]/[0.02] blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[500px] rounded-full bg-[#C00000]/[0.01] blur-[120px]"></div>
      </div>

      <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-md z-50 sticky top-0 shadow-sm">
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
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#001C55] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Cancel Application
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 z-10">
        {/* Progress Tracker header */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#001C55]">NGO Membership Enrollment</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">Become a certified member & human rights advocate in DKFFJ.</p>

          <div className="flex items-center justify-center gap-2 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <React.Fragment key={i}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                    step === i
                      ? "bg-[#001C55] text-white border-[#001C55] scale-110 shadow-sm"
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
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-4">Step 1: Personal Profile</h3>
                
                {/* Formal Letter Introduction */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 text-xs leading-relaxed space-y-2.5 mb-6 shadow-inner font-sans">
                  <div className="font-bold text-[#001C55]">To,</div>
                  <div className="font-bold pl-3">The Director,</div>
                  <div className="font-bold pl-3">DK Foundation of Freedom and Justice</div>
                  <div className="font-bold border-y py-1.5 my-2 border-slate-200/80 uppercase text-[10px] tracking-wide text-slate-650">
                    Subject: Application for Membership in DK Foundation of Freedom and Justice
                  </div>
                  <div className="font-bold">Dear Sir,</div>
                  <p className="text-slate-600 italic text-[11px] leading-relaxed">
                    I wish to join the DK Foundation of Freedom and Justice. Please find my personal, contact, and professional details below for your review.
                  </p>
                </div>

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
                        onChange={(e) => setMobile(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder={country === "India" ? "e.g. 9876543210" : "Enter mobile number"}
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
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="Same as mobile if blank"
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

                {/* Referral Attribution */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    How are you joining DKFFJ? *
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${joiningType === 'direct' ? 'border-[#001C55] bg-[#001C55]/5 ring-1 ring-[#001C55]' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                      <input
                        type="radio"
                        name="joiningType"
                        value="direct"
                        checked={joiningType === 'direct'}
                        onChange={() => setJoiningType('direct')}
                        className="text-[#001C55] focus:ring-[#001C55] h-4 w-4"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Direct Joining</p>
                        <p className="text-[10px] text-slate-500">I am joining independently</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${joiningType === 'referred' ? 'border-[#001C55] bg-[#001C55]/5 ring-1 ring-[#001C55]' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                      <input
                        type="radio"
                        name="joiningType"
                        value="referred"
                        checked={joiningType === 'referred'}
                        onChange={() => setJoiningType('referred')}
                        className="text-[#001C55] focus:ring-[#001C55] h-4 w-4"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Referred by Member</p>
                        <p className="text-[10px] text-slate-500">I was introduced by a member</p>
                      </div>
                    </label>
                  </div>

                  {joiningType === 'referred' && (
                    <div className="pt-2 animate-fadeIn">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Referral Member ID *
                      </label>
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        required={joiningType === 'referred'}
                        placeholder="e.g. DKM00021"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] bg-white uppercase"
                      />
                      <p className="text-[10px] text-slate-500 mt-1 italic">
                        Enter the unique Membership Number (DKMxxxx) of the member who referred you.
                      </p>
                    </div>
                  )}
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

            {/* Step 3: Address & Profession */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2 mb-4">Step 3: Residential & Professional Info</h3>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 mt-4">
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Highest Education *</label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => {
                        setEducation(e.target.value);
                        setShowEduDropdown(true);
                      }}
                      onFocus={() => setShowEduDropdown(true)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                      placeholder="Type or select education degree"
                    />
                    {showEduDropdown && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowEduDropdown(false)} 
                        />
                        <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg z-25 animate-fadeIn">
                          {EDUCATION_OPTIONS.filter((opt) =>
                            opt.toLowerCase().includes(education.toLowerCase())
                          ).length > 0 ? (
                            EDUCATION_OPTIONS.filter((opt) =>
                              opt.toLowerCase().includes(education.toLowerCase())
                            ).map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setEducation(opt);
                                  setShowEduDropdown(false);
                                }}
                                className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                              >
                                {opt}
                              </button>
                            ))
                          ) : (
                            <div className="px-3.5 py-2.5 text-xs text-slate-500 italic">
                              No matches. Press Enter or click outside to use custom: &quot;{education}&quot;
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Profession *</label>
                    <select
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] bg-white"
                    >
                      {PROFESSIONS.map((prof) => (
                        <option key={prof} value={prof}>{prof}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Working Area *</label>
                    <input
                      type="text"
                      value={workingArea}
                      onChange={(e) => setWorkingArea(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                      placeholder="e.g. Local District, State Level"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Please Enroll me As *</label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] bg-white"
                    >
                      {DESIGNATIONS.map((desg) => (
                        <option key={desg} value={desg}>{desg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nearest Police Station *</label>
                    <input
                      type="text"
                      value={policeStation}
                      onChange={(e) => setPoliceStation(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                      placeholder="Nearest police station name"
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
                      <Upload className="w-5 h-5" />
                    </label>
                    <span className="text-[10px] text-slate-400 mt-2 block overflow-hidden max-w-full text-ellipsis whitespace-nowrap">
                      {photo ? photo.name : "JPEG/PNG (Max 2MB)"}
                    </span>
                  </div>

                  {/* Aadhaar / Identity Proof */}
                  <div className="border border-slate-200 rounded-xl p-4 text-center hover:border-[#001C55]/30 transition-all flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      {country === "India" ? "Aadhaar Card *" : "Identity Proof (Passport/Govt ID) *"}
                    </span>
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
                  <div className="border border-slate-200 rounded-xl p-4 text-center hover:border-[#001C55]/30 transition-all flex flex-col items-center">
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
                      <Shield className="w-4 h-4 text-[#001C55] shrink-0" />
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
                          className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
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
                          className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
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

                {/* Legal Declarations & Pledges */}
                <div className="border-t pt-5 mt-5 space-y-4 text-xs font-sans text-left">
                  <div className="flex items-center gap-2 text-slate-700 font-bold mb-2">
                    <Shield className="w-4 h-4 text-[#001C55] shrink-0" />
                    <span className="uppercase tracking-wider">Rules, Regulations & Pledge Declaration</span>
                  </div>

                  {/* Rules Container */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">1. Rules & Regulations of DKFFJ</label>
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl max-h-36 overflow-y-auto text-slate-600 leading-relaxed font-sans space-y-2.5">
                      <p className="font-semibold text-slate-800 text-[11px]">I, the undersigned member, pledge to abide by the rules and regulations of DK Foundation of Freedom and Justice and adhere to the following:</p>
                      <ul className="list-disc pl-4 space-y-1.5 text-[11px]">
                        <li>(a) The above statements are correct.</li>
                        <li>(b) I declare that I will never be involved in any criminal, economic, and social crimes and have never been punished for any crime. I will remain in society as a hardworking, dutiful, honest, and loyal social worker. Human rights protection and social service is the main goal of my life.</li>
                        <li>(c) I will never request a refund or adjustment of the membership fee paid by me to DK Foundation of Freedom and Justice, nor shall I ever seek any action against DK Foundation. I will not ask for a refund of the fee.</li>
                        <li>(d) If I do not fulfill the responsibilities given by DK Foundation on time, and DK Foundation cancels my nomination, I will accept it.</li>
                        <li>(e) I undertake that I will always work as a strong worker for the objectives of DK Foundation of Freedom and Justice and follow the guidance and guidelines of the Honorable Director, CEO, and higher officials.</li>
                        <li>(f) I will always strive for human upliftment.</li>
                        <li>(g) I will accept the warning of the Honorable Director, CEO, National General Secretary, and National Secretary for opposing the objectives of DK Foundation of Freedom and Justice and the instructions of its office bearers as a disciplined member.</li>
                      </ul>
                    </div>
                    <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#001C55] focus:ring-[#001C55]/25"
                      />
                      <span className="text-slate-600 font-bold leading-normal select-none text-[11px]">I have read and agree to all the Terms and Conditions / Rules & Regulations listed above. *</span>
                    </label>
                  </div>

                  {/* Pledge Container */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">2. Impartiality & Loyalty Pledge</label>
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-600 leading-relaxed font-sans space-y-2 text-[11px]">
                      <p>I hereby pledge to uphold the constitution of India and sincerely follow and abide by the objectives and ideals of DK Foundation of Freedom and Justice. I declare that I am not a part of any organisation that will jeopardize the DK Foundation of Freedom and Justice's image of impartiality.</p>
                      <p>I also affirm that I will sincerely render my services without any vested interest and any type of claims and work solely in the interest of the above said organisation. I will not violate any norms of the above said organisation and the governing body of DK Foundation of Freedom and Justice is at liberty and has liberty to terminate my post and membership from the organisation immediately without any notice. I shall have no claim whatsoever.</p>
                    </div>
                    <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={agreePledge}
                        onChange={(e) => setAgreePledge(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#001C55] focus:ring-[#001C55]/25"
                      />
                      <span className="text-slate-600 font-bold leading-normal select-none text-[11px]">I solemnly pledge and agree to the declaration of impartiality and membership terms. *</span>
                    </label>
                  </div>

                  {/* Truthfulness Declaration */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={declareCorrect}
                        onChange={(e) => setDeclareCorrect(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#001C55] focus:ring-[#001C55]/25"
                      />
                      <span className="text-slate-600 font-bold leading-normal select-none text-[11px]">I hereby declare that the information provided by me in this application is true and correct. *</span>
                    </label>
                  </div>
                </div>
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
                  className="px-5 py-2.5 bg-[#001C55] text-white rounded-lg text-xs font-bold text-white hover:bg-[#001236] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  Next Step <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#C00000] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#990000] transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(192, 0, 0,0.2)] disabled:opacity-50"
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
