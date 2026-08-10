"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Newspaper, ArrowRight, Calendar, Tag, Sparkles, ShieldCheck } from "lucide-react";
import { getHomeNews } from "@/app/actions/home";

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  image_url?: string;
}

const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  {
    id: "1",
    title: "डीके फाउंडेशन ऑफ फ़्रीडम एंड जस्टिस नियमावली एंव जनहित मार्गदर्शिका",
    content: "राष्ट्रीय कार्यसमिति द्वारा मानव अधिकार संरक्षण, विधिक सहायता कोष एवं निःशुल्क सहायता शिविरों हेतु विस्तृत नियमावली जारी।",
    category: "Official Policy",
    date: "September 2024"
  },
  {
    id: "2",
    title: "मानवाधिकार हनन को रोकना देश के हर नागरिक का प्रथम संवैधानिक कर्तव्य है",
    content: "राष्ट्रीय मुख्य कार्यकारी अधिकारी (CEO) विपिन शर्मा का विशेष संबोधन — उत्पीडन के शिकार युवाओं हेतु त्वरित विधिक सहायता व्यवस्था।",
    category: "Executive Address",
    date: "August 2024"
  },
  {
    id: "3",
    title: "National Executive Committee Strategic Assembly & Directive",
    content: "Director Danish Khan and National President Wasim Qureshi finalize organizational expansion and official verification standards.",
    category: "National Briefing",
    date: "June 2025"
  },
  {
    id: "4",
    title: "निःशुल्क कानूनी सहायता एवं मानवाधिकार जागरूकता अभियान २०२५-२६",
    content: "ग्रामीण एवं वंचित क्षेत्रों में न्याय की पहुंच सुलभ बनाने हेतु डीके फाउंडेशन द्वारा राज्य स्तरीय विधिक परामर्श शिविरों का आयोजन।",
    category: "Public Welfare",
    date: "July 2025"
  }
];

export default function HomeNewsSlider() {
  const [newsList, setNewsList] = useState<NewsItem[]>(DEFAULT_NEWS_ITEMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const data = await getHomeNews();
        if (data && data.length > 0) {
          // If less than 4 items, merge with fallback items so carousel is always full
          if (data.length < 4) {
            const merged = [...data, ...DEFAULT_NEWS_ITEMS.slice(data.length)];
            setNewsList(merged as NewsItem[]);
          } else {
            setNewsList(data as NewsItem[]);
          }
        }
      } catch (_) {
        setNewsList(DEFAULT_NEWS_ITEMS);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  // Double the list to create a seamless 100% infinite marquee loop
  const displayItems = [...newsList, ...newsList];

  return (
    <section className="relative py-14 md:py-18 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-[#f0f7ff] via-[#e6f0fa] to-[#f0f7ff] border-y border-blue-100/80">
      
      {/* Background Decorative Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[300px] bg-gradient-to-b from-[#1565C0]/[0.04] to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-[-100px] w-80 h-80 bg-[#C00000]/[0.025] rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-blue-200/60">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#1565C0]/10 border border-[#1565C0]/20 text-[#1565C0] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3 h-3 text-[#1565C0] animate-pulse" />
              <span>Official Press &amp; Media Bulletins</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#001C55] font-serif tracking-tight leading-tight">
              Latest News &amp; National Dispatches
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1.5 max-w-2xl">
              Stay informed with live briefings, human rights protection campaigns, and official executive announcements from DKFFJ.
            </p>
          </div>

          <Link
            href="/news"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1565C0] to-[#0D47A1] text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all shrink-0 self-start sm:self-auto"
          >
            <span>View All News Desk</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Continuous Horizontal Infinite Scrolling Marquee Container */}
        <div className="relative w-full overflow-hidden py-2 select-none group">
          
          {/* Subtle Side Fades to create professional vignette transition */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#f0f7ff] to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#f0f7ff] to-transparent z-20 pointer-events-none" />

          {/* Marquee Track */}
          <div className="animate-news-marquee flex gap-6">
            {displayItems.map((item, idx) => (
              <div
                key={`news-slide-${item.id}-${idx}`}
                className="w-[300px] sm:w-[360px] md:w-[400px] shrink-0 bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-slate-200/90 shadow-[0_4px_20px_rgba(0,28,85,0.06)] hover:shadow-[0_12px_35px_rgba(21,101,192,0.15)] hover:border-[#1565C0]/40 transition-all duration-300 flex flex-col justify-between group/card"
              >
                <div>
                  {/* Top Bar: Category Pill + Date */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#1565C0]/10 text-[#1565C0] border border-[#1565C0]/20">
                      <Tag className="w-2.5 h-2.5" />
                      {item.category || "Official"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover/card:text-[#1565C0] transition-colors leading-snug line-clamp-2 mb-2.5 font-serif">
                    {item.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-3 mb-5">
                    {item.content}
                  </p>
                </div>

                {/* Footer Action Link */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    <span>DKFFJ Verified</span>
                  </div>
                  <Link
                    href="/news"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#1565C0] hover:text-[#C00000] transition-colors group-hover/card:translate-x-1 duration-200"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Helper Bar */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-500 text-center">
          <span className="w-2 h-2 rounded-full bg-[#1565C0] animate-ping"></span>
          <span>Hover over any news card to pause scrolling and read details.</span>
        </div>

      </div>
    </section>
  );
}
