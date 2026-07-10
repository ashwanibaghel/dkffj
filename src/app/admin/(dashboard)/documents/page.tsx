"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getDocuments, addDocument, deleteDocument } from "./actions";
import { FileText, Download, Plus, Trash2, X, Loader2, AlertCircle, Shield, Award, Landmark, Search, Filter, Clock } from "lucide-react";
import { AdminConfirmDialog, AdminToast, useAdminFeedback } from "../components/AdminFeedback";

type DocumentRecord = {
  id: string;
  title: string;
  category: string;
  file_url: string;
  file_size: string;
  is_active: boolean;
  created_at: Date | string;
};

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Form states
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [size, setSize] = useState("PDF | 100 KB");
  const [category, setCategory] = useState("registration");
  const [submitLoading, setSubmitLoading] = useState(false);
  const { toast, showToast, confirmDialog, requestConfirm, closeConfirm, handleConfirm, confirming } = useAdminFeedback();

  async function fetchDocs() {
    setLoading(true);
    try {
      const data = await getDocuments();
      setDocuments(data as DocumentRecord[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      void fetchDocs();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const categoryFilters = ["ALL", "registration", "tax", "appreciation", "general"];

  const categoryCounts = useMemo(() => {
    return documents.reduce(
      (acc, doc) => {
        acc.ALL += 1;
        acc[doc.category] = (acc[doc.category] || 0) + 1;
        return acc;
      },
      { ALL: 0 } as Record<string, number>
    );
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchesCategory = categoryFilter === "ALL" || doc.category === categoryFilter;
      const matchesSearch =
        query === "" ||
        doc.title.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query) ||
        doc.file_url.toLowerCase().includes(query) ||
        doc.file_size.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, documents, searchQuery]);

  const openAddModal = () => {
    setTitle("");
    setUrl("");
    setSize("PDF | 100 KB");
    setCategory("registration");
    setModalOpen(true);
  };

  const deleteDocumentById = async (id: string) => {
    try {
      const res = await deleteDocument(id);
      if (res.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        showToast("Document registry deleted.");
      } else {
        showToast(res.error || "Failed to delete document", "error");
      }
    } catch {
      showToast("Error deleting document", "error");
    }
  };

  const handleDelete = (id: string) => {
    requestConfirm({
      title: "Delete document registry?",
      message: "This legal download entry will be removed from the public downloads area.",
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: () => deleteDocumentById(id)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      showToast("Title and URL are required", "error");
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await addDocument({ title, url, size, category });
      if (res.success) {
        setModalOpen(false);
        await fetchDocs();
        showToast("Document registry added.");
      } else {
        showToast(res.error || "Failed to add document", "error");
      }
    } catch {
      showToast("Error saving document", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderIcon = (cat: string) => {
    switch (cat) {
      case "registration":
        return <Landmark className="w-5 h-5" />;
      case "tax":
        return <Shield className="w-5 h-5" />;
      case "appreciation":
        return <Award className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    if (cat === "registration") return "Registration";
    if (cat === "tax") return "Tax Approvals";
    if (cat === "appreciation") return "Appreciation";
    return "General";
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <FileText className="w-5 h-5 text-[#001C55] dark:text-blue-400" /> Legal Documents Vault
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Manage public legal downloads, certificates of incorporation, and tax filings.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>{filteredDocuments.length} visible of {documents.length} documents</span>
          </div>
          <button 
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Upload Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {categoryFilters.map((cat) => {
          const isActive = categoryFilter === cat;
          const count = categoryCounts[cat] || 0;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                isActive
                  ? "bg-[#001C55] text-white border-[#001C55] shadow-lg shadow-blue-950/10"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/40 hover:-translate-y-0.5"
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-[0.14em] ${isActive ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>
                {cat === "ALL" ? "All" : getCategoryLabel(cat)}
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
            placeholder="Search title, category, URL, size..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 font-semibold"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 justify-start lg:justify-end">
          <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                categoryFilter === cat
                  ? "bg-[#001C55] text-white border-[#001C55]"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {cat === "ALL" ? "All" : getCategoryLabel(cat)}
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
          <p className="text-slate-500 dark:text-slate-400">Loading documents list, please wait...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-slate-500 dark:text-slate-400">No official documents match the current filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
          <div className="hidden lg:grid grid-cols-[minmax(320px,1.3fr)_150px_minmax(250px,1fr)_150px] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 sticky top-0 z-10">
            <span>Document</span>
            <span>Category</span>
            <span>File</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(320px,1.3fr)_150px_minmax(250px,1fr)_150px] gap-4 p-4 lg:px-5 lg:py-3 items-center hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#C00000]/5 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center text-[#C00000] dark:text-rose-300 shrink-0">
                    {renderIcon(doc.category)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-snug truncate">{doc.title}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-semibold">Added {new Date(doc.created_at).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>

                <div>
                  <span className="lg:hidden text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Category</span>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    {getCategoryLabel(doc.category)}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="lg:hidden text-[9px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">File</span>
                  <span className="text-slate-600 dark:text-slate-300 block font-bold">{doc.file_size}</span>
                  <span className="font-mono text-[10px] text-sky-700 dark:text-sky-300 block truncate">{doc.file_url}</span>
                </div>

                <div className="flex gap-2 shrink-0 justify-start lg:justify-end">
                  <button 
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    aria-label={`Delete ${doc.title}`}
                    className="p-2 border border-rose-100 dark:border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <a 
                    href={doc.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#001C55] text-white hover:bg-[#001236] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Add Document to Vault
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Document Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 12A Income Tax Exemption" 
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">File Path / URL *</label>
                <input 
                  type="text" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. /documents/1713277338.pdf" 
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">File Size *</label>
                  <input 
                    type="text" 
                    value={size} 
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. PDF | 55 KB" 
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category *</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  >
                    <option value="registration">Registration</option>
                    <option value="tax">Tax Approvals</option>
                    <option value="appreciation">Appreciation</option>
                    <option value="general">General</option>
                  </select>
                </div>
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
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
