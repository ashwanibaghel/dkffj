"use client";

import React, { useState, useEffect } from "react";
import { getGalleryItems, addGalleryItem, deleteGalleryItem, getVideoItems, addVideoItem, deleteVideoItem } from "./actions";
import { Image as ImageIcon, Video, Trash2, Plus, X, Loader2, AlertCircle, Link2, Youtube, ExternalLink } from "lucide-react";

export default function AdminGalleryPage() {
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");
  const [photos, setPhotos] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Form States for Photo
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");

  // Form States for Video
  const [youtubeId, setYoutubeId] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [duration, setDuration] = useState("10:00");
  const [date, setDate] = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "photos") {
        const data = await getGalleryItems();
        setPhotos(data);
      } else {
        const data = await getVideoItems();
        setVideos(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    try {
      const res = await deleteGalleryItem(id);
      if (res.success) {
        setPhotos(photos.filter((p) => p.id !== id));
      } else {
        alert(res.error || "Failed to delete photo");
      }
    } catch (err) {
      alert("Error deleting photo");
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      const res = await deleteVideoItem(id);
      if (res.success) {
        setVideos(videos.filter((v) => v.id !== id));
      } else {
        alert(res.error || "Failed to delete video");
      }
    } catch (err) {
      alert("Error deleting video");
    }
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) {
      alert("Image URL is required");
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
      } else {
        alert(res.error || "Failed to add photo");
      }
    } catch (err) {
      alert("Error saving photo");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeId.trim() || !videoTitle.trim()) {
      alert("YouTube ID and Title are required");
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
      } else {
        alert(res.error || "Failed to add video");
      }
    } catch (err) {
      alert("Error saving video");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-xs text-slate-700 font-semibold">
      {/* Header banner */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-sky-100/80 shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-slate-900">Media Gallery Manager</h1>
          <p className="text-[10px] text-slate-400 font-medium">Add, delete, and control photo albums and press briefing video libraries.</p>
        </div>
        <button
          onClick={() => {
            setError("");
            setModalOpen(true);
          }}
          className="bg-[#1565C0] hover:bg-[#0D47A1] text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("photos")}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "photos" ? "border-[#1565C0] text-[#1565C0]" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Photo Albums
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "videos" ? "border-[#1565C0] text-[#1565C0]" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Video className="w-4 h-4" /> Video Library
        </button>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white border border-sky-100 rounded-3xl">
          <Loader2 className="w-8 h-8 text-[#1565C0] animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : activeTab === "photos" ? (
        /* PHOTOS PANEL */
        photos.length === 0 ? (
          <div className="text-center py-16 bg-white border border-sky-100 rounded-3xl">
            <ImageIcon className="w-12 h-12 text-slate-350 mx-auto mb-3" />
            <p className="text-slate-400">No photos in database registry. Click Add New to include a photo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-sky-100/80 shadow-sm relative group flex flex-col justify-between">
                <div className="aspect-square bg-slate-100 relative">
                  <img src={item.imageUrl} alt={item.title || "Photo"} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex justify-between items-center gap-2 bg-slate-50 border-t border-slate-100">
                  <span className="truncate font-bold text-slate-800 flex-1">{item.title || "Untitled Photo"}</span>
                  <button
                    onClick={() => handleDeletePhoto(item.id)}
                    className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
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
        videos.length === 0 ? (
          <div className="text-center py-16 bg-white border border-sky-100 rounded-3xl">
            <Video className="w-12 h-12 text-slate-350 mx-auto mb-3" />
            <p className="text-slate-400">No videos in database registry. Click Add New to include a press briefing video.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-sky-100/80 shadow-sm flex items-start gap-4 justify-between">
                <div className="w-28 shrink-0 aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                  <img src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-extrabold text-slate-900 leading-snug line-clamp-1">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {item.youtubeId}</p>
                  <div className="flex items-center gap-3 text-[10px] text-[#1565C0] font-bold">
                    <span>Duration: {item.duration}</span>
                    <span>Date: {item.date}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteVideo(item.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0"
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
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-sky-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-[#0a3c8a] text-white">
              <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                {activeTab === "photos" ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                Add New {activeTab === "photos" ? "Photo Entry" : "Video Briefing"}
              </h3>
              <button
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
                  <label className="text-[10px] uppercase font-bold text-slate-400">Photo Title</label>
                  <input
                    type="text"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    placeholder="e.g. Legal Relief Camp 2026"
                    className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:border-[#1565C0] bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Image Source URL</label>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/..."
                    required
                    className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:border-[#1565C0] bg-slate-50/50"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
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
                  <label className="text-[10px] uppercase font-bold text-slate-400">Video Title</label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. Director Danish Khan Addressing Press Cell"
                    required
                    className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:border-[#1565C0] bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">YouTube Video ID</label>
                  <input
                    type="text"
                    value={youtubeId}
                    onChange={(e) => setYoutubeId(e.target.value)}
                    placeholder="e.g. hjLMgfZ_Wp4"
                    required
                    className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:border-[#1565C0] bg-slate-50/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Duration (MM:SS)</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 10:24"
                      className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:border-[#1565C0] bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Custom Date</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. September 2024"
                      className="w-full p-2 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:border-[#1565C0] bg-slate-50/50"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
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
