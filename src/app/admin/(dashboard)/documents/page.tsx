import React from "react";
import { FileText, Download, Plus, Trash2 } from "lucide-react";

export default function AdminDocumentsPage() {
  const dummyDocs = [
    { id: "1", title: "MCA Incorporation Certificate.pdf", category: "MCA Registration", size: "1.4 MB", date: "15/02/2026" },
    { id: "2", title: "80G Tax Exemption Approval.pdf", category: "Income Tax", size: "2.1 MB", date: "22/03/2026" },
    { id: "3", title: "NITI Aayog Darpan Certificate.pdf", category: "Govt Portal", size: "0.8 MB", date: "05/04/2026" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0F4C81]" /> Legal Documents Vault
          </h1>
          <p className="text-slate-500 text-xs mt-1">Manage public legal downloads, certificates of incorporation, and tax filings.</p>
        </div>
        <button className="px-4 py-2 bg-[#0F4C81] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-not-allowed opacity-75">
          <Plus className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Legal Filings</h3>
        </div>
        <div className="divide-y divide-slate-150 text-xs font-semibold text-slate-700">
          {dummyDocs.map((doc) => (
            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#D62828]/5 border border-slate-250 flex items-center justify-center text-[#D62828]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{doc.title}</h4>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{doc.category} | Size: {doc.size} | Uploaded on: {doc.date}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 border rounded hover:bg-slate-100 transition-colors text-slate-400 cursor-not-allowed">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="px-3 py-1.5 bg-[#0F4C81] text-white hover:bg-[#0c3c66] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
