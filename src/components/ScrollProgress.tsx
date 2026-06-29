"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);

      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // SVG parameters
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-20 md:bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 group
        ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none"}`}
      aria-label="Scroll to top"
    >
      {/* SVG Circle Progress */}
      <svg className="w-full h-full -rotate-90 absolute top-0 left-0">
        <circle
          cx="24"
          cy="24"
          r={radius}
          className="stroke-slate-100"
          strokeWidth="2.5"
          fill="transparent"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          className="stroke-[#001C55] transition-all duration-75"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>

      {/* Up Arrow Icon */}
      <svg 
        className="w-4 h-4 text-slate-600 group-hover:text-[#001C55] transition-colors relative z-10" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth="3"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}
