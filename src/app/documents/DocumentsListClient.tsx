"use client";

import React, { useState } from "react";
import { FileText, Download, Shield, Award, Landmark, Search } from "lucide-react";

interface DocumentItem {
  title: string;
  url: string;
  size: string;
  category: "all" | "registration" | "tax" | "appreciation";
  iconType: "download" | "shield" | "building" | "award";
}

export default function DocumentsListClient({ initialDocuments }: { initialDocuments: DocumentItem[] }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "registration" | "tax" | "appreciation">("all");

  const filteredDocs = initialDocuments.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || doc.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const renderIcon = (type: string) => {
    switch (type) {
      case "building":
        return <Landmark className="w-5 h-5 text-blue-600" />;
      case "shield":
        return <Shield className="w-5 h-5 text-green-600" />;
      case "award":
        return <Award className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Tabs Strip */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs font-bold uppercase tracking-wider">
          {(["all", "registration", "tax", "appreciation"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === tab
                  ? "bg-[#1565C0] text-white shadow-md shadow-blue-500/25"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab === "all" ? "All Documents" : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] bg-slate-50/50"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-sky-100 rounded-3xl">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Documents Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc, idx) => (
            <a
              key={idx}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md hover:border-[#1565C0]/35 transition-all group flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-[#1565C0]/5 transition-colors">
                {renderIcon(doc.iconType)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[#1565C0] transition-colors truncate">
                  {doc.title}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase font-semibold">{doc.size}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#1565C0] flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 group-hover:bg-[#1565C0] group-hover:text-white transition-all">
                <Download className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
