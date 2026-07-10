"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { getBanners, addBanner, updateBanner, deleteBanner } from "./actions";
import { Image as ImageIcon, Plus, Trash2, Edit2, X, ToggleLeft, ToggleRight, Loader2, AlertCircle, Search, Filter, Clock } from "lucide-react";
import { AdminConfirmDialog, AdminToast, useAdminFeedback } from "../components/AdminFeedback";

type BannerRecord = {
  id: string;
  imageUrl: string;
  title?: string | null;
  subtitle?: string | null;
  linkUrl?: string | null;
  isActive: boolean;
  createdAt?: Date | string;
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editBannerId, setEditBannerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Form states
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { toast, showToast, confirmDialog, requestConfirm, closeConfirm, handleConfirm, confirming } = useAdminFeedback();

  async function fetchBanners() {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(data as BannerRecord[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load banners");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      void fetchBanners();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const statusFilters = ["ALL", "ACTIVE", "INACTIVE"];

  const statusCounts = useMemo(() => {
    return banners.reduce(
      (acc, banner) => {
        acc.ALL += 1;
        acc[banner.isActive ? "ACTIVE" : "INACTIVE"] += 1;
        return acc;
      },
      { ALL: 0, ACTIVE: 0, INACTIVE: 0 } as Record<string, number>
    );
  }, [banners]);

  const filteredBanners = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return banners.filter((banner) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && banner.isActive) ||
        (statusFilter === "INACTIVE" && !banner.isActive);
      const matchesSearch =
        query === "" ||
        banner.imageUrl.toLowerCase().includes(query) ||
        (banner.title || "").toLowerCase().includes(query) ||
        (banner.subtitle || "").toLowerCase().includes(query) ||
        (banner.linkUrl || "").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [banners, searchQuery, statusFilter]);

  const openAddModal = () => {
    setEditBannerId(null);
    setImageUrl("");
    setTitle("");
    setSubtitle("");
    setLinkUrl("");
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (banner: BannerRecord) => {
    setEditBannerId(banner.id);
    setImageUrl(banner.imageUrl);
    setTitle(banner.title || "");
    setSubtitle(banner.subtitle || "");
    setLinkUrl(banner.linkUrl || "");
    setIsActive(banner.isActive);
    setModalOpen(true);
  };

  const handleToggleActive = async (banner: BannerRecord) => {
    try {
      const res = await updateBanner(banner.id, { isActive: !banner.isActive });
      if (res.success) {
        setBanners((prev) => prev.map((b) => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
        showToast(`Banner marked ${banner.isActive ? "inactive" : "active"}.`);
      } else {
        showToast(res.error || "Failed to toggle active status", "error");
      }
    } catch {
      showToast("Error updating active status", "error");
    }
  };

  const deleteBannerById = async (id: string) => {
    try {
      const res = await deleteBanner(id);
      if (res.success) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
        showToast("Slider banner deleted.");
      } else {
        showToast(res.error || "Failed to delete banner", "error");
      }
    } catch {
      showToast("Error deleting banner", "error");
    }
  };

  const handleDelete = (id: string) => {
    requestConfirm({
      title: "Delete slider banner?",
      message: "This banner will be removed from the homepage slider registry.",
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: () => deleteBannerById(id)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      showToast("Image URL is required", "error");
      return;
    }

    setSubmitLoading(true);
    try {
      if (editBannerId) {
        const res = await updateBanner(editBannerId, { imageUrl, title, subtitle, linkUrl, isActive });
        if (res.success) {
          setModalOpen(false);
          await fetchBanners();
          showToast("Banner updated successfully.");
        } else {
          showToast(res.error || "Failed to update banner", "error");
        }
      } else {
        const res = await addBanner({ imageUrl, title, subtitle, linkUrl, isActive });
        if (res.success) {
          setModalOpen(false);
          await fetchBanners();
          showToast("Banner added successfully.");
        } else {
          showToast(res.error || "Failed to add banner", "error");
        }
      }
    } catch {
      showToast("Error saving banner", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-700 dark:text-slate-300">
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <ImageIcon className="w-5 h-5 text-[#001C55] dark:text-blue-400" /> Slider Banners Manager
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Configure hero slider banners showing at the top of homepage.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>{filteredBanners.length} visible of {banners.length} banners</span>
          </div>
          <button 
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Slider Banner
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statusFilters.map((filterName) => {
          const isActive = statusFilter === filterName;
          const count = statusCounts[filterName] || 0;
          return (
            <button
              key={filterName}
              type="button"
              onClick={() => setStatusFilter(filterName)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                isActive
                  ? "bg-[#001C55] text-white border-[#001C55] shadow-lg shadow-blue-950/10"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/40 hover:-translate-y-0.5"
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-[0.14em] ${isActive ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>
                {filterName === "ALL" ? "All Banners" : filterName}
              </span>
              <span className="block text-2xl font-black mt-2 tracking-tight">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, subtitle, image URL, link..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 font-semibold"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 justify-start lg:justify-end">
          <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {statusFilters.map((filterName) => (
            <button
              key={filterName}
              type="button"
              onClick={() => setStatusFilter(filterName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                statusFilter === filterName
                  ? "bg-[#001C55] text-white border-[#001C55]"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {filterName === "ALL" ? "All" : filterName}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-800 dark:text-rose-200 rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#001C55] mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Loading slider banners, please wait...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-slate-500 dark:text-slate-400">No slider banners match the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBanners.map((banner) => (
            <div key={banner.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none flex flex-col justify-between">
              <div>
                {/* Banner Image Preview */}
                <div className="h-40 bg-slate-900 relative">
                  <Image src={banner.imageUrl} alt={banner.title || "Banner"} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-80" unoptimized />
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                    banner.isActive 
                      ? "bg-emerald-500 text-white border-emerald-600" 
                      : "bg-slate-700 text-slate-300 border-slate-600"
                  }`}>
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{banner.title || <span className="text-slate-400 dark:text-slate-500 italic">No Title</span>}</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold leading-relaxed line-clamp-2">{banner.subtitle || <span className="text-slate-400 dark:text-slate-500 italic">No Subtitle</span>}</p>
                  
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-3 font-semibold space-y-1">
                    <span className="block truncate">Image URL: {banner.imageUrl}</span>
                    <span className="block truncate">Link URL: {banner.linkUrl || "None"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950/70 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(banner)}
                  className="font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
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
                    type="button"
                    onClick={() => openEditModal(banner)}
                    aria-label={`Edit ${banner.title || "banner"}`}
                    className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDelete(banner.id)}
                    aria-label={`Delete ${banner.title || "banner"}`}
                    className="p-1.5 border border-rose-100 dark:border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {editBannerId ? "Edit Slider Banner" : "Add New Slider Banner"}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Image URL *</label>
                <input 
                  type="text" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/slider/your_image.png or full HTTP link" 
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Title (Optional)</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Protecting Human Rights" 
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Subtitle (Optional)</label>
                <textarea 
                  value={subtitle} 
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Securing Dignity, Liberty, and Equal Justice for all citizens of India." 
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Link URL (Optional)</label>
                <input 
                  type="text" 
                  value={linkUrl} 
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="e.g. #about, #courses, or /courses" 
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Show immediately on slider</span>
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

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitLoading}
                  className="px-5 py-2 bg-[#001C55] text-white hover:bg-[#001236] rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
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
