"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getNews, addNews, updateNews, deleteNews } from "./actions";
import { Newspaper, Plus, Trash2, Edit2, X, Loader2, AlertCircle, Search, Filter, Clock, CheckCircle2, FilePenLine } from "lucide-react";
import { AdminConfirmDialog, AdminToast, useAdminFeedback } from "../components/AdminFeedback";

type NewsRecord = {
  id: string;
  title: string;
  content: string;
  category?: string | null;
  is_published: boolean;
  created_at: Date | string;
};

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editNewsId, setEditNewsId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Announcements");
  const [status, setStatus] = useState("Published");
  const [submitLoading, setSubmitLoading] = useState(false);
  const { toast, showToast, confirmDialog, requestConfirm, closeConfirm, handleConfirm, confirming } = useAdminFeedback();

  async function fetchNews() {
    setLoading(true);
    try {
      const data = await getNews();
      setNews(data as NewsRecord[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load news posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      void fetchNews();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const statusFilters = ["ALL", "Published", "Draft"];

  const statusCounts = useMemo(() => {
    return news.reduce(
      (acc, post) => {
        acc.ALL += 1;
        acc[post.is_published ? "Published" : "Draft"] += 1;
        return acc;
      },
      { ALL: 0, Published: 0, Draft: 0 } as Record<string, number>
    );
  }, [news]);

  const filteredNews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return news.filter((post) => {
      const postStatus = post.is_published ? "Published" : "Draft";
      const matchesStatus = statusFilter === "ALL" || postStatus === statusFilter;
      const matchesSearch =
        query === "" ||
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.category || "General").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [news, searchQuery, statusFilter]);

  const openAddModal = () => {
    setEditNewsId(null);
    setTitle("");
    setContent("");
    setCategory("Announcements");
    setStatus("Published");
    setModalOpen(true);
  };

  const openEditModal = (item: NewsRecord) => {
    setEditNewsId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setCategory(item.category || "Announcements");
    setStatus(item.is_published ? "Published" : "Draft");
    setModalOpen(true);
  };

  const handleToggleStatus = async (item: NewsRecord) => {
    const newStatus = item.is_published ? "Draft" : "Published";
    try {
      const res = await updateNews(item.id, { status: newStatus });
      if (res.success) {
        setNews((prev) => prev.map((n) => n.id === item.id ? { ...n, is_published: !item.is_published } : n));
        showToast(`News post moved to ${newStatus}.`);
      } else {
        showToast(res.error || "Failed to update publication status", "error");
      }
    } catch {
      showToast("Error updating status", "error");
    }
  };

  const deleteNewsById = async (id: string) => {
    try {
      const res = await deleteNews(id);
      if (res.success) {
        setNews((prev) => prev.filter((n) => n.id !== id));
        showToast("News post deleted.");
      } else {
        showToast(res.error || "Failed to delete news post", "error");
      }
    } catch {
      showToast("Error deleting news post", "error");
    }
  };

  const handleDelete = (id: string) => {
    requestConfirm({
      title: "Delete news post?",
      message: "This post will be removed from the news and blog desk.",
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: () => deleteNewsById(id)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !category.trim()) {
      showToast("Title, content, and category are required", "error");
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = { title, content, category, status };
      if (editNewsId) {
        const res = await updateNews(editNewsId, payload);
        if (res.success) {
          setModalOpen(false);
          await fetchNews();
          showToast("News post updated.");
        } else {
          showToast(res.error || "Failed to update news", "error");
        }
      } else {
        const res = await addNews(payload);
        if (res.success) {
          setModalOpen(false);
          await fetchNews();
          showToast("News post created.");
        } else {
          showToast(res.error || "Failed to add news", "error");
        }
      }
    } catch {
      showToast("Error saving news", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished
      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20"
      : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20";
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
            <Newspaper className="w-5 h-5 text-[#001C55] dark:text-blue-400" /> News & Blog Desk
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Publish news updates, press statements, and official campaigns.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>{filteredNews.length} visible of {news.length} posts</span>
          </div>
          <button 
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create News Post
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statusFilters.map((statusName) => {
          const isActive = statusFilter === statusName;
          const count = statusCounts[statusName] || 0;
          return (
            <button
              key={statusName}
              type="button"
              onClick={() => setStatusFilter(statusName)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                isActive
                  ? "bg-[#001C55] text-white border-[#001C55] shadow-lg shadow-blue-950/10"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/40 hover:-translate-y-0.5"
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-[0.14em] ${isActive ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>
                {statusName === "ALL" ? "All Posts" : statusName}
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
            placeholder="Search title, content, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 font-semibold"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 justify-start lg:justify-end">
          <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {statusFilters.map((statusName) => (
            <button
              key={statusName}
              type="button"
              onClick={() => setStatusFilter(statusName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                statusFilter === statusName
                  ? "bg-[#001C55] text-white border-[#001C55]"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {statusName === "ALL" ? "All" : statusName}
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
          <p className="text-slate-500 dark:text-slate-400">Loading announcements, please wait...</p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-slate-500 dark:text-slate-400">No news updates match the current filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
          <div className="hidden lg:grid grid-cols-[minmax(360px,1.4fr)_160px_130px_170px] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 sticky top-0 z-10">
            <span>Post</span>
            <span>Category</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {filteredNews.map((post) => (
              <div key={post.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(360px,1.4fr)_160px_130px_170px] gap-4 p-4 lg:px-5 lg:py-3 items-center hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#001C55]/5 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-[#001C55] dark:text-blue-300 shrink-0">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-snug truncate">{post.title}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-semibold">
                      Posted {new Date(post.created_at).toLocaleDateString("en-IN")}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-normal font-medium">{post.content}</p>
                  </div>
                </div>

                <div>
                  <span className="lg:hidden text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Category</span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    <FilePenLine className="w-3 h-3" />
                    {post.category || "General"}
                  </span>
                </div>

                <div>
                  <span className="lg:hidden text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Status</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(post.is_published)}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {post.is_published ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="flex gap-2 shrink-0 justify-start lg:justify-end">
                  <button 
                    type="button"
                    onClick={() => handleToggleStatus(post)}
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {post.is_published ? "Draft" : "Publish"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => openEditModal(post)}
                    aria-label={`Edit ${post.title}`}
                    className="p-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    aria-label={`Delete ${post.title}`}
                    className="p-2 border border-rose-100 dark:border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-xl animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {editNewsId ? "Edit Press Release" : "Publish Campaign Update"}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Post Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Free Legal Aid Camps Launched in 10 Districts" 
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category *</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  >
                    <option value="Announcements">Announcements</option>
                    <option value="Press Release">Press Release</option>
                    <option value="Guidelines">Guidelines</option>
                    <option value="Address">Address</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status *</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Content / Body *</label>
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type the news or article content in detail..." 
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                />
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
                  Save Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
