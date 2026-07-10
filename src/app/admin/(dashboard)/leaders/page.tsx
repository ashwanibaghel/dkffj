"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { getLeaders, addLeader, updateLeader, deleteLeader } from "./actions";
import { Users, Plus, Trash2, Edit2, X, ToggleLeft, ToggleRight, Loader2, AlertCircle, Search, Filter, Clock, Home } from "lucide-react";
import { AdminConfirmDialog, AdminToast, useAdminFeedback } from "../components/AdminFeedback";

type LeaderRecord = {
  id: string;
  name: string;
  role: string;
  education?: string | null;
  location?: string | null;
  mobile?: string | null;
  photo?: string | null;
  status: number;
  showHome: number;
  description?: string | null;
};

export default function AdminLeadersPage() {
  const [leaders, setLeaders] = useState<LeaderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editLeaderId, setEditLeaderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Form states
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [education, setEducation] = useState("");
  const [location, setLocation] = useState("");
  const [mobile, setMobile] = useState("");
  const [photo, setPhoto] = useState("");
  const [status, setStatus] = useState(1);
  const [showHome, setShowHome] = useState(1);
  const [description, setDescription] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const { toast, showToast, confirmDialog, requestConfirm, closeConfirm, handleConfirm, confirming } = useAdminFeedback();

  async function fetchLeaders() {
    setLoading(true);
    try {
      const data = await getLeaders();
      setLeaders(data as LeaderRecord[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load leaders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      void fetchLeaders();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  const statusFilters = ["ALL", "ACTIVE", "INACTIVE", "HOME"];

  const statusCounts = useMemo(() => {
    return leaders.reduce(
      (acc, leader) => {
        acc.ALL += 1;
        if (leader.status === 1) acc.ACTIVE += 1;
        if (leader.status !== 1) acc.INACTIVE += 1;
        if (leader.showHome === 1) acc.HOME += 1;
        return acc;
      },
      { ALL: 0, ACTIVE: 0, INACTIVE: 0, HOME: 0 } as Record<string, number>
    );
  }, [leaders]);

  const filteredLeaders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return leaders.filter((leader) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && leader.status === 1) ||
        (statusFilter === "INACTIVE" && leader.status !== 1) ||
        (statusFilter === "HOME" && leader.showHome === 1);

      const matchesSearch =
        query === "" ||
        leader.id.toLowerCase().includes(query) ||
        leader.name.toLowerCase().includes(query) ||
        leader.role.toLowerCase().includes(query) ||
        (leader.education || "").toLowerCase().includes(query) ||
        (leader.location || "").toLowerCase().includes(query) ||
        (leader.mobile || "").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [leaders, searchQuery, statusFilter]);

  const openAddModal = () => {
    setEditLeaderId(null);
    setId("");
    setName("");
    setRole("");
    setEducation("");
    setLocation("");
    setMobile("");
    setPhoto("");
    setStatus(1);
    setShowHome(1);
    setDescription("");
    setModalOpen(true);
  };

  const openEditModal = (leader: LeaderRecord) => {
    setEditLeaderId(leader.id);
    setId(leader.id);
    setName(leader.name);
    setRole(leader.role);
    setEducation(leader.education || "");
    setLocation(leader.location || "");
    setMobile(leader.mobile || "");
    setPhoto(leader.photo);
    setStatus(leader.status);
    setShowHome(leader.showHome);
    setDescription(leader.description || "");
    setModalOpen(true);
  };

  const handleToggleStatus = async (leader: LeaderRecord) => {
    const newStatus = leader.status === 1 ? 0 : 1;
    try {
      const res = await updateLeader(leader.id, { status: newStatus });
      if (res.success) {
        setLeaders((prev) => prev.map((l) => l.id === leader.id ? { ...l, status: newStatus } : l));
        showToast(`${leader.name} marked ${newStatus === 1 ? "active" : "inactive"}.`);
      } else {
        showToast(res.error || "Failed to toggle status", "error");
      }
    } catch {
      showToast("Error updating status", "error");
    }
  };

  const handleToggleShowHome = async (leader: LeaderRecord) => {
    const newShowHome = leader.showHome === 1 ? 0 : 1;
    try {
      const res = await updateLeader(leader.id, { showHome: newShowHome });
      if (res.success) {
        setLeaders((prev) => prev.map((l) => l.id === leader.id ? { ...l, showHome: newShowHome } : l));
        showToast(`${leader.name} ${newShowHome === 1 ? "shown on" : "hidden from"} homepage.`);
      } else {
        showToast(res.error || "Failed to toggle homepage visibility", "error");
      }
    } catch {
      showToast("Error updating homepage visibility", "error");
    }
  };

  const deleteLeaderById = async (id: string) => {
    try {
      const res = await deleteLeader(id);
      if (res.success) {
        setLeaders((prev) => prev.filter((l) => l.id !== id));
        showToast("Council member deleted.");
      } else {
        showToast(res.error || "Failed to delete leader", "error");
      }
    } catch {
      showToast("Error deleting leader", "error");
    }
  };

  const handleDelete = (id: string) => {
    requestConfirm({
      title: "Delete council member?",
      message: "This executive council profile will be removed from the registry.",
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: () => deleteLeaderById(id)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim() || !role.trim()) {
      showToast("ID, name, and role are required", "error");
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = { id, name, role, education, location, mobile, photo, status, showHome, description };
      if (editLeaderId) {
        const res = await updateLeader(editLeaderId, payload);
        if (res.success) {
          setModalOpen(false);
          await fetchLeaders();
          showToast("Council member updated.");
        } else {
          showToast(res.error || "Failed to update leader", "error");
        }
      } else {
        const res = await addLeader(payload);
        if (res.success) {
          setModalOpen(false);
          await fetchLeaders();
          showToast("Council member added.");
        } else {
          showToast(res.error || "Failed to add leader", "error");
        }
      }
    } catch {
      showToast("Error saving leader", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const initialsFor = (leaderName: string) => {
    const nameParts = leaderName.trim().split(/\s+/);
    return nameParts.length > 1
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : nameParts[0] ? nameParts[0].slice(0, 2).toUpperCase() : "??";
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
            <Users className="w-5 h-5 text-[#001C55] dark:text-blue-400" /> Executive Council Registry
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Manage profiles, contact cards, and website display for DKFFJ Board Leaders.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>{filteredLeaders.length} visible of {leaders.length} leaders</span>
          </div>
          <button 
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Council Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                {filterName === "ALL" ? "All Leaders" : filterName === "HOME" ? "Homepage" : filterName}
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
            placeholder="Search name, role, mobile, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 font-semibold"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 justify-start lg:justify-end">
          <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> View:
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
              {filterName === "ALL" ? "All" : filterName === "HOME" ? "Homepage" : filterName}
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
          <p className="text-slate-500 dark:text-slate-400">Loading council registry, please wait...</p>
        </div>
      ) : filteredLeaders.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-slate-500 dark:text-slate-400">No council members match the current filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.14em] text-[10px]">
                  <th className="p-4">Profile</th>
                  <th className="p-4">Location & Mobile</th>
                  <th className="p-4">Qualifications</th>
                  <th className="p-4">Homepage Show</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                {filteredLeaders.map((leader) => (
                  <tr key={leader.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {leader.photo && leader.photo.trim() !== "" ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800">
                          <Image src={leader.photo} alt={leader.name} width={40} height={40} className="h-full w-full object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#001C55]/10 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[#001C55] dark:text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0 shadow-inner">
                          {initialsFor(leader.name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 truncate">{leader.name}</h4>
                        <span className="text-[10px] text-[#C00000] font-bold block mt-0.5">{leader.role}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono font-medium mt-0.5 block">ID: {leader.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="block font-bold text-slate-800 dark:text-slate-100">{leader.location || "None"}</span>
                      <span className="block text-slate-400 dark:text-slate-500 font-mono mt-0.5 font-medium">{leader.mobile || "None"}</span>
                    </td>
                    <td className="p-4">
                      <span className="block text-slate-800 dark:text-slate-200 leading-normal">{leader.education || "None"}</span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleShowHome(leader)}
                        className="cursor-pointer"
                      >
                        {leader.showHome === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20 text-[10px] font-bold"><Home className="w-3 h-3" /> Visible</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 text-[10px] font-bold">Hidden</span>
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(leader)}
                        className="cursor-pointer"
                      >
                        {leader.status === 1 ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold">Active</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20 text-[10px] font-bold">Inactive</span>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          type="button"
                          onClick={() => openEditModal(leader)}
                          aria-label={`Edit ${leader.name}`}
                          className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleDelete(leader.id)}
                          aria-label={`Delete ${leader.name}`}
                          className="p-1.5 border border-rose-100 dark:border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {editLeaderId ? "Edit Board Member Profile" : "Register Board Member"}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Legacy ID / Custom ID *</label>
                  <input 
                    type="text" 
                    value={id} 
                    onChange={(e) => setId(e.target.value)}
                    disabled={editLeaderId !== null}
                    placeholder="e.g. 1000, 1020, or unique name" 
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55] disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Danish Khan" 
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Role / Designation *</label>
                  <input 
                    type="text" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Founder & Director" 
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Photo URL/Path</label>
                  <input 
                    type="text" 
                    value={photo} 
                    onChange={(e) => setPhoto(e.target.value)}
                    placeholder="e.g. /members/danish.jpg (optional)" 
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Location / Office</label>
                  <input 
                    type="text" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lucknow, UP" 
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Mobile Contact</label>
                  <input 
                    type="text" 
                    value={mobile} 
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. +91 999999999" 
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Education</label>
                  <input 
                    type="text" 
                    value={education} 
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.Tech, LL.B." 
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Brief Description (Optional)</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize leader achievements or credentials..." 
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Homepage visibility</span>
                  <button
                    type="button"
                    onClick={() => setShowHome(showHome === 1 ? 0 : 1)}
                    className="cursor-pointer"
                  >
                    {showHome === 1 ? (
                      <ToggleRight className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active status</span>
                  <button
                    type="button"
                    onClick={() => setStatus(status === 1 ? 0 : 1)}
                    className="cursor-pointer"
                  >
                    {status === 1 ? (
                      <ToggleRight className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                    )}
                  </button>
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
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
