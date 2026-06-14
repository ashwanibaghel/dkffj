"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ShieldAlert, Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Check if already logged in and has admin role
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Query profile to check if ADMIN
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile && (profile.role === "ADMIN" || profile.role === "SUPERADMIN")) {
          router.push("/admin");
        }
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // Attempt login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        setErrorMsg(authError.message || "Invalid credentials.");
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Double check profile role
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("role")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (profileError || !profile) {
          setErrorMsg("Failed to load user permissions.");
          setLoading(false);
          return;
        }

        if (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN") {
          setErrorMsg("Access Denied: You do not have administrator permissions.");
          // Sign them out immediately to clear cookie session
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Redirect to admin dashboard
        router.push("/admin");
      }
    } catch (err) {
      setErrorMsg("An unexpected login error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Mesh background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#0F4C81]/[0.08] blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[400px] rounded-full bg-[#D62828]/[0.03] blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        
        {/* Crest & header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-slate-800 flex items-center justify-center mx-auto mb-4">
            <img src="/logo.png" className="w-11 h-11 object-contain animate-subtle-zoom" alt="DKFFJ Logo" />
          </div>
          <h2 className="text-[#0F4C81] text-lg font-serif font-bold tracking-wider leading-tight">DK Foundation Portal</h2>
          <p className="text-[9px] text-[#D62828] font-bold tracking-widest uppercase mt-0.5">Administration Shield login</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/20 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Admin Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F4C81] focus:border-[#0F4C81]"
                placeholder="admin@dkffj.org"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
            </div>
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
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                <Loader2 className="w-4 h-4 animate-spin" /> Authorizing credentials...
              </>
            ) : (
              <>
                Access Administration
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
          <Link href="/" className="text-[10px] text-slate-500 hover:text-slate-350 transition-colors uppercase tracking-wider font-bold">
            Back to Public Portal
          </Link>
        </div>

      </div>
    </div>
  );
}
