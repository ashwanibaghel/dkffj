"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  submitAffiliationApplication,
  sendAffiliationEmailOtp,
  verifyAffiliationEmailOtp
} from "./actions";
import {
  Building2,
  User,
  BookOpen,
  Cpu,
  Upload,
  FileCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  KeyRound,
  RotateCcw,
  Mail,
  X,
  Info
} from "lucide-react";
import { indiaStatesDistricts } from "@/lib/data/indiaStatesDistricts";
import { compressImage } from "@/lib/compressImage";

const STORAGE_KEY = "affiliation_form_draft_v1";

function loadDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export default function AffiliationApplyPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedAck, setCopiedAck] = useState(false);
  const [draftRestoredNote, setDraftRestoredNote] = useState(false);

  // Professional Toast Notification System
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Form Fields State
  // Section 1: Applicant
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("Director / Head of Institute");
  const [mobile, setMobile] = useState("");
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [idProofType, setIdProofType] = useState("Aadhaar");
  const [idProofLastFour, setIdProofLastFour] = useState("");
  const [authorizedSignatoryName, setAuthorizedSignatoryName] = useState("");

  // Email OTP Verification States
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Section 2: Institute
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("Computer & IT Training Center");
  const [organizationTypeOther, setOrganizationTypeOther] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [establishmentYear, setEstablishmentYear] = useState(new Date().getFullYear().toString());
  const [address, setAddress] = useState("");
  const [selectedState, setSelectedState] = useState("Uttar Pradesh");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [website, setWebsite] = useState("");

  // Section 3: Domains
  const [selectedDomains, setSelectedDomains] = useState<string[]>(["COMPUTER_IT"]);
  const [domainOther, setDomainOther] = useState("");

  // Section 4: Infrastructure
  const [selectedInfra, setSelectedInfra] = useState<string[]>(["CLASSROOM", "LAB", "INTERNET"]);
  const [studentCapacity, setStudentCapacity] = useState("50");

  // Section 5: Files
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [registrationCertificate, setRegistrationCertificate] = useState<File | null>(null);
  const [panCard, setPanCard] = useState<File | null>(null);
  const [idProofDoc, setIdProofDoc] = useState<File | null>(null);
  const [buildingInsidePhoto, setBuildingInsidePhoto] = useState<File | null>(null);
  const [buildingOutsidePhoto, setBuildingOutsidePhoto] = useState<File | null>(null);
  const [labPhoto, setLabPhoto] = useState<File | null>(null);

  // Section 6: Declaration
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // Result Modal
  const [submittedAppNo, setSubmittedAppNo] = useState<string | null>(null);
  const [warningNote, setWarningNote] = useState<string | null>(null);

  // Client-Side Hydration & Draft Restore
  useEffect(() => {
    setMounted(true);
    const draft = loadDraft();
    if (draft) {
      setDraftRestoredNote(true);
      setCurrentStep(draft.currentStep || 1);
      setFullName(draft.fullName || "");
      setDesignation(draft.designation || "Director / Head of Institute");
      setMobile(draft.mobile || "");
      setSameAsMobile(draft.sameAsMobile ?? true);
      setWhatsapp(draft.whatsapp || "");
      setEmail(draft.email || "");
      setIdProofType(draft.idProofType || "Aadhaar");
      setIdProofLastFour(draft.idProofLastFour || "");
      setAuthorizedSignatoryName(draft.authorizedSignatoryName || "");
      setOtpCode(draft.otpCode || "");
      setOtpSent(draft.otpSent || false);
      setOtpVerified(draft.otpVerified || false);
      setOrganizationName(draft.organizationName || "");
      setOrganizationType(draft.organizationType || "Computer & IT Training Center");
      setOrganizationTypeOther(draft.organizationTypeOther || "");
      setRegistrationNumber(draft.registrationNumber || "");
      setPanNumber(draft.panNumber || "");
      setEstablishmentYear(draft.establishmentYear || new Date().getFullYear().toString());
      setAddress(draft.address || "");
      setSelectedState(draft.selectedState || "Uttar Pradesh");
      setSelectedDistrict(draft.selectedDistrict || "");
      setPincode(draft.pincode || "");
      setWebsite(draft.website || "");
      setSelectedDomains(draft.selectedDomains || ["COMPUTER_IT"]);
      setDomainOther(draft.domainOther || "");
      setSelectedInfra(draft.selectedInfra || ["CLASSROOM", "LAB", "INTERNET"]);
      setStudentCapacity(draft.studentCapacity || "50");
    }
  }, []);

  // Available Districts based on selected State
  const stateObj = indiaStatesDistricts.find((s) => s.state.toLowerCase() === selectedState.toLowerCase());
  const availableDistricts = stateObj ? stateObj.districts : [];

  // Auto-Save Draft to LocalStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      const toSave = {
        currentStep,
        fullName,
        designation,
        mobile,
        sameAsMobile,
        whatsapp,
        email,
        idProofType,
        idProofLastFour,
        authorizedSignatoryName,
        otpCode,
        otpSent,
        otpVerified,
        organizationName,
        organizationType,
        organizationTypeOther,
        registrationNumber,
        panNumber,
        establishmentYear,
        address,
        selectedState,
        selectedDistrict,
        pincode,
        website,
        selectedDomains,
        domainOther,
        selectedInfra,
        studentCapacity,
        __savedAt: Date.now()
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (_) {}
  }, [
    mounted, currentStep, fullName, designation, mobile, sameAsMobile, whatsapp, email,
    idProofType, idProofLastFour, authorizedSignatoryName, otpCode, otpSent,
    otpVerified, organizationName, organizationType, organizationTypeOther,
    registrationNumber, panNumber, establishmentYear, address, selectedState,
    selectedDistrict, pincode, website, selectedDomains, domainOther,
    selectedInfra, studentCapacity
  ]);

  // Handle Email OTP Send
  const handleSendEmailOtp = async () => {
    setErrorMessage("");
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address before requesting OTP.");
      showToast("error", "Please enter a valid email address.");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await sendAffiliationEmailOtp(email);
      if (res.error) {
        setErrorMessage(res.error);
        showToast("error", res.error);
      } else {
        setOtpSent(true);
        showToast("success", res.message || `Verification OTP sent to ${email}.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send OTP to email.");
      showToast("error", "Failed to send OTP to email.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle Email OTP Verify
  const handleVerifyEmailOtp = async () => {
    setErrorMessage("");
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage("Please enter the 6-digit OTP code received on your Email.");
      showToast("error", "Please enter the 6-digit OTP code.");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await verifyAffiliationEmailOtp(email, otpCode);
      if (res.error) {
        setErrorMessage(res.error);
        showToast("error", res.error);
      } else {
        setOtpVerified(true);
        showToast("success", "Email Address Verified Successfully!");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Email OTP verification failed.");
      showToast("error", "Email OTP verification failed.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Domain Checkbox Handler
  const toggleDomain = (domainKey: string) => {
    if (selectedDomains.includes(domainKey)) {
      setSelectedDomains(selectedDomains.filter((d) => d !== domainKey));
    } else {
      setSelectedDomains([...selectedDomains, domainKey]);
    }
  };

  // Infra Checkbox Handler
  const toggleInfra = (infraKey: string) => {
    if (selectedInfra.includes(infraKey)) {
      setSelectedInfra(selectedInfra.filter((i) => i !== infraKey));
    } else {
      setSelectedInfra([...selectedInfra, infraKey]);
    }
  };

  // File Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void, labelName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("error", `${labelName} exceeds 5 MB limit. Please select a smaller file.`);
      e.target.value = "";
      return;
    }

    if (file.type.startsWith("image/")) {
      try {
        const compressed = await compressImage(file, 1200, 1200, 0.85);
        setter(compressed);
        showToast("info", `${labelName} selected and compressed successfully.`);
      } catch (_) {
        setter(file);
      }
    } else {
      setter(file);
      showToast("info", `${labelName} selected successfully.`);
    }
  };

  // Step Validation
  const validateCurrentStep = () => {
    setErrorMessage("");

    if (currentStep === 1) {
      if (!fullName.trim()) return "Applicant full name is required.";
      if (!designation.trim()) return "Applicant designation is required.";
      if (!mobile.trim() || mobile.length < 10) return "Please enter a valid 10-digit mobile number.";
      if (!email.trim() || !email.includes("@")) return "Please enter a valid email address.";
      if (!otpVerified) return "Please verify your Email ID with OTP before proceeding.";
      if (idProofLastFour.length !== 4 || !/^\d{4}$/.test(idProofLastFour)) return "ID proof last 4 digits must be 4 numbers.";
      if (!authorizedSignatoryName.trim()) return "Authorized signatory name is required.";
    }

    if (currentStep === 2) {
      if (!organizationName.trim()) return "Organization / Institute name is required.";
      if (organizationType === "Other" && !organizationTypeOther.trim()) return "Please specify your organization type.";
      if (!establishmentYear.trim()) return "Establishment year is required.";
      if (!address.trim()) return "Institute address is required.";
      if (!selectedState) return "Please select a state.";
      if (!selectedDistrict) return "Please select a district.";
      if (!pincode.trim() || pincode.length < 6) return "Please enter a valid 6-digit pincode.";
    }

    if (currentStep === 3) {
      if (selectedDomains.length === 0) return "Please select at least one training domain.";
      if (selectedDomains.includes("OTHER") && !domainOther.trim()) return "Please specify your other domain.";
    }

    if (currentStep === 4) {
      if (selectedInfra.length === 0) return "Please select at least one infrastructure item.";
    }

    if (currentStep === 5) {
      if (!passportPhoto) return "Passport Photo is required.";
      if (!idProofDoc) return "ID Proof Document is required.";
      if (!buildingInsidePhoto) return "Building Inside Photo is required.";
      if (!buildingOutsidePhoto) return "Building Outside Photo is required.";
    }

    return null;
  };

  const handleNextStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const err = validateCurrentStep();
    if (err) {
      setErrorMessage(err);
      showToast("error", err);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handlePrevStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Form Submit Handler — STRICTLY executed ONLY on Step 6
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent auto-submit if not on Step 6
    if (currentStep !== 6) {
      return;
    }

    setErrorMessage("");

    if (!declarationAccepted) {
      setErrorMessage("You must accept the declaration to submit.");
      showToast("error", "You must accept the declaration to submit.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("designation", designation);
      formData.append("mobile", mobile);
      formData.append("whatsapp", sameAsMobile ? mobile : whatsapp);
      formData.append("email", email);
      formData.append("idProofType", idProofType);
      formData.append("idProofLastFour", idProofLastFour);
      formData.append("authorizedSignatoryName", authorizedSignatoryName);

      formData.append("organizationName", organizationName);
      formData.append("organizationType", organizationType);
      formData.append("organizationTypeOther", organizationTypeOther);
      formData.append("registrationNumber", registrationNumber);
      formData.append("panNumber", panNumber);
      formData.append("establishmentYear", establishmentYear);
      formData.append("address", address);
      formData.append("state", selectedState);
      formData.append("district", selectedDistrict);
      formData.append("pincode", pincode);
      formData.append("website", website);
      formData.append("studentCapacity", studentCapacity);

      selectedDomains.forEach((d) => formData.append("domains", d));
      formData.append("domainOther", domainOther);

      selectedInfra.forEach((i) => formData.append("infrastructure", i));

      if (passportPhoto) formData.append("passportPhoto", passportPhoto);
      if (registrationCertificate) formData.append("registrationCertificate", registrationCertificate);
      if (panCard) formData.append("panCard", panCard);
      if (idProofDoc) formData.append("idProofDoc", idProofDoc);
      if (buildingInsidePhoto) formData.append("buildingInsidePhoto", buildingInsidePhoto);
      if (buildingOutsidePhoto) formData.append("buildingOutsidePhoto", buildingOutsidePhoto);
      if (labPhoto) formData.append("labPhoto", labPhoto);

      const res = await submitAffiliationApplication(formData);

      if (res.error) {
        setErrorMessage(res.error);
        showToast("error", res.error);
        setLoading(false);
      } else if (res.success && res.applicationNo) {
        clearDraft();
        setSubmittedAppNo(res.applicationNo);
        if (res.hasWarning && res.warningMessage) {
          setWarningNote(res.warningMessage);
        }
        showToast("success", `Draft Created! Redirecting to Payment... (${res.applicationNo})`);
        setLoading(false);
        if (res.affiliationId) {
          router.push(`/affiliation/payment?id=${res.affiliationId}`);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during submission.");
      showToast("error", err.message || "An error occurred during submission.");
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (submittedAppNo) {
      navigator.clipboard.writeText(submittedAppNo);
      setCopiedAck(true);
      showToast("success", "Application Number copied to clipboard!");
      setTimeout(() => setCopiedAck(false), 3000);
    }
  };

  const resetDraftSession = () => {
    clearDraft();
    setShowResetConfirmModal(false);
    showToast("info", "Form draft reset. Refreshing page...");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Sleek Floating Toast Banner */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-slideDown max-w-md w-full">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
              toast.type === "success"
                ? "bg-emerald-900 text-emerald-100 border-emerald-700"
                : toast.type === "error"
                ? "bg-rose-900 text-rose-100 border-rose-700"
                : "bg-slate-900 text-slate-100 border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {toast.type === "info" && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Custom Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900">Reset Form Draft?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to clear your saved form draft and start fresh? All un-submitted form entries will be erased.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={resetDraftSession}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#001C55]/10 to-[#C00000]/5 border border-slate-200 flex items-center justify-center">
              <img src="/logo.png" className="w-7 h-7 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#001C55] font-bold text-xs tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[8px] text-[#C00000] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {mounted && draftRestoredNote && (
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition-colors"
                title="Click to clear draft and start fresh"
              >
                <RotateCcw className="w-3 h-3" /> Reset Saved Draft
              </button>
            )}
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#001C55] hover:text-[#001C55]/80 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Title Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#001C55] text-xs font-bold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5 text-[#001C55]" /> Institutional Affiliation Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#001C55]">
            Application for Institute Affiliation
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Apply online for official affiliation with DK Foundation of Freedom and Justice to conduct authorized skill training and educational programs.
          </p>

          {mounted && draftRestoredNote && !submittedAppNo && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Form Auto-Saved: Your entries stay saved even if you refresh!
            </div>
          )}
        </div>

        {/* Success Modal */}
        {submittedAppNo ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl text-center max-w-xl mx-auto animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle className="w-9 h-9" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-2">
              Application Submitted Successfully
            </span>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-800">
              Affiliation Application Received!
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Your application for <strong>{organizationName}</strong> has been submitted. Please save your Tracking Application Number below.
            </p>

            <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tracking Application No</span>
                <p className="text-lg font-mono font-black text-[#001C55]">{submittedAppNo}</p>
              </div>
              <button
                type="button"
                onClick={copyToClipboard}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#001C55] hover:bg-[#001C55]/90 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {copiedAck ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedAck ? "Copied!" : "Copy Application No"}
              </button>
            </div>

            {warningNote && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-left text-xs">
                <strong>Notice:</strong> Your application has been logged for standard review. Note: {warningNote}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/affiliation/track?app=${submittedAppNo}&contact=${encodeURIComponent(email)}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wider uppercase shadow-md transition-all text-center"
              >
                Track Application Status
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold tracking-wider uppercase transition-all text-center"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
            {/* Step Progress Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Step {currentStep} of 6
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  {currentStep === 1 && "Applicant Representative & Email OTP"}
                  {currentStep === 2 && "Institute & Organization Details"}
                  {currentStep === 3 && "Training Domains"}
                  {currentStep === 4 && "Infrastructure & Facilities"}
                  {currentStep === 5 && "Document Uploads"}
                  {currentStep === 6 && "Review & Declaration"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${(currentStep / 6) * 100}%` }}
                ></div>
              </div>

              {/* Step Badges */}
              <div className="grid grid-cols-6 gap-1 mt-4 text-center">
                {[
                  { step: 1, label: "Applicant", icon: User },
                  { step: 2, label: "Institute", icon: Building2 },
                  { step: 3, label: "Domains", icon: BookOpen },
                  { step: 4, label: "Infra", icon: Cpu },
                  { step: 5, label: "Uploads", icon: Upload },
                  { step: 6, label: "Submit", icon: FileCheck }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentStep === item.step;
                  const isCompleted = currentStep > item.step;
                  return (
                    <div
                      key={item.step}
                      className={`flex flex-col items-center gap-1 cursor-pointer transition-opacity ${
                        isActive ? "opacity-100 font-bold" : isCompleted ? "opacity-90" : "opacity-40"
                      }`}
                      onClick={() => currentStep > item.step && setCurrentStep(item.step)}
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isActive
                            ? "bg-emerald-500 text-white shadow-md ring-2 ring-emerald-300"
                            : isCompleted
                            ? "bg-slate-700 text-emerald-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-[10px] hidden sm:block truncate max-w-full">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mx-6 mt-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Steps Body — Prevents Enter Key submit on earlier steps */}
            <form
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter" && currentStep < 6) {
                  e.preventDefault();
                }
              }}
              className="p-6 sm:p-8 space-y-6"
            >
              {/* STEP 1: Applicant Details & Email OTP */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-serif font-bold text-[#001C55]">Section 1: Applicant Representative Details</h3>
                    <p className="text-xs text-slate-500">Provide details of the authorized representative and verify official Email ID.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name of Applicant *</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Dr. Ramesh Kumar"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Designation in Institute *</label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Director / Principal / Chairman"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                        placeholder="10-digit mobile number"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address * <span className="text-[10px] text-slate-400 font-normal">(OTP Verification Required)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setOtpVerified(false);
                          }}
                          placeholder="official@institute.com"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          disabled={sendingOtp || otpVerified || !email || !email.includes("@")}
                          className="px-3.5 py-2.5 rounded-xl bg-[#001C55] hover:bg-[#001C55]/90 disabled:opacity-50 text-white text-xs font-bold transition-all shrink-0 inline-flex items-center gap-1"
                        >
                          {sendingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                          {otpSent ? "Resend OTP" : "Send Email OTP"}
                        </button>
                      </div>
                    </div>

                    {/* Email OTP Input Box */}
                    {otpSent && !otpVerified && (
                      <div className="sm:col-span-2 p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#001C55] flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4" /> Enter 6-Digit Email OTP Code
                          </label>
                          <span className="text-[10px] text-slate-500">Sent to {email}</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="Enter 6-digit Email OTP"
                            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-[#001C55] focus:outline-none bg-white"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyEmailOtp}
                            disabled={verifyingOtp || !otpCode || otpCode.length < 4}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shrink-0"
                          >
                            {verifyingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify Email OTP"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Email Verified Status Badge */}
                    {otpVerified && (
                      <div className="sm:col-span-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>✓ Email ID ({email}) Verified Successfully</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                      <div className="flex items-center gap-2 mb-1.5">
                        <input
                          type="checkbox"
                          id="sameAsMobile"
                          checked={sameAsMobile}
                          onChange={(e) => {
                            setSameAsMobile(e.target.checked);
                            if (e.target.checked) setWhatsapp(mobile);
                          }}
                          className="rounded text-[#001C55]"
                        />
                        <label htmlFor="sameAsMobile" className="text-[11px] text-slate-600 cursor-pointer">Same as Mobile Number</label>
                      </div>
                      {!sameAsMobile && (
                        <input
                          type="tel"
                          maxLength={10}
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                          placeholder="WhatsApp number"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ID Proof Type *</label>
                      <select
                        value={idProofType}
                        onChange={(e) => setIdProofType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none bg-white"
                      >
                        <option value="Aadhaar">Aadhaar Card</option>
                        <option value="PAN">PAN Card</option>
                        <option value="Voter ID">Voter ID Card</option>
                        <option value="Passport">Passport</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ID Proof Last 4 Digits * <span className="text-[10px] text-slate-400 font-normal">(Privacy Protected)</span>
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={idProofLastFour}
                        onChange={(e) => setIdProofLastFour(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 1234"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none font-mono font-bold tracking-widest"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Authorized Signatory Name *</label>
                      <input
                        type="text"
                        value={authorizedSignatoryName}
                        onChange={(e) => setAuthorizedSignatoryName(e.target.value)}
                        placeholder="Typed full name of signatory"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Institute Details */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-serif font-bold text-[#001C55]">Section 2: Institute & Organization Details</h3>
                    <p className="text-xs text-slate-500">Provide official details of the organization or training institute.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Institute Name *</label>
                      <input
                        type="text"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="e.g. ABC Computer Training Academy"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Organization Type *</label>
                      <select
                        value={organizationType}
                        onChange={(e) => setOrganizationType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none bg-white"
                      >
                        <option value="Computer & IT Training Center">Computer & IT Training Center</option>
                        <option value="Skill Development Institute">Skill Development Institute</option>
                        <option value="NGO / Social Organization">NGO / Social Organization</option>
                        <option value="Coaching Center">Coaching Center</option>
                        <option value="Craft & Vocational Center">Craft & Vocational Center</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {organizationType === "Other" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Specify Organization Type *</label>
                        <input
                          type="text"
                          value={organizationTypeOther}
                          onChange={(e) => setOrganizationTypeOther(e.target.value)}
                          placeholder="e.g. Technical Academy"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Year of Establishment *</label>
                      <input
                        type="number"
                        min={1950}
                        max={new Date().getFullYear()}
                        value={establishmentYear}
                        onChange={(e) => setEstablishmentYear(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Registration Number <span className="text-[10px] text-slate-400 font-normal">(Optional if un-registered)</span>
                      </label>
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="Govt Reg No / Society No"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PAN Number <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        placeholder="10-digit PAN"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none font-mono uppercase"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Complete Address *</label>
                      <textarea
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street address, building name, landmark"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                      <select
                        value={selectedState}
                        onChange={(e) => {
                          setSelectedState(e.target.value);
                          setSelectedDistrict("");
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none bg-white"
                      >
                        {indiaStatesDistricts.map((s) => (
                          <option key={s.state} value={s.state}>
                            {s.state}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none bg-white"
                        required
                      >
                        <option value="">Select District</option>
                        {availableDistricts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                        placeholder="6-digit PIN"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Website URL <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://www.yourinstitute.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Training Domains */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-serif font-bold text-[#001C55]">Section 3: Training Domains</h3>
                    <p className="text-xs text-slate-500">Select the training fields your institute intends to offer under DKFFJ affiliation.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "COMPUTER_IT", label: "Computer & IT Education", desc: "Basic IT, DCA, ADCA, Tally, Web Development" },
                      { key: "SKILL", label: "Skill Development & Vocational", desc: "Tailoring, Electrician, Beauty Culture, Mobile Repairing" },
                      { key: "NGO", label: "NGO & Social Welfare Work", desc: "Community outreach, awareness programs, social development" },
                      { key: "CRAFT", label: "Handicraft & Artisan Training", desc: "Traditional crafts, cottage industry training" },
                      { key: "SOCIAL_WORK", label: "Human Rights & Social Work", desc: "Advocacy, legal literacy, social justice" },
                      { key: "OTHER", label: "Other Training Domain", desc: "Customized or specialized training courses" }
                    ].map((domain) => (
                      <div
                        key={domain.key}
                        onClick={() => toggleDomain(domain.key)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedDomains.includes(domain.key)
                            ? "border-[#001C55] bg-blue-50/60 ring-2 ring-[#001C55]/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${selectedDomains.includes(domain.key) ? "bg-[#001C55] text-white" : "border border-slate-300"}`}>
                            {selectedDomains.includes(domain.key) && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800">{domain.label}</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">{domain.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedDomains.includes("OTHER") && (
                    <div className="mt-4">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Specify Other Training Domain *</label>
                      <input
                        type="text"
                        value={domainOther}
                        onChange={(e) => setDomainOther(e.target.value)}
                        placeholder="Specify custom training domain"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Infrastructure & Facilities */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-serif font-bold text-[#001C55]">Section 4: Infrastructure & Capacity</h3>
                    <p className="text-xs text-slate-500">Select available infrastructure at your training center.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "CLASSROOM", label: "Classrooms Available", desc: "Dedicated theory lecture rooms" },
                      { key: "LAB", label: "Computer / Practical Lab", desc: "Lab setup for practical sessions" },
                      { key: "INTERNET", label: "High-Speed Internet", desc: "Wi-Fi or Broadband connection" },
                      { key: "PROJECTOR", label: "Digital Projector / Smart Board", desc: "Audio-visual teaching aids" },
                      { key: "FACULTY", label: "Qualified Training Faculty", desc: "Certified instructors on staff" }
                    ].map((infra) => (
                      <div
                        key={infra.key}
                        onClick={() => toggleInfra(infra.key)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedInfra.includes(infra.key)
                            ? "border-[#001C55] bg-blue-50/60 ring-2 ring-[#001C55]/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${selectedInfra.includes(infra.key) ? "bg-[#001C55] text-white" : "border border-slate-300"}`}>
                            {selectedInfra.includes(infra.key) && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800">{infra.label}</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">{infra.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 max-w-xs">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student Capacity Per Batch</label>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={studentCapacity}
                      onChange={(e) => setStudentCapacity(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#001C55] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: Document Uploads */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-serif font-bold text-[#001C55]">Section 5: Document Uploads</h3>
                    <p className="text-xs text-slate-500">Upload clear JPG, PNG images or PDF files (Maximum 5 MB per file).</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">1. Passport Photo of Applicant *</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setPassportPhoto, "Passport Photo")}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-[#001C55] hover:file:bg-slate-200"
                        required
                      />
                      {passportPhoto && <span className="text-[10px] text-emerald-600 font-bold mt-1 block">✓ Selected: {passportPhoto.name}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">2. ID Proof Document *</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, setIdProofDoc, "ID Proof Document")}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-[#001C55] hover:file:bg-slate-200"
                        required
                      />
                      {idProofDoc && <span className="text-[10px] text-emerald-600 font-bold mt-1 block">✓ Selected: {idProofDoc.name}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">3. Building Photo (Inside Classroom/Lab) *</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setBuildingInsidePhoto, "Inside Photo")}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-[#001C55] hover:file:bg-slate-200"
                        required
                      />
                      {buildingInsidePhoto && <span className="text-[10px] text-emerald-600 font-bold mt-1 block">✓ Selected: {buildingInsidePhoto.name}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">4. Building Photo (Outside Front Board) *</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setBuildingOutsidePhoto, "Outside Photo")}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-[#001C55] hover:file:bg-slate-200"
                        required
                      />
                      {buildingOutsidePhoto && <span className="text-[10px] text-emerald-600 font-bold mt-1 block">✓ Selected: {buildingOutsidePhoto.name}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">5. Registration Certificate <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, setRegistrationCertificate, "Registration Cert")}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-[#001C55] hover:file:bg-slate-200"
                      />
                      {registrationCertificate && <span className="text-[10px] text-emerald-600 font-bold mt-1 block">✓ Selected: {registrationCertificate.name}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">6. PAN Card <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, setPanCard, "PAN Card")}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-[#001C55] hover:file:bg-slate-200"
                      />
                      {panCard && <span className="text-[10px] text-emerald-600 font-bold mt-1 block">✓ Selected: {panCard.name}</span>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">7. Computer / Practical Lab Photo <span className="text-[10px] text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setLabPhoto, "Lab Photo")}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-[#001C55] hover:file:bg-slate-200"
                      />
                      {labPhoto && <span className="text-[10px] text-emerald-600 font-bold mt-1 block">✓ Selected: {labPhoto.name}</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Review & Declaration */}
              {currentStep === 6 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-serif font-bold text-[#001C55]">Section 6: Summary Review & Declaration</h3>
                    <p className="text-xs text-slate-500">Please review your application summary and accept the declaration before final submission.</p>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">Institute Name:</span>
                      <strong className="text-slate-900">{organizationName}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">Organization Type:</span>
                      <strong className="text-slate-900">{organizationType === "Other" ? organizationTypeOther : organizationType}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">Applicant Name:</span>
                      <strong className="text-slate-900">{fullName} ({designation})</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">Official Email & OTP:</span>
                      <strong className="text-emerald-700 font-bold">{email} (✓ Email OTP Verified)</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">Mobile Number:</span>
                      <strong className="text-slate-900">{mobile}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-slate-500">Location:</span>
                      <strong className="text-slate-900">{selectedDistrict}, {selectedState}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Authorized Signatory:</span>
                      <strong className="text-[#001C55] font-serif">{authorizedSignatoryName}</strong>
                    </div>
                  </div>

                  {/* Declaration Box */}
                  <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="declaration"
                      checked={declarationAccepted}
                      onChange={(e) => setDeclarationAccepted(e.target.checked)}
                      className="mt-1 rounded text-[#001C55] focus:ring-[#001C55]"
                    />
                    <label htmlFor="declaration" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                      I hereby declare that all information, documents, and infrastructure details provided in this affiliation application are true and correct to the best of my knowledge. I agree to abide by the rules, terms, and guidelines of <strong>DK Foundation of Freedom and Justice</strong>.
                    </label>
                  </div>
                </div>
              )}

              {/* Form Navigation Buttons */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={(e) => handlePrevStep(e)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={(e) => handleNextStep(e)}
                    className="px-6 py-2.5 rounded-xl bg-[#001C55] hover:bg-[#001C55]/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    Next Step <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !declarationAccepted}
                    className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" /> Submit Application
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-auto">
        <p>&copy; {new Date().getFullYear()} DK Foundation of Freedom and Justice. Official Affiliation Portal.</p>
      </footer>
    </div>
  );
}
