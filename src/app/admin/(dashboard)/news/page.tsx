"use client";

import React, { useState, useEffect } from "react";
import { getNews, addNews, updateNews, deleteNews } from "./actions";
import { Newspaper, Plus, Trash2, Edit2, X, Loader2, AlertCircle } from "lucide-react";

export default function AdminNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editNewsId, setEditNewsId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Announcements");
  const [status, setStatus] = useState("Published");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await getNews();
      setNews(data);
    } catch (err: any) {
      setError(err.message || "Failed to load news posts");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditNewsId(null);
    setTitle("");
    setContent("");
    setCategory("Announcements");
    setStatus("Published");
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditNewsId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setCategory(item.category);
    setStatus(item.status);
    setModalOpen(true);
  };

  const handleToggleStatus = async (item: any) => {
    const newStatus = item.status === "Published" ? "Draft" : "Published";
    try {
      const res = await updateNews(item.id, { status: newStatus });
      if (res.success) {
        setNews(news.map(n => n.id === item.id ? { ...n, status: newStatus } : n));
      } else {
        alert(res.error || "Failed to update publication status");
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news post?")) return;
    try {
      const res = await deleteNews(id);
      if (res.success) {
        setNews(news.filter(n => n.id !== id));
      } else {
        alert(res.error || "Failed to delete news post");
      }
    } catch (err) {
      alert("Error deleting news post");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !category.trim()) {
      alert("Title, Content, and Category are required");
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
        } else {
          alert(res.error || "Failed to update news");
        }
      } else {
        const res = await addNews(payload);
        if (res.success) {
          setModalOpen(false);
          await fetchNews();
        } else {
          alert(res.error || "Failed to add news");
        }
      }
    } catch (err) {
      alert("Error saving news");
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
            <Newspaper className="w-5 h-5 text-[#0F4C81]" /> News & Blog Desk
          </h1>
          <p className="text-slate-500 text-[10px] mt-1 font-semibold">Publish news updates, press statements, and official campaigns.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-4 py-2 bg-[#0F4C81] text-white hover:bg-[#0c3e6b] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create News Post
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
          <p className="text-slate-500">Loading announcements, please wait...</p>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <p className="text-slate-500">No news updates or campaigns found.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active press articles</h3>
          </div>
          <div className="divide-y divide-slate-150 text-slate-700">
            {news.map((post) => (
              <div key={post.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#0F4C81]/5 border border-slate-250 flex items-center justify-center text-[#0F4C81] shrink-0">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-snug">{post.title}</h4>
                    <span className="text-[10px] text-slate-400 mt-1 block font-semibold">
                      Category: <strong className="text-slate-600">{post.category}</strong> | 
                      Published: {new Date(post.publishedAt).toLocaleDateString("en-IN")} | 
                      Status: <strong className={post.status === "Published" ? "text-emerald-600" : "text-amber-600"}>{post.status}</strong>
                    </span>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal font-medium">{post.content}</p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 ml-4">
                  <button 
                    onClick={() => handleToggleStatus(post)}
                    className="px-2.5 py-1.5 border border-slate-200 text-slate-650 hover:bg-slate-55 rounded-lg font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {post.status === "Published" ? "Draft" : "Publish"}
                  </button>
                  <button 
                    onClick={() => openEditModal(post)}
                    className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="p-2 border border-rose-100 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-xl animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 font-serif">
                {editNewsId ? "Edit Press Release" : "Publish Campaign Update"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Post Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Free Legal Aid Camps Launched in 10 Districts" 
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category *</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                  >
                    <option value="Announcements">Announcements</option>
                    <option value="Press Release">Press Release</option>
                    <option value="Guidelines">Guidelines</option>
                    <option value="Address">Address</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status *</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Content / Body *</label>
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type the news or article content in detail..." 
                  required
                  rows={6}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-55 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitLoading}
                  className="px-5 py-2 bg-[#0F4C81] text-white hover:bg-[#0c3e6b] rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
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
