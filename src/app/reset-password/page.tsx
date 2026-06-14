"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function StudentResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [verifyingSession, setVerifyingSession] = useState<boolean>(true);

  // Verify that the user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg("Your recovery session is invalid or has expired. Please request a new password reset link.");
      }
      setVerifyingSession(false);
    };
    checkSession();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (!password || !confirmPassword) {
      setErrorMsg("Please fill in both password fields.");
      setLoading(false);
      return;
    }

    // Secure password validation rules
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setErrorMsg("Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to update password.");
        setLoading(false);
      } else {
        setSuccessMsg("Your password has been successfully updated!");
        
        // Log out of the temporary recovery session so they can log in fresh
        await supabase.auth.signOut();
        
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
      setLoading(false);
    }
  };

  if (verifyingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F4C81]" />
        <span className="text-xs text-slate-400 mt-2 font-medium">Verifying reset session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Mesh background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#0F4C81]/[0.08] blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[400px] rounded-full bg-[#D62828]/[0.03] blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-slate-800 flex items-center justify-center mx-auto mb-4">
            <img src="/logo.png" className="w-11 h-11 object-contain" alt="DKFFJ Logo" />
          </div>
          <h2 className="text-[#0F4C81] text-lg font-serif font-bold tracking-wider leading-tight">Reset Account Password</h2>
          <p className="text-[9px] text-[#D62828] font-bold tracking-widest uppercase mt-0.5">DKFFJ Academy Portal</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/20 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/20 text-emerald-300 border border-emerald-500/20 text-xs font-semibold flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {!successMsg && !errorMsg.includes("recovery session is invalid") ? (
          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F4C81] focus:border-[#0F4C81]"
                  placeholder="Min 8 chars: A-z, 0-9, @#$%"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F4C81] focus:border-[#0F4C81]"
                  placeholder="Retype password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0F4C81] text-white hover:bg-[#0c3c66] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving password...
                </>
              ) : (
                "Save New Password"
              )}
            </button>
          </form>
        ) : null}

        {(successMsg || errorMsg.includes("recovery session is invalid")) && (
          <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
            <Link href="/" className="text-[10px] text-slate-500 hover:text-slate-350 transition-colors uppercase tracking-wider font-bold">
              Back to Homepage
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
