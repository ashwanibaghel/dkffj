import React from "react";
import { Building2, CreditCard, Mail, Save, Settings, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  const settingsSections = [
    {
      title: "Organization Details",
      icon: Building2,
      fields: [
        { label: "Official Name", value: "DK Foundation of Freedom and Justice" },
        { label: "MCA Registry ID", value: "U88900UP2023NPL185611" },
        { label: "Registered Office Address", value: "117/M/29-C Kakadeo M-Block, Madhuvan Appt. Road, Kanpur, UP - 208019", wide: true }
      ]
    },
    {
      title: "Fee Configuration",
      icon: CreditCard,
      fields: [
        { label: "Membership Fee (INR)", value: "1000" },
        { label: "Default Gateway", value: "MOCK_PAYMENT" }
      ]
    },
    {
      title: "Communication Services",
      icon: Mail,
      fields: [
        { label: "Resend Sender Email", value: "noreply@dkffj.org" },
        { label: "API Verification Mode", value: "SANDBOX" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <Settings className="w-5 h-5 text-[#001C55] dark:text-blue-400" /> Portal Configuration
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Review general portal rules, contact information, communication mode, and fee pricing thresholds.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Read-only configuration snapshot</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
        <div className="space-y-4">
          {settingsSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <section
                key={section.title}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-none"
              >
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-[#001C55] dark:text-blue-300 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Section {index + 1}</span>
                    <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">{section.title}</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {section.fields.map((field) => (
                    <div key={field.label} className={field.wide ? "md:col-span-2" : ""}>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{field.label}</label>
                      <div className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">Configuration Lock</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">These values are displayed for admin visibility. Runtime configuration is controlled by environment variables and backend records.</p>
          </div>
          <button
            type="button"
            disabled
            className="w-full px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </aside>
      </div>
    </div>
  );
}
