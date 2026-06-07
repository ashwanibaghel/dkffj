import React from "react";
import { Settings, Save, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#0F4C81]" /> Portal Configuration
        </h1>
        <p className="text-slate-500 text-xs mt-1">Configure general portal rules, contact information, Resend keys, and fee pricing thresholds.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 max-w-xl text-xs font-semibold text-slate-700">
        
        {/* Settings fields */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-2">1. Organization Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Official Name</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-55" disabled value="DK Foundation of Freedom and Justice" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">MCA Registry ID</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-55" disabled value="U85300DL2026NPL123456" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Registered Office Address</label>
            <textarea className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-55" disabled rows={2} value="123, Legal Enclave, Sector-9, Rohini, New Delhi, India - 110085" />
          </div>
        </div>

        <div className="space-y-4 border-t pt-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-2">2. Fee Configuration</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Membership Fee (INR)</label>
              <input type="number" className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-55" disabled value={1000} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Default Gateway</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-55" disabled value="MOCK_PAYMENT" />
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t pt-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-2">3. Communication Services</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Resend Sender Email</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-55" disabled value="noreply@dkffj.org" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">API Verification Mode</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-55" disabled value="SANDBOX" />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="border-t pt-5 flex justify-end">
          <button className="px-5 py-2.5 bg-slate-200 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-not-allowed">
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
}
