"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getGalleryItems, addGalleryItem, deleteGalleryItem, getVideoItems, addVideoItem, deleteVideoItem } from "./actions";
import { Image as ImageIcon, Video, Trash2, Plus, X, Loader2, AlertCircle, Search, Clock } from "lucide-react";
import { AdminConfirmDialog, AdminToast, useAdminFeedback } from "../components/AdminFeedback";

type PhotoRecord = {
  id: string;
  imageUrl: string;
  title?: string | null;
  isActive?: boolean;
  created_at?: Date | string;
};

type VideoRecord = {
  id: string;
  youtubeId: string;
  title: string;
  duration: string;
  date: string;
  isActive?: boolean;
  created_at?: Date | string;
};

export default function AdminGalleryPage() {
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form States for Photo
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");

  // Form States for Video
  const [youtubeId, setYoutubeId] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [duration, setDuration] = useState("10:00");
  const [date, setDate] = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const { toast, showToast, confirmDialog, requestConfirm, closeConfirm, handleConfirm, confirming } = useAdminFeedback();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "photos") {
        const data = await getGalleryItems();
        setPhotos(data as PhotoRecord[]);
      } else {
        const data = await getVideoItems();
        setVideos(data as VideoRecord[]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      void fetchData();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [fetchData]);

  const filteredPhotos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return photos.filter((photo) => {
      return (
        query === "" ||
        (photo.title || "Untitled Photo").toLowerCase().includes(query) ||
        photo.imageUrl.toLowerCase().includes(query)
      );
    });
  }, [photos, searchQuery]);

  const filteredVideos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return videos.filter((video) => {
      return (
        query === "" ||
        video.title.toLowerCase().includes(query) ||
        video.youtubeId.toLowerCase().includes(query) ||
        video.duration.toLowerCase().includes(query) ||
        video.date.toLowerCase().includes(query)
      );
    });
  }, [videos, searchQuery]);

  const deletePhotoById = async (id: string) => {
    try {
      const res = await deleteGalleryItem(id);
      if (res.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
        showToast("Photo removed from gallery.");
      } else {
        showToast(res.error || "Failed to delete photo", "error");
      }
    } catch {
      showToast("Error deleting photo", "error");
    }
  };

  const deleteVideoById = async (id: string) => {
    try {
      const res = await deleteVideoItem(id);
      if (res.success) {
        setVideos((prev) => prev.filter((v) => v.id !== id));
        showToast("Video removed from library.");
      } else {
        showToast(res.error || "Failed to delete video", "error");
      }
    } catch {
      showToast("Error deleting video", "error");
    }
  };

  const handleDeletePhoto = (id: string) => {
    requestConfirm({
      title: "Delete photo?",
      message: "This photo will be removed from the public gallery.",
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: () => deletePhotoById(id)
    });
  };

  const handleDeleteVideo = (id: string) => {
    requestConfirm({
      title: "Delete video?",
      message: "This video entry will be removed from the public media library.",
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: () => deleteVideoById(id)
    });
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) {
      showToast("Image URL is required", "error");
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await addGalleryItem({ imageUrl: photoUrl, title: photoTitle });
      if (res.success) {
        setModalOpen(false);
        setPhotoUrl("");
        setPhotoTitle("");
        await fetchData();
        showToast("Photo added to gallery.");
      } else {
        showToast(res.error || "Failed to add photo", "error");
      }
    } catch {
      showToast("Error saving photo", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeId.trim() || !videoTitle.trim()) {
      showToast("YouTube ID and title are required", "error");
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await addVideoItem({
        youtubeId,
        title: videoTitle,
        duration,
        date: date || new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
      });
      if (res.success) {
        setModalOpen(false);
        setYoutubeId("");
        setVideoTitle("");
        setDuration("10:00");
        setDate("");
        await fetchData();
        showToast("Video added to library.");
      } else {
        showToast(res.error || "Failed to add video", "error");
      }
    } catch {
      showToast("Error saving video", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-700 dark:text-slate-300 font-semibold">
      <AdminToast toast={toast} />
      <AdminConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        confirmLabel={confirmDialog?.confirmLabel}
        cancelLabel={confirmDialog?.cancelLabel}
        tone={confirmDialog?.tone}
        loading={confirming}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
      {/* Header banner */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <ImageIcon className="w-5 h-5 text-[#001C55] dark:text-blue-400" /> Media Gallery Manager
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Add, delete, and control photo albums and press briefing video libraries.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {activeTab === "photos" ? filteredPhotos.length : filteredVideos.length} visible of {activeTab === "photos" ? photos.length : videos.length} {activeTab}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setError("");
              setModalOpen(true);
            }}
            className="bg-[#1565C0] hover:bg-[#0D47A1] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all font-bold uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("photos")}
          className={`text-left rounded-2xl border p-4 transition-all ${
            activeTab === "photos"
              ? "bg-[#001C55] text-white border-[#001C55] shadow-lg shadow-blue-950/10"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/40 hover:-translate-y-0.5"
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-[0.14em] flex items-center gap-2 ${activeTab === "photos" ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>
            <ImageIcon className="w-3.5 h-3.5" /> Photo Albums
          </span>
          <span className="block text-2xl font-black mt-2 tracking-tight">{photos.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("videos")}
          className={`text-left rounded-2xl border p-4 transition-all ${
            activeTab === "videos"
              ? "bg-[#001C55] text-white border-[#001C55] shadow-lg shadow-blue-950/10"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/40 hover:-translate-y-0.5"
          }`}
        >
          <span className={`text-[10px] font-black uppercase tracking-[0.14em] flex items-center gap-2 ${activeTab === "videos" ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>
            <Video className="w-3.5 h-3.5" /> Video Library
          </span>
          <span className="block text-2xl font-black mt-2 tracking-tight">{videos.length}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === "photos" ? "Search photo title or image URL..." : "Search video title, ID, duration, date..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 font-semibold"
          />
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Loader2 className="w-8 h-8 text-[#1565C0] animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-200 border border-red-100 dark:border-red-500/20 rounded-2xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : activeTab === "photos" ? (
        /* PHOTOS PANEL */
        filteredPhotos.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 dark:text-slate-500">No photos match the current search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredPhotos.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none relative group flex flex-col justify-between">
                <div className="aspect-square bg-slate-100 relative">
                  <Image src={item.imageUrl} alt={item.title || "Photo"} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" unoptimized />
                </div>
                <div className="p-3 flex justify-between items-center gap-2 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800">
                  <span className="truncate font-bold text-slate-800 dark:text-slate-100 flex-1">{item.title || "Untitled Photo"}</span>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(item.id)}
                    className="p-1 rounded-lg text-red-500 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* VIDEOS PANEL */
        filteredVideos.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Video className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 dark:text-slate-500">No videos match the current search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVideos.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none flex items-start gap-4 justify-between">
                <div className="w-28 shrink-0 aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                  <Image src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`} alt={item.title} fill sizes="112px" className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 leading-snug line-clamp-1">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">ID: {item.youtubeId}</p>
                  <div className="flex items-center gap-3 text-[10px] text-[#1565C0] dark:text-blue-300 font-bold">
                    <span>Duration: {item.duration}</span>
                    <span>Date: {item.date}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteVideo(item.id)}
                  className="p-1.5 rounded-lg text-red-500 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                  title="Delete Video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Add New Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-[#0a3c8a] text-white">
              <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                {activeTab === "photos" ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                Add New {activeTab === "photos" ? "Photo Entry" : "Video Briefing"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-white hover:text-white/80 p-1 bg-white/10 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            {activeTab === "photos" ? (
              <form onSubmit={handleSubmitPhoto} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Photo Title</label>
                  <input
                    type="text"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    placeholder="e.g. Legal Relief Camp 2026"
                    className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#1565C0] bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Image Source URL</label>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/..."
                    required
                    className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#1565C0] bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="bg-[#1565C0] hover:bg-[#0D47A1] text-white px-4 py-2 rounded-lg flex items-center gap-1 shadow-md shadow-blue-500/10"
                  >
                    {submitLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Photo
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitVideo} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Video Title</label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. Director Danish Khan Addressing Press Cell"
                    required
                    className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#1565C0] bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">YouTube Video ID</label>
                  <input
                    type="text"
                    value={youtubeId}
                    onChange={(e) => setYoutubeId(e.target.value)}
                    placeholder="e.g. hjLMgfZ_Wp4"
                    required
                    className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#1565C0] bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Duration (MM:SS)</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 10:24"
                      className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#1565C0] bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Custom Date</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. September 2024"
                      className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#1565C0] bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="bg-[#1565C0] hover:bg-[#0D47A1] text-white px-4 py-2 rounded-lg flex items-center gap-1 shadow-md shadow-blue-500/10"
                  >
                    {submitLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Save Video
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
