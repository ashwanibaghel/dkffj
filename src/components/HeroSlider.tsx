"use client";

import { useState, useEffect } from "react";

const sliderImages = [
  "/slider/constitution_of_india.png", // Constitution of India
  "/slider/supreme_court_justice.png", // Supreme Court and Scales of Justice
  "/slider/citizens_rights.png",       // Citizens Rights & Legal Awareness
];

export default function HeroSlider() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % sliderImages.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-slate-950">
      {/* Slides */}
      {sliderImages.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIdx ? "opacity-90" : "opacity-0"
          }`}
        >
          <img
            src={src}
            alt={`DKFFJ Activity Slide ${index + 1}`}
            className="w-full h-full object-cover object-center scale-105 animate-subtle-zoom"
          />
        </div>
      ))}

      {/* 
        readability gradient overlay:
        - Deep Slate on the left for maximum text contrast
        - Fades to semi-transparent in the center/right to make award/statue pictures extremely clear
      */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-900/30 z-10 pointer-events-none"></div>

      {/* Decorative glassmorphic top/bottom masks */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/10 to-transparent z-10 pointer-events-none backdrop-blur-[2px]"></div>
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none"></div>
    </div>
  );
}
