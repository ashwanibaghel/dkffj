"use client";

import React, { useState, useEffect } from "react";
import { getLeaders, addLeader, updateLeader, deleteLeader } from "./actions";
import { Users, Plus, Trash2, Edit2, X, ToggleLeft, ToggleRight, Loader2, AlertCircle } from "lucide-react";

export default function AdminLeadersPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editLeaderId, setEditLeaderId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    setLoading(true);
    try {
      const data = await getLeaders();
      setLeaders(data);
    } catch (err: any) {
      setError(err.message || "Failed to load leaders");
    } finally {
      setLoading(false);
    }
  };

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

  const openEditModal = (leader: any) => {
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

  const handleToggleStatus = async (leader: any) => {
    const newStatus = leader.status === 1 ? 0 : 1;
    try {
      const res = await updateLeader(leader.id, { status: newStatus });
      if (res.success) {
        setLeaders(leaders.map(l => l.id === leader.id ? { ...l, status: newStatus } : l));
      } else {
        alert(res.error || "Failed to toggle status");
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  const handleToggleShowHome = async (leader: any) => {
    const newShowHome = leader.showHome === 1 ? 0 : 1;
    try {
      const res = await updateLeader(leader.id, { showHome: newShowHome });
      if (res.success) {
        setLeaders(leaders.map(l => l.id === leader.id ? { ...l, showHome: newShowHome } : l));
      } else {
        alert(res.error || "Failed to toggle homepage visibility");
      }
    } catch (err) {
      alert("Error updating homepage visibility");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this executive council member?")) return;
    try {
      const res = await deleteLeader(id);
      if (res.success) {
        setLeaders(leaders.filter(l => l.id !== id));
      } else {
        alert(res.error || "Failed to delete leader");
      }
    } catch (err) {
      alert("Error deleting leader");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim() || !role.trim()) {
      alert("ID, Name, and Role are required");
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
        } else {
          alert(res.error || "Failed to update leader");
        }
      } else {
        const res = await addLeader(payload);
        if (res.success) {
          setModalOpen(false);
          await fetchLeaders();
        } else {
          alert(res.error || "Failed to add leader");
        }
      }
    } catch (err) {
      alert("Error saving leader");
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
            <Users className="w-5 h-5 text-[#001C55]" /> Executive Council Registry
          </h1>
          <p className="text-slate-500 text-[10px] mt-1 font-semibold">Manage profiles, contact cards, and website display for DKFFJ Board Leaders.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-4 py-2 bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Council Member
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
          <Loader2 className="w-8 h-8 animate-spin text-[#001C55] mx-auto mb-3" />
          <p className="text-slate-500">Loading council registry, please wait...</p>
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <p className="text-slate-500">No council members added yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Profile</th>
                  <th className="p-4">Location & Mobile</th>
                  <th className="p-4">Qualifications</th>
                  <th className="p-4">Homepage Show</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {leaders.map((leader) => (
                  <tr key={leader.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {leader.photo && leader.photo.trim() !== "" ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                          <img 
                            src={leader.photo} 
                            alt={leader.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/members/default.jpg";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#001C55]/15 to-[#C00000]/5 border border-slate-200 text-[#001C55] font-bold text-[10px] flex items-center justify-center shrink-0 shadow-inner">
                          {(() => {
                            const nameParts = leader.name.trim().split(/\s+/);
                            return nameParts.length > 1 
                              ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                              : nameParts[0] ? nameParts[0].slice(0, 2).toUpperCase() : "??";
                          })()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-800">{leader.name}</h4>
                        <span className="text-[10px] text-[#C00000] font-bold block mt-0.5">{leader.role}</span>
                        <span className="text-[9px] text-slate-400 font-mono font-medium mt-0.5 block">ID: {leader.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="block font-bold">{leader.location || "None"}</span>
                      <span className="block text-slate-400 font-mono mt-0.5 font-medium">{leader.mobile || "None"}</span>
                    </td>
                    <td className="p-4">
                      <span className="block text-slate-800 leading-normal">{leader.education || "None"}</span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleShowHome(leader)}
                        className="cursor-pointer"
                      >
                        {leader.showHome === 1 ? (
                          <span className="px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">Visible</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 border border-slate-200 text-[10px] font-bold">Hidden</span>
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
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Active</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">Inactive</span>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button 
                          onClick={() => openEditModal(leader)}
                          className="p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(leader.id)}
                          className="p-1.5 border border-rose-100 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl animate-scaleIn">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 font-serif">
                {editLeaderId ? "Edit Board Member Profile" : "Register Board Member"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Legacy ID / Custom ID *</label>
                  <input 
                    type="text" 
                    value={id} 
                    onChange={(e) => setId(e.target.value)}
                    disabled={editLeaderId !== null}
                    placeholder="e.g. 1000, 1020, or unique name" 
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001C55] disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Danish Khan" 
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role / Designation *</label>
                  <input 
                    type="text" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Founder & Director" 
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Photo URL/Path</label>
                  <input 
                    type="text" 
                    value={photo} 
                    onChange={(e) => setPhoto(e.target.value)}
                    placeholder="e.g. /members/danish.jpg (optional)" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Location / Office</label>
                  <input 
                    type="text" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lucknow, UP" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Contact</label>
                  <input 
                    type="text" 
                    value={mobile} 
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. +91 999999999" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Education</label>
                  <input 
                    type="text" 
                    value={education} 
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.Tech, LL.B." 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Brief Description (Optional)</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize leader achievements or credentials..." 
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Homepage visibility</span>
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
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active status</span>
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
