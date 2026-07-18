"use client";

import React, { useState, useEffect } from "react";
import { registerForCourse, sendCourseOtp, verifyCourseOtp } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { BookOpen, Clock, Award, Loader2, AlertCircle, Shield, Check, Eye, EyeOff, User, Mail, ArrowLeft, Lock } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  fees: string;
  eligibility: string;
  image_url: string | null;
}

const compressImage = (file: File, maxWidth = 1000, maxHeight = 1000, maxFileSizeKB = 600): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // fallback
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85; // High starting quality (keeps image very clear)
        const convertToBlob = (q: number): Promise<Blob | null> => {
          return new Promise((res) => {
            canvas.toBlob((blob) => res(blob), "image/jpeg", q);
          });
        };

        const checkAndCompress = async () => {
          let blob = await convertToBlob(quality);
          if (!blob) {
            resolve(file);
            return;
          }

          // If file is larger than limit, compress further but stop before it becomes blurry
          while (blob.size > maxFileSizeKB * 1024 && quality > 0.4) {
            quality -= 0.1;
            blob = await convertToBlob(quality);
            if (!blob) break;
          }

          if (blob) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        };

        checkAndCompress();
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export default function CourseCard({ course }: { course: Course }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Modal mode: 'REGISTRATION' | 'SIGN_IN' | 'FORGOT_PASSWORD'
  const [modalMode, setModalMode] = useState<'REGISTRATION' | 'SIGN_IN' | 'FORGOT_PASSWORD'>('REGISTRATION');

  // Form inputs for registration
  const [fullName, setFullName] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("+91");
  const [mobile, setMobile] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fatherName, setFatherName] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [workingSector, setWorkingSector] = useState<string>("");
  const [experienceCert, setExperienceCert] = useState<File | null>(null);
  const [trainingCenter, setTrainingCenter] = useState<string>("");
  const [customCenter, setCustomCenter] = useState<string>("");
  const [qualification, setQualification] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [stateName, setStateName] = useState<string>("");
  const [districtName, setDistrictName] = useState<string>("");
  const [qualificationDoc, setQualificationDoc] = useState<File | null>(null);
  const [aadhaarDoc, setAadhaarDoc] = useState<File | null>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setPhoto(null);
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
      }
      return;
    }

    // 1. Check max size limit of 3MB
    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg("Maximum file size is 3 MB. Please choose a smaller photo.");
      e.target.value = ""; // Clear file input
      setPhoto(null);
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
      }
      return;
    }

    setErrorMsg("");
    setIsCompressing(true);

    try {
      // 2. Compress the image to target size (<600 KB) keeping max bounds at 1000px
      const compressedFile = await compressImage(file, 1000, 1000, 600);
      setPhoto(compressedFile);
      
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      const newPreviewUrl = URL.createObjectURL(compressedFile);
      setPhotoPreview(newPreviewUrl);
    } catch (err: any) {
      console.error("Image compression error:", err);
      // Fallback
      setPhoto(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setPhotoPreview(newPreviewUrl);
    } finally {
      setIsCompressing(false);
    }
  };

  // OTP Verification states
  const [otpCode, setOtpCode] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [otpLoading, setOtpLoading] = useState<boolean>(false);

  // Sign In states
  const [signInEmail, setSignInEmail] = useState<string>("");
  const [signInPassword, setSignInPassword] = useState<string>("");
  const [signInLoading, setSignInLoading] = useState<boolean>(false);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState<string>("");
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const checkUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsLoggedIn(true);
          setEmail(user.email || "");
          setFullName(user.user_metadata?.full_name || "");
        } else {
          setIsLoggedIn(false);
          setEmail("");
          setFullName("");
        }
      };
      checkUser();
      setModalMode('REGISTRATION');
      setOtpSent(false);
      setOtpVerified(false);
      setOtpCode("");
      setSignInEmail("");
      setSignInPassword("");
      setForgotEmail("");
      setFatherName("");
      setPhoto(null);
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(null);
      setWorkingSector("");
      setExperienceCert(null);
      setTrainingCenter("");
      setCustomCenter("");
      setQualification("");
      setDob("");
      setGender("");
      setAddress("");
      setStateName("");
      setDistrictName("");
      setQualificationDoc(null);
      setAadhaarDoc(null);
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isOpen]);

  const handleSendOtp = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!email || !mobile) {
      setErrorMsg("Please enter both mobile number and email address to receive OTP.");
      return;
    }
    setOtpLoading(true);
    try {
      const fullMobile = countryCode + mobile;
      const res = await sendCourseOtp(fullMobile, email);
      if (res.success) {
        setOtpSent(true);
        setSuccessMsg(res.message || "OTP sent successfully.");
      } else {
        setErrorMsg(res.error || "Failed to send OTP.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error sending OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!otpCode) {
      setErrorMsg("Please enter the 6-digit OTP code.");
      return;
    }
    setOtpLoading(true);
    try {
      const fullMobile = countryCode + mobile;
      const res = await verifyCourseOtp(fullMobile, email, otpCode);
      if (res.success) {
        setOtpVerified(true);
        setSuccessMsg(res.message || "Email verified successfully!");
      } else {
        setErrorMsg(res.error || "Invalid OTP code.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error verifying OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!signInEmail || !signInPassword) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setSignInLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword
      });
      if (error) {
        setErrorMsg(error.message || "Invalid credentials.");
      } else if (data.user) {
        setIsLoggedIn(true);
        setEmail(data.user.email || "");
        setFullName(data.user.user_metadata?.full_name || "");
        setModalMode('REGISTRATION');
        setSuccessMsg("Logged in successfully! You can now complete your enrollment.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during sign in.");
    } finally {
      setSignInLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!forgotEmail) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    setForgotLoading(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
      });
      if (error) {
        setErrorMsg(error.message || "Failed to send reset link.");
      } else {
        setSuccessMsg("A password reset link has been sent to your email address.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error requesting password reset.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!fullName || !mobile || !email || !fatherName || !photo || !workingSector || !trainingCenter ||
        !qualification || !dob || !gender || !address || !stateName || !districtName || !qualificationDoc || !aadhaarDoc) {
      setErrorMsg("All registration fields, including Profile Photo, Qualification, DOB, Gender, Address, State, District, Aadhaar Card, and Qualification proof, are required.");
      return;
    }

    if (workingSector !== "Student / Unemployed" && !experienceCert) {
      setErrorMsg("Please upload your Experience / Qualification Certificate for the selected working sector.");
      return;
    }

    const dobYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (isNaN(dobYear) || dobYear < 1920 || dobYear > currentYear) {
      setErrorMsg("Please enter a valid Date of Birth.");
      return;
    }

    const finalTrainingCenter = trainingCenter === "Other" ? customCenter : trainingCenter;
    if (trainingCenter === "Other" && !customCenter.trim()) {
      setErrorMsg("Please specify your Training Center / Branch name.");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setErrorMsg("Mobile number must be exactly 10 digits.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!isLoggedIn) {
      if (!otpVerified) {
        setErrorMsg("Please verify your email address via OTP first.");
        return;
      }
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
      formData.append("courseId", course.id);
      formData.append("fullName", fullName);
      formData.append("mobile", countryCode + mobile);
      formData.append("email", email);
      formData.append("fatherName", fatherName);
      formData.append("workingSector", workingSector);
      formData.append("trainingCenter", finalTrainingCenter);
      formData.append("qualification", qualification);
      formData.append("dob", dob);
      formData.append("gender", gender);
      formData.append("address", address);
      formData.append("state", stateName);
      formData.append("district", districtName);
      
      if (photo) {
        formData.append("photo", photo);
      }
      if (experienceCert) {
        formData.append("experienceCert", experienceCert);
      }
      if (qualificationDoc) {
        formData.append("qualificationDoc", qualificationDoc);
      }
      if (aadhaarDoc) {
        formData.append("aadhaarDoc", aadhaarDoc);
      }
      
      if (!isLoggedIn) {
        formData.append("password", password);
        formData.append("otpCode", otpCode);
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
          <div className="absolute top-3 right-3 bg-[#001C55] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {course.duration}
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 font-serif leading-snug group-hover:text-[#001C55] transition-colors">{course.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed">{course.description}</p>
            
            <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 border-slate-100 text-[11px] text-slate-600 font-medium">
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Fees</span>
                <span className="text-sm font-extrabold text-[#C00000] mt-0.5 block">INR {Number(course.fees).toLocaleString("en-IN")}.00</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Eligibility</span>
                <span className="text-[11px] text-slate-700 font-semibold truncate mt-0.5 block">{course.eligibility}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="mt-5 w-full py-2.5 rounded-lg bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            Enroll in Course
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full my-8 flex flex-col relative animate-scaleUp text-left overflow-hidden">
            
            {/* Header */}
            <div className="bg-[#001C55] text-white p-5 text-left">
              <span className="text-[9px] font-bold text-sky-200 uppercase tracking-widest block">Course Registration</span>
              <h3 className="text-base font-bold font-serif mt-1 leading-snug">{course.title}</h3>
              <p className="text-[10px] text-slate-300 mt-1">Duration: {course.duration} | Fees: INR {Number(course.fees).toLocaleString("en-IN")}.00</p>
            </div>

            {/* Form */}
            {modalMode === 'SIGN_IN' && (
              <form onSubmit={handleSignIn} className="p-6 space-y-4">
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

                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Student Sign In</h4>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                      placeholder="e.g. priya.sharma@gmail.com"
                      className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setModalMode('FORGOT_PASSWORD');
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      className="text-[9px] text-[#001C55] hover:underline font-bold uppercase tracking-wider"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={signInLoading}
                    className="w-full py-2.5 bg-[#001C55] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#001236] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {signInLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Sign In
                  </button>
                </div>

                <div className="text-center pt-3 border-t text-[10px] text-slate-500">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('REGISTRATION');
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="text-[#C00000] font-bold hover:underline"
                  >
                    Register and Enroll
                  </button>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {modalMode === 'FORGOT_PASSWORD' && (
              <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
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

                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('SIGN_IN');
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className="p-1 hover:bg-slate-105 rounded-full text-slate-550 flex items-center justify-center border border-slate-200"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reset Password</h4>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Enter your registered email address below. We will send you a password reset link to recover your student profile.
                </p>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 bg-[#001C55] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#001236] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {forgotLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Send Reset Link
                  </button>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {modalMode === 'REGISTRATION' && (
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

                {isLoggedIn && (
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-[#001C55] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {fullName ? fullName.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Logged In as {fullName}</div>
                      <div className="text-[9px] text-slate-500 font-medium">{email}</div>
                    </div>
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
                    placeholder="e.g. Priya Devi Sharma"
                    className={`w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 disabled:bg-slate-50 ${
                      errorMsg && errorMsg.toLowerCase().includes("all registration fields") && !fullName
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" 
                        : "border-slate-200"
                    }`}
                  />
                  {errorMsg && errorMsg.toLowerCase().includes("all registration fields") && !fullName && (
                    <p className="text-[9px] text-rose-600 font-bold mt-1">Full Name is required.</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Father's Name *</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    required
                    placeholder="e.g. Shri Hari Shankar Sharma"
                    className={`w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 ${
                      errorMsg && errorMsg.toLowerCase().includes("all registration fields") && !fatherName
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" 
                        : "border-slate-200"
                    }`}
                  />
                  {errorMsg && errorMsg.toLowerCase().includes("all registration fields") && !fatherName && (
                    <p className="text-[9px] text-rose-600 font-bold mt-1">Father's Name is required.</p>
                  )}
                </div>

                {/* Gender & DOB (Grid Layout) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Gender *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                    />
                  </div>
                </div>

                {/* Complete Address */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Correspondence Address *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="Enter complete house no, street, area, post office, pincode"
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                  />
                </div>

                {/* State & District (Grid Layout) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">State *</label>
                    <select
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                    >
                      <option value="">-- Select State --</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                      <option value="Ladakh">Ladakh</option>
                      <option value="Lakshadweep">Lakshadweep</option>
                      <option value="Puducherry">Puducherry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">District *</label>
                    <input
                      type="text"
                      value={districtName}
                      onChange={(e) => setDistrictName(e.target.value)}
                      required
                      placeholder="e.g. Lucknow"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                    />
                  </div>
                </div>

                {/* Educational Qualification */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Educational Qualification *</label>
                  <select
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                  >
                    <option value="">-- Select Qualification --</option>
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="Under Graduate">Under Graduate</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Qualification Document File Upload */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Upload Qualification Marksheet / Certificate *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && file.size > 3 * 1024 * 1024) {
                        setErrorMsg("Maximum qualification document size is 3 MB.");
                        e.target.value = "";
                        setQualificationDoc(null);
                      } else {
                        setQualificationDoc(file);
                      }
                    }}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Upload PDF or Image of your highest qualification proof (Max 3MB).</p>
                  {qualificationDoc && (
                    <div className="mt-1 text-[10px] text-emerald-600 font-bold">
                      File selected: {qualificationDoc.name} ({(qualificationDoc.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>

                {/* Aadhaar Card Upload */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Upload Aadhaar Card (Front & Back) *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && file.size > 3 * 1024 * 1024) {
                        setErrorMsg("Maximum Aadhaar file size is 3 MB.");
                        e.target.value = "";
                        setAadhaarDoc(null);
                      } else {
                        setAadhaarDoc(file);
                      }
                    }}
                    required
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Upload PDF or Image containing front and back of Aadhaar (Max 3MB).</p>
                  {aadhaarDoc && (
                    <div className="mt-1 text-[10px] text-emerald-600 font-bold">
                      File selected: {aadhaarDoc.name} ({(aadhaarDoc.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Profile Photo (Passport size) *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    required={!photo}
                    className={`w-full px-3 py-1.5 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 ${
                      errorMsg && errorMsg.toLowerCase().includes("all registration fields") && !photo
                        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" 
                        : "border-slate-200"
                    }`}
                  />
                  {errorMsg && errorMsg.toLowerCase().includes("all registration fields") && !photo && (
                    <p className="text-[9px] text-rose-600 font-bold mt-1">Profile Photo is required.</p>
                  )}
                  {isCompressing && (
                    <div className="text-[10px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Optimizing and compressing image...
                    </div>
                  )}
                  {photoPreview && photo && (
                    <div className="mt-2.5 flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 relative">
                      <img
                        src={photoPreview}
                        alt="Profile Preview"
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                      />
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-slate-700 truncate max-w-[180px]">{photo.name}</div>
                        <div className="text-[9px] text-slate-500 font-medium mt-0.5">
                          Size: <span className="font-bold text-[#001C55]">{(photo.size / 1024).toFixed(1)} KB</span> (Optimized)
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoto(null);
                          if (photoPreview) {
                            URL.revokeObjectURL(photoPreview);
                            setPhotoPreview(null);
                          }
                          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                          if (fileInput) fileInput.value = "";
                        }}
                        className="p-1 hover:bg-slate-200 rounded-full text-slate-550 hover:text-slate-800 transition-colors"
                        title="Remove photo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Working Sector Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Current Working Sector / Occupation *</label>
                  <select
                    value={workingSector}
                    onChange={(e) => {
                      setWorkingSector(e.target.value);
                      if (e.target.value === "Student / Unemployed") {
                        setExperienceCert(null);
                      }
                    }}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                  >
                    <option value="">-- Select Sector --</option>
                    <option value="Mass Media / Journalism">Mass Media / Journalism</option>
                    <option value="Care Center / Health Care">Care Center / Health Care</option>
                    <option value="NGO / Social Work">NGO / Social Work</option>
                    <option value="Government Sector">Government Sector</option>
                    <option value="Freelancer / Independent Contractor">Freelancer / Independent Contractor</option>
                    <option value="Other Business / Sector">Other Business / Sector</option>
                    <option value="Student / Unemployed">Student / Unemployed</option>
                  </select>
                </div>

                {/* Experience Certificate File Upload (if not student) */}
                {workingSector && workingSector !== "Student / Unemployed" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Upload Experience / Qualification Certificate *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file && file.size > 3 * 1024 * 1024) {
                          setErrorMsg("Maximum certificate file size is 3 MB.");
                          e.target.value = "";
                          setExperienceCert(null);
                        } else {
                          setExperienceCert(file);
                        }
                      }}
                      required
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                    />
                    <p className="text-[9px] text-slate-400 mt-1">Upload PDF or Image of your experience/qualification proof (Max 3MB).</p>
                    {experienceCert && (
                      <div className="mt-1 text-[10px] text-emerald-600 font-bold">
                        File selected: {experienceCert.name} ({(experienceCert.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>
                )}

                {/* Training Center Name Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Training Center / Study Branch *</label>
                  <select
                    value={trainingCenter}
                    onChange={(e) => setTrainingCenter(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                  >
                    <option value="">-- Select Center --</option>
                    <option value="DK Academy of Mass Media & Journalism">DK Academy of Mass Media & Journalism</option>
                    <option value="DK Academy of Social Care & Health">DK Academy of Social Care & Health</option>
                    <option value="DK Academy of Human Rights Protection">DK Academy of Human Rights Protection</option>
                    <option value="DK Foundation Main Campus">DK Foundation Main Campus</option>
                    <option value="Other">Other / Affiliated Center</option>
                  </select>
                </div>

                {/* Custom Training Center Input if 'Other' is selected */}
                {trainingCenter === "Other" && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Specify Center / Institute Name *</label>
                    <input
                      type="text"
                      value={customCenter}
                      onChange={(e) => setCustomCenter(e.target.value)}
                      required
                      placeholder="e.g. Gurukul Social Work Institute"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Number *</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      disabled={!isLoggedIn && otpVerified}
                      className="w-20 px-1 py-2 border rounded-lg text-[10px] bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 disabled:bg-slate-50 shrink-0"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
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
                      disabled={!isLoggedIn && otpVerified}
                      placeholder="Mobile number"
                      className={`w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 disabled:bg-slate-50 ${
                        errorMsg && (errorMsg.toLowerCase().includes("mobile") || errorMsg.toLowerCase().includes("phone") || (errorMsg.toLowerCase().includes("all registration fields") && !mobile))
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" 
                          : "border-slate-200"
                      }`}
                    />
                  </div>
                  {errorMsg && (errorMsg.toLowerCase().includes("mobile") || errorMsg.toLowerCase().includes("phone") || (errorMsg.toLowerCase().includes("all registration fields") && !mobile)) && (
                    <p className="text-[9px] text-rose-600 font-bold mt-1">
                      {errorMsg.toLowerCase().includes("all registration fields") ? "Mobile Number is required." : errorMsg}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address *</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoggedIn || otpVerified}
                      placeholder="e.g. priya.sharma@gmail.com"
                      className={`w-full px-3 py-2 pr-28 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 disabled:bg-slate-50 ${
                        errorMsg && (errorMsg.toLowerCase().includes("email") || (errorMsg.toLowerCase().includes("all registration fields") && !email))
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" 
                          : "border-slate-200"
                      }`}
                    />
                    {!isLoggedIn && !otpVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading || !email || !mobile}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#001C55] hover:bg-[#001236] text-white text-[9px] font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {otpLoading ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : null}
                        {otpSent ? "Resend" : "Send OTP"}
                      </button>
                    )}
                    {!isLoggedIn && otpVerified && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider">
                        <Check className="w-3.5 h-3.5" /> Verified
                      </div>
                    )}
                  </div>
                  {errorMsg && (errorMsg.toLowerCase().includes("email") || (errorMsg.toLowerCase().includes("all registration fields") && !email)) && (
                    <p className="text-[9px] text-rose-600 font-bold mt-1">
                      {errorMsg.toLowerCase().includes("all registration fields") ? "Email Address is required." : errorMsg}
                    </p>
                  )}
                </div>

                {/* OTP Input Fields if sent but not verified */}
                {!isLoggedIn && otpSent && !otpVerified && (
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Enter 6-Digit Email OTP *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="e.g. 123456"
                        maxLength={6}
                        className={`w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 ${
                          errorMsg && (errorMsg.toLowerCase().includes("otp") || errorMsg.toLowerCase().includes("code"))
                            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" 
                            : "border-slate-200"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpLoading || otpCode.length !== 6}
                        className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {otpLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                      </button>
                    </div>
                    {errorMsg && (errorMsg.toLowerCase().includes("otp") || errorMsg.toLowerCase().includes("code")) && (
                      <p className="text-[9px] text-rose-600 font-bold mt-1">{errorMsg}</p>
                    )}
                  </div>
                )}

                {/* Password Fields - Shown only if not logged in and email verified */}
                {!isLoggedIn && otpVerified && (
                  <div className="border-t pt-3 mt-3 space-y-3">
                    <div className="flex items-center gap-1.5 text-slate-655">
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-750">Email Verified - Set Password</span>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Choose Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Min 8 chars: A-z, 0-9, @#$%"
                          className={`w-full px-3 py-2 pr-9 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 ${
                            errorMsg && (errorMsg.toLowerCase().includes("password") || errorMsg.toLowerCase().includes("match"))
                              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" 
                              : "border-slate-200"
                          }`}
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

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Confirm Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Retype password"
                          className={`w-full px-3 py-2 pr-9 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 ${
                            errorMsg && errorMsg.toLowerCase().includes("match")
                              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" 
                              : "border-slate-200"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    {errorMsg && (errorMsg.toLowerCase().includes("password") || errorMsg.toLowerCase().includes("match")) && (
                      <p className="text-[9px] text-rose-600 font-bold mt-1">{errorMsg}</p>
                    )}
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
                    disabled={loading || (!isLoggedIn && !otpVerified)}
                    className="px-5 py-2.5 bg-[#C00000] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#990000] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Pay INR {Number(course.fees).toLocaleString("en-IN")}
                  </button>
                </div>

                {!isLoggedIn && (
                  <div className="text-center pt-3 border-t text-[10px] text-slate-500">
                    Already have an academy account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setModalMode('SIGN_IN');
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      className="text-[#001C55] font-bold hover:underline"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
