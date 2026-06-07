"use client";

import React, { useState, useEffect } from "react";
import { getDocuments, addDocument, deleteDocument } from "./actions";
import { FileText, Download, Plus, Trash2, X, Loader2, AlertCircle, Shield, Award, Landmark } from "lucide-react";

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [size, setSize] = useState("PDF | 100 KB");
  const [category, setCategory] = useState("registration");
  const [iconType, setIconType] = useState("building");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err: any) {
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setTitle("");
    setUrl("");
    setSize("PDF | 100 KB");
    setCategory("registration");
    setIconType("building");
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document registry?")) return;
    try {
      const res = await deleteDocument(id);
      if (res.success) {
        setDocuments(documents.filter(d => d.id !== id));
      } else {
        alert(res.error || "Failed to delete document");
      }
    } catch (err) {
      alert("Error deleting document");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert("Title and URL are required");
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await addDocument({ title, url, size, category, iconType });
      if (res.success) {
        setModalOpen(false);
        await fetchDocs();
      } else {
        alert(res.error || "Failed to add document");
      }
    } catch (err) {
      alert("Error saving document");
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "building":
        return <Landmark className="w-5 h-5" />;
      case "shield":
        return <Shield className="w-5 h-5" />;
      case "award":
        return <Award className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-xs text-slate-700 font-semibold">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0F4C81]" /> Legal Documents Vault
          </h1>
          <p className="text-slate-500 text-[10px] mt-1 font-semibold">Manage public legal downloads, certificates of incorporation, and tax filings.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-4 py-2 bg-[#0F4C81] text-white hover:bg-[#0c3e6b] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Upload Document
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
          <p className="text-slate-500">Loading documents list, please wait...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <p className="text-slate-500">No official documents registered yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Legal Filings</h3>
          </div>
          <div className="divide-y divide-slate-150 text-slate-700">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#D62828]/5 border border-slate-250 flex items-center justify-center text-[#D62828] shrink-0">
                    {renderIcon(doc.iconType)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-snug">{doc.title}</h4>
                    <span className="text-[10px] text-slate-400 mt-1 block font-semibold">
                      Category: <span className="text-slate-650 uppercase font-bold">{doc.category}</span> | 
                      Size: {doc.size} | 
                      File URL: <span className="font-mono text-sky-600 font-bold">{doc.url}</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 ml-4">
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 border border-rose-100 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#0F4C81] text-white hover:bg-[#0c3c66] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
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
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 font-serif">
                Add Document to Vault
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Document Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 12A Income Tax Exemption" 
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">File Path / URL *</label>
                <input 
                  type="text" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. /documents/1713277338.pdf" 
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">File Size *</label>
                  <input 
                    type="text" 
                    value={size} 
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. PDF | 55 KB" 
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category *</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                  >
                    <option value="registration">Registration</option>
                    <option value="tax">Tax Approvals</option>
                    <option value="appreciation">Appreciation</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Icon Type *</label>
                  <select 
                    value={iconType} 
                    onChange={(e) => setIconType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0F4C81]"
                  >
                    <option value="building">Building / Org</option>
                    <option value="shield">Shield / Tax</option>
                    <option value="award">Award / Star</option>
                    <option value="download">File / Download</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-650 hover:bg-slate-55 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitLoading}
                  className="px-5 py-2 bg-[#0F4C81] text-white hover:bg-[#0c3e6b] rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
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
