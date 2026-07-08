"use client";

import React, { useState } from "react";
import { Calendar, Tag, FileText, X, ChevronRight, Clock } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
}

export default function NewsGridClient({ initialNews }: { initialNews: NewsItem[] }) {
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);

  return (
    <div className="space-y-8">
      {initialNews.length === 0 ? (
        <div className="text-center py-16 bg-white border border-sky-100 rounded-3xl">
          <FileText className="w-12 h-12 text-slate-350 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No News Available</h3>
          <p className="text-xs text-slate-400 mt-1">Please check back later for official announcements.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {initialNews.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md hover:border-[#1565C0]/25 transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div className="p-6 space-y-4">
                {/* Meta details */}
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-[#1565C0] font-sans">
                  <span className="bg-[#1565C0]/8 py-1 px-2.5 rounded-full flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {item.category}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </span>
                </div>

                {/* Headline */}
                <h3 className="text-base font-bold text-slate-800 font-serif line-clamp-2 group-hover:text-[#1565C0] transition-colors leading-snug">
                  {item.title}
                </h3>

                {/* Sneak peek */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {item.content}
                </p>
              </div>

              {/* Read button */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="text-xs font-bold text-[#1565C0] hover:text-[#0D47A1] transition-all flex items-center gap-1 uppercase tracking-wider"
                >
                  Read Full Notice <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn" onClick={() => setSelectedItem(null)}>
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-sky-100 overflow-hidden max-h-[85vh] flex flex-col animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start gap-4 bg-sky-50/20">
              <div className="space-y-1">
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-[#1565C0]">
                  <span className="bg-[#1565C0]/8 py-1 px-2.5 rounded-full flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {selectedItem.category}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" /> {selectedItem.date}
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-bold font-serif text-slate-900 leading-snug mt-1">
                  {selectedItem.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 md:p-8 overflow-y-auto text-slate-600 text-xs md:text-sm leading-relaxed space-y-4 whitespace-pre-line font-medium">
              {selectedItem.content}
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10"
              >
                Close Readout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
