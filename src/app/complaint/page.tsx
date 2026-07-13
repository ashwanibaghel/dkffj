"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitComplaint, sendComplaintOtp, verifyComplaintOtp } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Loader2, Check, AlertCircle, FileText, Upload, Trash2, KeyRound, ShieldCheck } from "lucide-react";
import { indiaStatesDistricts, countriesList } from "@/lib/data/indiaStatesDistricts";

const incidentCategories = [
  "BUSINESS AND HUMAN RIGHTS",
  "CHILDREN",
  "EDUCATIONAL INSTITUTIONS/TECHNICAL INSTITUTIONS (GOVT./PVT.)",
  "FOREIGNER'S/NRI",
  "COMMUNAL VIOLENCE",
  "DOMESTIC VIOLENCE",
  "DOWRY RELATED ISSUE",
  "SUSPECIOUS DEATH",
  "LABOUR ISSUE",
  "JAIL",
  "JUDICIARY",
  "LABOUR",
  "LGBTI RIGHTS",
  "MAFIAS/UNDERWORLD",
  "MINORITIES",
  "MISCELLENOUS",
  "OBC",
  "POLICE",
  "POLLUTION/ECOLOGY/ENVIRONMENT",
  "REFUGEES/MIGRANTS/IDPs",
  "RELIGION/COMMUNAL VOLIENCE",
  "RIOTS",
  "SC/ST",
  "SERVICE MATTERS",
  "VIOLATION OF HUMAN RIGHTS ON HIGH SEAS",
  "WOMEN"
];

