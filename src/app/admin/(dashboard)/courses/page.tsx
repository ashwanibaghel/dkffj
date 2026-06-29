"use client";

import React, { useState, useEffect } from "react";
import { getAdminCourses, upsertCourse, toggleCourseStatus } from "./actions";
import { BookOpen, Plus, Edit2, ShieldAlert, Loader2, Check, AlertCircle, ToggleLeft, ToggleRight, X } from "lucide-react";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Modal states
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("Add Academy Course");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>( "");

  // Form states
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [duration, setDuration] = useState<string>("3 Months");
  const [fees, setFees] = useState<string>("0");
  const [eligibility, setEligibility] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAdminCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setDuration("3 Months");
    setFees("0");
    setEligibility("");
    setIsActive(true);
    setImageFile(null);
    setExistingImageUrl("");
    setModalTitle("Add Academy Course");
    setActionError("");
    setIsOpen(true);
  };

  const handleOpenEdit = (course: any) => {
    setEditingId(course.id);
    setTitle(course.title);
    setDescription(course.description);
    setDuration(course.duration);
    setFees(course.fees.toString());
    setEligibility(course.eligibility);
    setIsActive(course.is_active);
    setImageFile(null);
    setExistingImageUrl(course.image_url || "");
    setModalTitle("Edit Academy Course");
    setActionError("");
    setIsOpen(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleCourseStatus(id, !currentStatus);
      if (res.success) {
        await fetchData(); // Refresh
      } else {
        alert(res.error || "Failed to toggle status.");
      }
    } catch (err) {
      alert("Error toggling course status.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("duration", duration);
      formData.append("fees", fees);
      formData.append("eligibility", eligibility);
      formData.append("isActive", isActive.toString());
      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (existingImageUrl) {
        formData.append("existingImageUrl", existingImageUrl);
      }

      const res = await upsertCourse(editingId, formData);

      if (res.success) {
        setIsOpen(false);
        await fetchData();
        alert(editingId ? "Course updated successfully!" : "Course added successfully!");
      } else {
        setActionError(res.error || "Failed to save course.");
      }
    } catch (err: any) {
      setActionError(err.message || "An error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#001C55]" /> Academy Courses CMS
          </h1>
          <p className="text-slate-500 text-xs mt-1">Manage active training courses, pricing fees, and study eligibility criteria.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="self-start sm:self-center px-4 py-2 bg-[#001C55] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Course
        </button>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#001C55] mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading courses catalog...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500">No courses defined yet. Click &ldquo;Add New Course&rdquo; to begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
              
              <div className="h-40 bg-slate-900 relative">
                <img
                  src={course.image_url || "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=800"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleToggleActive(course.id, course.is_active)}
                  className="absolute top-3 right-3 bg-white/95 text-slate-800 rounded-full p-1.5 border hover:bg-slate-100 transition-colors shadow flex items-center justify-center cursor-pointer"
                >
                  {course.is_active ? (
                    <ToggleRight className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-slate-450" />
                  )}
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-800 text-sm leading-snug">{course.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold border shrink-0 ${
                      course.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}>
                      {course.is_active ? "PUBLISHED" : "DRAFT"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-550 line-clamp-3 mt-2 leading-relaxed">{course.description}</p>
                  
                  <div className="grid grid-cols-3 gap-2 border-t pt-3 mt-4 text-[10px] text-slate-650 font-bold border-slate-100">
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Fees</span>
                      <span className="text-slate-800 block mt-0.5 font-extrabold text-xs">INR {Number(course.fees)}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Duration</span>
                      <span className="text-slate-800 block mt-0.5">{course.duration}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Eligibility</span>
                      <span className="text-slate-800 block mt-0.5 truncate">{course.eligibility}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(course)}
                  className="mt-5 w-full py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Course Details
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden my-8 flex flex-col relative animate-scaleUp">
            
            {/* Modal Header */}
            <div className="bg-[#001C55] text-white p-5 flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold tracking-wide">{modalTitle}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-[11px] text-rose-800 font-semibold rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Course Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Human Rights Law & Advocacy"
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Course Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  placeholder="Provide brief course syllabus details..."
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Duration *</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    placeholder="e.g. 3 Months"
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fees (INR) *</label>
                  <input
                    type="number"
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    required
                    placeholder="e.g. 2500"
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Eligibility Criteria *</label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  required
                  placeholder="e.g. Graduate in any stream, 10+2"
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#001C55]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Course Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs"
                />
                {existingImageUrl && !imageFile && (
                  <p className="text-[10px] text-slate-400 mt-1 italic truncate">Current image: {existingImageUrl}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-600 cursor-pointer">Publish Immediately (Draft if unchecked)</label>
              </div>

              <div className="flex items-center justify-end border-t pt-4 mt-4 gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-650 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-[#001C55] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#001236] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Save Course
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
