"use client";

import React, { useState } from "react";
import { PlayCircle, Image as ImageIcon, Video, X, Eye, Clock, Calendar } from "lucide-react";

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  date: string;
}

interface GalleryTabsClientProps {
  photoUrls: string[];
  videos: VideoItem[];
}

export default function GalleryTabsClient({ photoUrls, videos }: GalleryTabsClientProps) {
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Tab Selectors */}
      <div className="flex justify-center">
        <div className="bg-white p-1.5 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("photos")}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === "photos"
                ? "bg-[#1565C0] text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Photo Albums ({photoUrls.length})
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all ${
              activeTab === "videos"
                ? "bg-[#1565C0] text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Video className="w-4 h-4" /> Video Library ({videos.length})
          </button>
        </div>
      </div>

      {/* Tab Panel: Photos */}
      {activeTab === "photos" && (
        <div>
          {photoUrls.length === 0 ? (
            <div className="text-center py-16 bg-white border border-sky-100 rounded-3xl">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Photos Found</h3>
              <p className="text-xs text-slate-400 mt-1">Photo albums are empty or currently updating.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photoUrls.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setActivePhoto(url)}
                  className="group relative bg-white aspect-square rounded-2xl overflow-hidden border border-sky-100/60 shadow-sm cursor-pointer hover:border-[#1565C0]/40 transition-all hover:-translate-y-0.5"
                >
                  <img
                    src={url}
                    alt={`Gallery Photo ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/90 text-[#1565C0] font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md scale-95 group-hover:scale-100 transition-transform">
                      <Eye className="w-3.5 h-3.5" /> View Photo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Panel: Videos */}
      {activeTab === "videos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="bg-white rounded-2xl overflow-hidden border border-sky-100 shadow-sm hover:shadow-md hover:border-[#1565C0]/25 transition-all flex flex-col justify-between group"
            >
              {/* Lazy YouTube Thumbnail Preview Card */}
              <div
                onClick={() => setActiveVideo(vid.id)}
                className="aspect-video bg-slate-950 relative cursor-pointer overflow-hidden group-hover:opacity-95 transition-opacity"
              >
                <img
                  src={`https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`}
                  alt={vid.title}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-90 scale-102 group-hover:scale-105 transition-transform duration-500"
                />
                {/* Big play button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <PlayCircle className="w-16 h-16 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                </div>
                {/* Duration Tag */}
                <span className="absolute bottom-3 right-3 bg-black/70 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {vid.duration}
                </span>
              </div>

              {/* Video Info footer */}
              <div className="p-5 space-y-2">
                <h4 className="text-sm font-bold text-slate-800 font-serif leading-snug group-hover:text-[#1565C0] transition-colors line-clamp-1">
                  {vid.title}
                </h4>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#C00000]" /> {vid.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal: Photo Viewer */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActivePhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={activePhoto} alt="Full Screen Photo" className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/15" />
          </div>
        </div>
      )}

      {/* Lightbox Modal: Video Player */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-black w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
