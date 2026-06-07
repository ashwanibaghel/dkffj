"use client";

import React, { useState, useEffect } from "react";
import { getBanners, addBanner, updateBanner, deleteBanner } from "./actions";
import { Image as ImageIcon, Plus, Trash2, Edit2, Check, X, ToggleLeft, ToggleRight, Loader2, AlertCircle } from "lucide-react";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editBannerId, setEditBannerId] = useState<string | null>(null);

  // Form states
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (err: any) {
      setError(err.message || "Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditBannerId(null);
    setImageUrl("");
    setTitle("");
    setSubtitle("");
    setLinkUrl("");
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (banner: any) => {
    setEditBannerId(banner.id);
    setImageUrl(banner.imageUrl);
    setTitle(banner.title || "");
    setSubtitle(banner.subtitle || "");
    setLinkUrl(banner.linkUrl || "");
    setIsActive(banner.isActive);
    setModalOpen(true);
  };

  const handleToggleActive = async (banner: any) => {
    try {
      const res = await updateBanner(banner.id, { isActive: !banner.isActive });
      if (res.success) {
        setBanners(banners.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
      } else {
        alert(res.error || "Failed to toggle active status");
      }
    } catch (err) {
      alert("Error updating active status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slider banner?")) return;
    try {
      const res = await deleteBanner(id);
      if (res.success) {
        setBanners(banners.filter(b => b.id !== id));
      } else {
        alert(res.error || "Failed to delete banner");
      }
    } catch (err) {
      alert("Error deleting banner");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      alert("Image URL is required");
      return;
    }

    setSubmitLoading(true);
    try {
      if (editBannerId) {
        const res = await updateBanner(editBannerId, { imageUrl, title, subtitle, linkUrl, isActive });
        if (res.success) {
          setModalOpen(false);
          await fetchBanners();
        } else {
          alert(res.error || "Failed to update banner");
        }
      } else {
        const res = await addBanner({ imageUrl, title, subtitle, linkUrl, isActive });
        if (res.success) {
          setModalOpen(false);
          await fetchBanners();
        } else {
          alert(res.error || "Failed to add banner");
        }
      }
    } catch (err) {
      alert("Error saving banner");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-xs text-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#0F4C81]" /> Slider Banners Manager
          </h1>
          <p className="text-slate-500 text-[10px] mt-1 font-semibold">Configure hero slider banners showing at the top of homepage.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-4 py-2 bg-[#0F4C81] text-white hover:bg-[#0c3e6b] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Slider Banner
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F4C81] mx-auto mb-3" />
          <p className="text-slate-500">Loading slider banners, please wait...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <p className="text-slate-500">No slider banners created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                {/* Banner Image Preview */}
                <div className="h-40 bg-slate-900 relative">
                  <img src={banner.imageUrl} alt={banner.title || "Banner"} className="w-full h-full object-cover opacity-80" />
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                    banner.isActive 
                      ? "bg-emerald-500 text-white border-emerald-600" 
                      : "bg-slate-700 text-slate-300 border-slate-600"
                  }`}>
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-serif font-bold text-slate-800 text-sm">{banner.title || <span className="text-slate-400 italic">No Title</span>}</h3>
                  <p className="text-slate-500 font-semibold leading-relaxed line-clamp-2">{banner.subtitle || <span className="text-slate-400 italic">No Subtitle</span>}</p>
                  
                  <div className="text-[10px] text-slate-400 font-mono mt-3 font-semibold space-y-1">
                    <span className="block truncate">Image URL: {banner.imageUrl}</span>
                    <span className="block truncate">Link URL: {banner.linkUrl || "None"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 p-3 bg-slate-50/50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(banner)}
                  className="font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {banner.isActive ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-emerald-500" /> Active
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-slate-400" /> Inactive
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(banner)}
                    className="p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="p-1.5 border border-rose-100 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 font-serif">
                {editBannerId ? "Edit Slider Banner" : "Add New Slider Banner"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Image URL *</label>
                <input 
                  type="text" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/slider/your_image.png or full HTTP link" 
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Title (Optional)</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Protecting Human Rights" 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subtitle (Optional)</label>
                <textarea 
                  value={subtitle} 
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Securing Dignity, Liberty, and Equal Justice for all citizens of India." 
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Link URL (Optional)</label>
                <input 
                  type="text" 
                  value={linkUrl} 
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="e.g. #about, #courses, or /courses" 
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Show immediately on slider</span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className="cursor-pointer"
                >
                  {isActive ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitLoading}
                  className="px-5 py-2 bg-[#0F4C81] text-white hover:bg-[#0c3e6b] rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  {submitLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
