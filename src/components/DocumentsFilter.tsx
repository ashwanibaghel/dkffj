"use client";

import { useState, useEffect } from "react";
import { getHomeDocuments } from "@/app/actions/home";

interface LegalDoc {
  title: string;
  url: string;
  size: string;
  category: "all" | "registration" | "tax" | "appreciation";
  iconType: "download" | "shield" | "building" | "award";
}

const categories = [
  { id: "all", label: "All Docs" },
  { id: "registration", label: "Registrations" },
  { id: "tax", label: "Tax Approvals" },
  { id: "appreciation", label: "Appreciations" },
];

export default function DocumentsFilter() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [documents, setDocuments] = useState<LegalDoc[]>([]);

  useEffect(() => {
    async function loadDocs() {
      const data = await getHomeDocuments();
      setDocuments(data as LegalDoc[]);
    }
    loadDocs();
  }, []);

  const filteredDocs = documents.filter(
    (doc) => selectedCategory === "all" || doc.category === selectedCategory
  );

  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case "building":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case "shield":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case "award":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.5 8H16.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Category Tab Controls */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-slate-200/60 pb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer
              ${selectedCategory === cat.id
                ? "bg-[#0F4C81] text-white shadow-[0_4px_12px_rgba(15,76,129,0.2)]"
                : "bg-white text-slate-500 border border-slate-200 hover:text-slate-800 hover:border-slate-300"
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filtered Grid Output */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500">
        {filteredDocs.map((doc, idx) => (
          <a
            key={idx}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-slate-200/80 rounded-2xl p-6 flex justify-between items-center hover:border-[#0F4C81]/30 hover:shadow-md transition-all duration-300 group shadow-sm"
          >
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81] transition-colors group-hover:bg-[#0F4C81] group-hover:text-white">
                {renderIcon(doc.iconType)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 tracking-wide">{doc.title}</span>
                <span className="text-[9px] text-slate-400 mt-1 uppercase font-mono font-medium">{doc.size}</span>
              </div>
            </div>
            <div className="text-slate-400 group-hover:text-[#0F4C81] transition-all duration-300 group-hover:translate-x-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
