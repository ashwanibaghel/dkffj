"use client";

import React, { useState } from "react";
import { Calendar, Tag, FileText, X, ChevronRight, Search, Newspaper, Clock } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  category: string;
  date: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  guidelines:   { bg: "bg-blue-50",   text: "text-[#1565C0]", dot: "bg-[#1565C0]" },
  address:      { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  meeting:      { bg: "bg-emerald-50",text: "text-emerald-700",dot: "bg-emerald-500" },
  general:      { bg: "bg-slate-100", text: "text-slate-600",  dot: "bg-slate-400" },
  announcement: { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500" },
  notice:       { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500" },
};

function getCategoryStyle(cat: string) {
  return CATEGORY_COLORS[cat.toLowerCase()] || CATEGORY_COLORS["general"];
}

export default function NewsGridClient({ initialNews }: { initialNews: NewsItem[] }) {
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(initialNews.map((n) => n.category)))];

  const filtered = initialNews.filter((item) => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch =
      search.trim() === "" ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-8">
      {/* Search + Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white border border-sky-100 rounded-2xl p-4 shadow-sm">
        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search news or notices…"
            className="w-full pl-9 pr-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1565C0] transition-colors"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full transition-all border ${
                activeCategory === cat
                  ? "bg-[#1565C0] text-white border-[#1565C0] shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:border-[#1565C0] hover:text-[#1565C0]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="text-[10px] font-bold text-slate-400 shrink-0">
          {filtered.length} / {initialNews.length} results
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-sky-100 rounded-3xl">
          <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-600">No Matching Articles</h3>
          <p className="text-xs text-slate-400 mt-1">Try a different search term or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((item, idx) => {
            const style = getCategoryStyle(item.category);
            return (
              <article
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-lg hover:border-[#1565C0]/25 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group hover:-translate-y-0.5"
              >
                {/* Colored top accent bar */}
                <div className={`h-1 w-full ${style.dot}`} />

                <div className="p-6 flex flex-col gap-4 flex-1">
                  {/* Category + Date */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 ${style.bg} ${style.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${style.dot}`} />
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-sm font-bold text-slate-800 font-serif leading-snug group-hover:text-[#1565C0] transition-colors line-clamp-3">
                    {item.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3 flex-1">
                    {item.content}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Official Notice
                  </span>
                  <span className="text-[10px] font-bold text-[#1565C0] flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                    Read Full <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Full Article Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-sky-100 overflow-hidden max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal top accent */}
            <div className={`h-1.5 w-full ${getCategoryStyle(selectedItem.category).dot}`} />

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Category badge */}
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 ${getCategoryStyle(selectedItem.category).bg} ${getCategoryStyle(selectedItem.category).text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${getCategoryStyle(selectedItem.category).dot}`} />
                    {selectedItem.category}
                  </span>
                  {/* Date badge */}
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono border border-slate-200 px-2.5 py-1 rounded-full bg-slate-50">
                    <Calendar className="w-3 h-3" />
                    {selectedItem.date}
                  </span>
                </div>
                <h2 className="text-lg font-bold font-serif text-slate-900 leading-snug">
                  {selectedItem.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all shrink-0 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 md:p-8 overflow-y-auto text-slate-600 text-sm leading-relaxed space-y-4 whitespace-pre-line flex-1">
              {selectedItem.content}
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <FileText className="w-3 h-3" /> DKFFJ Official Notice
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
