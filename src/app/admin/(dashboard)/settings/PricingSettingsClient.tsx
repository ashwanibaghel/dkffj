"use client";

import React, { useState } from "react";
import { CreditCard, Save, CheckCircle2, Award, Sparkles, Loader2 } from "lucide-react";
import { PricingSettings } from "@/lib/portalSettings";
import { savePricingSettingsAction } from "./actions";

interface PricingSettingsClientProps {
  initialSettings: PricingSettings;
}

export default function PricingSettingsClient({ initialSettings }: PricingSettingsClientProps) {
  const [settings, setSettings] = useState<PricingSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (field: keyof PricingSettings, val: string) => {
    const num = parseInt(val, 10);
    setSettings((prev) => ({
      ...prev,
      [field]: isNaN(num) ? 0 : num,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSavedSuccess(false);

    try {
      const res = await savePricingSettingsAction(settings);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setErrorMsg(res.error || "Failed to update pricing settings.");
      }
    } catch (err: any) {
      console.error("Save pricing error:", err);
      setErrorMsg(err.message || "Error updating pricing preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#001C55] to-[#C00000] text-white flex items-center justify-center shadow-md">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#C00000] dark:text-red-400">Live Fee Control Panel</span>
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">Dynamic Pricing & Application Fees</h2>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>Fees Updated Live!</span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
        Changes made here instantly update the application fee for public forms (Appreciation Certificate, District Level, State Level, Zone Level, and National Level Membership Plans).
      </p>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Appreciation Fee Card */}
      <div className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/80 dark:border-amber-500/20 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <label className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
              Appreciation Certificate Application Fee
            </label>
          </div>
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-md">
            Default ₹49
          </span>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
            ₹
          </div>
          <input
            type="number"
            min="0"
            step="1"
            value={settings.appreciationFee}
            onChange={(e) => handleChange("appreciationFee", e.target.value)}
            className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-500/30 rounded-lg text-sm font-extrabold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Membership Tiers Grid */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Sparkles className="w-4 h-4 text-[#001C55] dark:text-blue-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Membership Plan Pricing Controls
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Normal Membership */}
          <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Normal / Volunteer Fee
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                ₹
              </div>
              <input
                type="number"
                min="0"
                step="10"
                value={settings.membershipFeeNormal}
                onChange={(e) => handleChange("membershipFeeNormal", e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#001C55] outline-none"
              />
            </div>
          </div>

          {/* District Membership */}
          <div className="bg-teal-50/50 dark:bg-teal-500/5 p-3.5 rounded-xl border border-teal-200 dark:border-teal-500/20 space-y-1.5">
            <label className="block text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
              District Level Membership Fee
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                ₹
              </div>
              <input
                type="number"
                min="0"
                step="10"
                value={settings.membershipFeeDistrict}
                onChange={(e) => handleChange("membershipFeeDistrict", e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-500/30 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          {/* Zone Membership */}
          <div className="bg-blue-50/50 dark:bg-blue-500/5 p-3.5 rounded-xl border border-blue-200 dark:border-blue-500/20 space-y-1.5">
            <label className="block text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
              Zone Level Membership Fee
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                ₹
              </div>
              <input
                type="number"
                min="0"
                step="10"
                value={settings.membershipFeeZone}
                onChange={(e) => handleChange("membershipFeeZone", e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-500/30 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* State Membership */}
          <div className="bg-indigo-50/50 dark:bg-indigo-500/5 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-500/20 space-y-1.5">
            <label className="block text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
              State Level Membership Fee
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                ₹
              </div>
              <input
                type="number"
                min="0"
                step="10"
                value={settings.membershipFeeState}
                onChange={(e) => handleChange("membershipFeeState", e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-500/30 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* National Membership */}
          <div className="bg-purple-50/50 dark:bg-purple-500/5 p-3.5 rounded-xl border border-purple-200 dark:border-purple-500/20 md:col-span-2 lg:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
              National Level Membership Fee
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                ₹
              </div>
              <input
                type="number"
                min="0"
                step="100"
                value={settings.membershipFeeNational}
                onChange={(e) => handleChange("membershipFeeNational", e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-500/30 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-[#001C55] to-[#C00000] hover:opacity-95 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Pricing...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Pricing Preferences</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
