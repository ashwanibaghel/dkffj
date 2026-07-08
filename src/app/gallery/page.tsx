import React from "react";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { ArrowLeft, PlayCircle, Image as ImageIcon, Video, Download } from "lucide-react";
import GalleryTabsClient from "./GalleryTabsClient";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  let photoFiles: string[] = [];

  try {
    const galleryDir = path.join(process.cwd(), "public/gallery");
    if (fs.existsSync(galleryDir)) {
      const files = fs.readdirSync(galleryDir);
      photoFiles = files
        .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
        .map((file) => `/gallery/${file}`);
    }
  } catch (error) {
    console.error("Error reading gallery files:", error);
  }

  // Pre-configured official media briefing videos from YouTube channel
  const videosList = [
    {
      id: "hjLMgfZ_Wp4",
      title: "DKFFJ Media Broadcast & Press Grievance",
      duration: "10:24",
      date: "September 2024"
    },
    {
      id: "dT87hA0fhbM",
      title: "RTI Activist Danish Khan Executive Council Address",
      duration: "12:15",
      date: "June 2024"
    },
    {
      id: "5s23y_Hn-2M",
      title: "National Grievance Cell Press Conference Ajmer",
      duration: "08:42",
      date: "August 2024"
    },
    {
      id: "6rY4Fp6WJ_E",
      title: "RTI Exposure on Govt GST Scam Briefing",
      duration: "15:10",
      date: "November 2024"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[20%] w-[700px] h-[500px] rounded-full bg-[#1565C0]/[0.02] blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-[#C00000]/[0.015] blur-[130px]"></div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-md z-10 sticky top-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1565C0]/10 to-[#C00000]/5 border border-slate-200 flex items-center justify-center">
              <img src="/logo.png" className="w-7 h-7 object-contain" style={{ clipPath: "circle(48.5%)" }} alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#1565C0] font-bold text-xs tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[8px] text-[#C00000] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1565C0] hover:text-[#0D47A1] transition-colors border border-sky-100 bg-sky-50/50 px-3.5 py-1.5 rounded-lg">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 z-10 space-y-12">
        
        {/* Title Hero */}
        <div className="text-center max-w-2xl mx-auto">
          <ImageIcon className="w-12 h-12 text-[#1565C0] mx-auto mb-3" />
          <h1 className="text-3xl font-extrabold font-serif text-[#1565C0]">Media Gallery</h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Explore photo collections of legal camps and watch official press briefings and news report videos of DKFFJ activities.
          </p>
          <div className="h-1 w-16 bg-[#C00000] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Client-side layout with separate photo and video library tabs */}
        <GalleryTabsClient photoUrls={photoFiles} videos={videosList} />

      </main>

      {/* Footer copyright bar */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-6 text-center text-xs border-t border-slate-800 z-10">
        <p>&copy; {new Date().getFullYear()} DK Foundation of Freedom and Justice. All rights reserved.</p>
      </footer>
    </div>
  );
}