export default function ComplaintPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [docketNo, setDocketNo] = useState<string>("");

  // Section 1: Grievant Profile & Contact States
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [fatherName, setFatherName] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [gender, setGender] = useState<string>("Male");
  const [profession, setProfession] = useState<string>("Service");
  const [mobile, setMobile] = useState<string>("");
  const [whatsappNo, setWhatsappNo] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [country, setCountry] = useState<string>("India");
  const [countryCode, setCountryCode] = useState<string>("+91");

  // Email OTP States
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [otpSending, setOtpSending] = useState<boolean>(false);
  const [otpVerifying, setOtpVerifying] = useState<boolean>(false);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>("");
  const [otpSuccess, setOtpSuccess] = useState<string>("");

  // Section 2: Incident Details
  const [incidentCategory, setIncidentCategory] = useState<string>("");
  const [incidentDate, setIncidentDate] = useState<string>("");
  const [details, setDetails] = useState<string>("");

  // Section 3: Evidence Files
  const [aadhaarCardFile, setAadhaarCardFile] = useState<File | null>(null);
  const [evidenceCopyFile, setEvidenceCopyFile] = useState<File | null>(null);
  const [supportingProofFile, setSupportingProofFile] = useState<File | null>(null);

  // Section 4: Address Details
  const [landmark, setLandmark] = useState<string>("");
  const [postOffice, setPostOffice] = useState<string>("");
  const [tehsil, setTehsil] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [policeStation, setPoliceStation] = useState<string>("");

  // Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(false);

  const activeStateObj = indiaStatesDistricts.find((s) => s.state === state);
  const districtsList = activeStateObj ? activeStateObj.districts : [];

  // Check login to pre-fill email if possible
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        if (user.user_metadata?.full_name) {
          const names = user.user_metadata.full_name.split(" ");
          setFirstName(names[0] || "");
          setLastName(names.slice(1).join(" ") || "");
        }
      }
    };
    checkUser();
  }, []);

  // Handle OTP Sending
  const handleSendOtp = async () => {
    setOtpError("");
    setOtpSuccess("");
    if (!email) {
      setOtpError("Email address is mandatory for OTP verification.");
      return;
    }
    setOtpSending(true);
    try {
      const res = await sendComplaintOtp(mobile ? (countryCode + mobile) : "0000000000", email);
      if (res.success) {
        setOtpSent(true);
        setOtpSuccess(res.message || "OTP code sent to your email.");
      } else {
        setOtpError(res.error || "Failed to send OTP.");
      }
    } catch (err: any) {
      setOtpError(err.message || "An error occurred while sending OTP.");
    } finally {
      setOtpSending(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = async () => {
    setOtpError("");
    setOtpSuccess("");
    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code.");
      return;
    }
    setOtpVerifying(true);
    try {
      const res = await verifyComplaintOtp(email, otpCode);
      if (res.success) {
        setEmailVerified(true);
        setOtpSuccess("Email verified successfully! You can now submit the grievance.");
      } else {
        setOtpError(res.error || "Invalid or expired OTP code.");
      }
    } catch (err: any) {
      setOtpError(err.message || "An error occurred during verification.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Handle submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!emailVerified) {
      setErrorMsg("Please verify your email address using OTP before submitting.");
      return;
    }

    if (!declarationAccepted) {
      setErrorMsg("You must accept the declaration to submit the complaint.");
      return;
    }

    if (!aadhaarCardFile) {
      setErrorMsg("Please upload a copy of your Aadhaar Card.");
      return;
    }

    if (
      !firstName ||
      !lastName ||
      !fatherName ||
      !dob ||
      !mobile ||
      !incidentCategory ||
      !incidentDate ||
      !details ||
      !landmark ||
      !postOffice ||
      !tehsil ||
      !state ||
      !district ||
      !pincode ||
      !policeStation
    ) {
      setErrorMsg("Please fill in all mandatory fields.");
      return;
    }

    if (country === "India" && !/^\d{10}$/.test(mobile)) {
      setErrorMsg("Mobile number must be exactly 10 digits for India.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("fatherName", fatherName);
      formData.append("dob", dob);
      formData.append("gender", gender);
      formData.append("profession", profession);
      formData.append("mobile", countryCode + mobile);
      formData.append("whatsappNo", countryCode + whatsappNo);
      formData.append("email", email);
      formData.append("incidentCategory", incidentCategory);
      formData.append("incidentDate", incidentDate);
      formData.append("details", details);
      formData.append("landmark", landmark);
      formData.append("postOffice", postOffice);
      formData.append("tehsil", tehsil);
      formData.append("state", state);
      formData.append("district", district);
      formData.append("pincode", pincode);
      formData.append("policeStation", policeStation);
      formData.append("country", country);

      // Files
      if (aadhaarCardFile) formData.append("aadhaarCard", aadhaarCardFile);
      if (evidenceCopyFile) formData.append("evidenceCopy", evidenceCopyFile);
      if (supportingProofFile) formData.append("supportingProof", supportingProofFile);

      const res = await submitComplaint(null, formData);

      if (res.success && res.complaintNo) {
        router.push(`/complaint/success?id=${res.complaintNo}&email=${encodeURIComponent(email)}`);
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
      {/* Background radial effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] right-[5%] w-[800px] h-[500px] rounded-full bg-[#C00000]/[0.015] blur-[120px]"></div>
        <div className="absolute bottom-[20%] left-[5%] w-[600px] h-[600px] rounded-full bg-[#001C55]/[0.02] blur-[100px]"></div>
      </div>

      <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-md z-50 sticky top-0">
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
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 z-10">
        {!docketNo ? (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#001C55]">Grievance Lodging Desk</h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">File an official human rights violation or legal case. Secure OTP email validation is enforced.</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-8 shadow-sm">
              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-100 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-8">
                
                {/* 1. Personal & contact profile */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-3">1. Grievant Information</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Country *</label>
                    <select
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        if (e.target.value === "India") {
                          setCountryCode("+91");
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">First Name *</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="e.g. Ramesh"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Surname *</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="e.g. Kumar"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Father&apos;s / Husband&apos;s Name *</label>
                      <input
                        type="text"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="Father's full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date Of Birth *</label>
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
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Profession *</label>
                      <select
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] bg-white"
                      >
                        <option value="Service">Service</option>
                        <option value="Business">Business</option>
                        <option value="Self Employed">Self Employed</option>
                        <option value="Student">Student</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mobile Number *</label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-20 px-1 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] bg-white shrink-0"
                        >
                          <option value="+91">+91 (IN)</option>
                          <option value="+1">+1 (US)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+971">+971 (AE)</option>
                        </select>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (countryCode === "+91") {
                              setMobile(val.slice(0, 10));
                            } else {
                              setMobile(val);
                            }
                          }}
                          required
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                          placeholder="10-digit number"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">WhatsApp Number</label>
                      <input
                        type="tel"
                        value={whatsappNo}
                        onChange={(e) => setWhatsappNo(e.target.value.replace(/\D/g, ""))}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="WhatsApp number (Optional)"
                      />
                    </div>
                  </div>

                  {/* Email & OTP Validation Widget */}
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address (For mandatory verification) *</label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailVerified(false);
                            setOtpSent(false);
                          }}
                          required
                          disabled={emailVerified}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] disabled:bg-white disabled:border-emerald-200"
                          placeholder="Enter your email"
                        />
                        {!emailVerified && (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={otpSending || !email}
                            className="bg-[#001C55] hover:bg-[#001236] text-white text-xs font-bold px-4 rounded-lg disabled:opacity-50 flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            {otpSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                            {otpSent ? "Resend" : "Send OTP"}
                          </button>
                        )}
                      </div>
                    </div>

                    {otpSent && !emailVerified && (
                      <div className="space-y-2 animate-fadeIn">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Enter 6-digit Verification OTP *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="w-40 px-3.5 py-2 rounded-lg border border-slate-200 text-center tracking-widest font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                            placeholder="000000"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={otpVerifying || otpCode.length !== 6}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 rounded-lg disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                          >
                            {otpVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Verify Code
                          </button>
                        </div>
                      </div>
                    )}

                    {emailVerified && (
                      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-xs font-bold animate-fadeIn">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Email address has been securely verified!</span>
                      </div>
                    )}

                    {otpError && (
                      <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{otpError}</p>
                    )}
                    {otpSuccess && !emailVerified && (
                      <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5"><Check className="w-3.5 h-3.5" />{otpSuccess}</p>
                    )}
                  </div>
                </div>

                {/* 2. Incident Details */}
                <div className="space-y-4 border-t pt-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-3">2. Incident Description</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Incident Category *</label>
                      <select
                        value={incidentCategory}
                        onChange={(e) => setIncidentCategory(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] bg-white font-medium"
                      >
                        <option value="">Select Grievance Category</option>
                        {incidentCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date of Occurrence *</label>
                      <input
                        type="date"
                        value={incidentDate}
                        onChange={(e) => setIncidentDate(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Details of Incident / Grievance *</label>
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      required
                      rows={5}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                      placeholder="Explain full incident description here..."
                    />
                  </div>
                </div>

                {/* 3. Evidence files */}
                <div className="space-y-4 border-t pt-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-3">3. Evidences & ID Proofs</h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* Aadhaar */}
                    <div className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-slate-800">Aadhaar Card Copy *</span>
                        <p className="text-[10px] text-slate-400">Upload Aadhaar card image or PDF (max 10MB)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setAadhaarCardFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                          <Upload className="w-3.5 h-3.5" /> {aadhaarCardFile ? "Change" : "Upload File"}
                        </label>
                        {aadhaarCardFile && (
                          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold max-w-[150px]">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{aadhaarCardFile.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Evidence */}
                    <div className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-slate-800">Main Evidence file / Complaint Copy</span>
                        <p className="text-[10px] text-slate-400">Photos, video clips, or written complaint doc (max 20MB)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border">
                          <input
                            type="file"
                            accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(e) => setEvidenceCopyFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                          <Upload className="w-3.5 h-3.5" /> {evidenceCopyFile ? "Change" : "Upload File"}
                        </label>
                        {evidenceCopyFile && (
                          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold max-w-[150px]">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{evidenceCopyFile.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Supporting proof */}
                    <div className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-slate-800">Additional Supporting Proof (Optional)</span>
                        <p className="text-[10px] text-slate-400">Witness statement, extra photos/audios (max 10MB)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border">
                          <input
                            type="file"
                            accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(e) => setSupportingProofFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                          <Upload className="w-3.5 h-3.5" /> {supportingProofFile ? "Change" : "Upload File"}
                        </label>
                        {supportingProofFile && (
                          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold max-w-[150px]">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{supportingProofFile.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Address Details (At the bottom) */}
                <div className="space-y-4 border-t pt-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-3">4. Incident Occurrence Address</h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Landmark and Street *</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                      placeholder="e.g. Near Hanuman Mandir, Sector 4"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Post Office *</label>
                      <input
                        type="text"
                        value={postOffice}
                        onChange={(e) => setPostOffice(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="Post Office name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tehsil *</label>
                      <input
                        type="text"
                        value={tehsil}
                        onChange={(e) => setTehsil(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="Tehsil name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">State *</label>
                      {country === "India" ? (
                        <select
                          value={state}
                          onChange={(e) => {
                            setState(e.target.value);
                            setDistrict("");
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
                          placeholder="State"
                        />
                      )}
                    </div>
                    <div>
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
                          placeholder="District"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pincode *</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="6-digit pincode"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nearest Police Station (Thana) *</label>
                    <input
                      type="text"
                      value={policeStation}
                      onChange={(e) => setPoliceStation(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                      placeholder="e.g. Kalyanpur Thana"
                    />
                  </div>
                </div>

                {/* Declaration Checkbox */}
                <div className="border-t pt-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={declarationAccepted}
                      onChange={(e) => setDeclarationAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 text-[#001C55] rounded border-slate-300 focus:ring-2 focus:ring-[#001C55]/20 cursor-pointer"
                    />
                    <span className="text-xs text-slate-500 font-semibold leading-relaxed">
                      I hereby declare that all the information provided above is correct and true to the best of my knowledge. I understand that filing false complaints is a legal offense.
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <div className="border-t pt-6 mt-6">
                  <button
                    type="submit"
                    disabled={loading || !emailVerified || !declarationAccepted}
                    className="w-full py-3.5 bg-[#C00000] text-white hover:bg-[#990000] text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(192,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Securing Grievance Record...
                      </>
                    ) : (
                      <>
                        Submit Grievance Docket
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </>
        ) : (
          /* Success Panel */
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-serif font-bold text-slate-800">Grievance Registered Successfully</h2>
            <p className="text-xs text-slate-500 mt-2">
              Your grievance details and attachments have been secured in our portal.
            </p>

            <div className="bg-slate-50 border border-dashed rounded-xl p-4 my-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grievance Docket Number</span>
              <span className="text-xl font-mono font-extrabold text-[#C00000] mt-1 block">{docketNo}</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Please note down this docket number. You can track investigation logs, findings, and case updates at our status tracker.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/track?type=complaint&id=${docketNo}`}
                className="px-6 py-2.5 rounded-lg bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold transition-all shadow-[0_4px_12px_rgba(0,28,85,0.15)]"
              >
                Track Status Now
              </Link>
              <Link
                href="/"
                className="px-6 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-all"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
