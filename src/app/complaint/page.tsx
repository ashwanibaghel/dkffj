"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitComplaint } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Loader2, Check, AlertCircle, FileText, Upload, Plus, Trash2, HelpCircle } from "lucide-react";

export default function ComplaintPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>( "");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [docketNo, setDocketNo] = useState<string>("");

  // Form states
  const [name, setName] = useState<string>("");
  const [fatherName, setFatherName] = useState<string>("");
  const [gender, setGender] = useState<string>("Male");
  const [mobile, setMobile] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [policeStation, setPoliceStation] = useState<string>("");
  const [details, setDetails] = useState<string>("");

  // Attachments state
  const [fileInputs, setFileInputs] = useState<File[]>([]);

  // Check login to pre-fill email and name if possible
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        setName(user.user_metadata?.full_name || "");
      }
    };
    checkUser();
  }, []);

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFileInputs((prev) => [...prev, ...filesArray].slice(0, 5)); // Limit to max 5 files
    }
  };

  const handleRemoveFile = (index: number) => {
    setFileInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name || !fatherName || !mobile || !address || !state || !district || !policeStation || !details) {
      setErrorMsg("Please fill in all mandatory fields.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("fatherName", fatherName);
      formData.append("gender", gender);
      formData.append("mobile", mobile);
      formData.append("email", email);
      formData.append("address", address);
      formData.append("state", state);
      formData.append("district", district);
      formData.append("policeStation", policeStation);
      formData.append("details", details);

      // Append attachments
      fileInputs.forEach((file) => {
        formData.append("attachments", file);
      });

      const res = await submitComplaint(null, formData);

      if (res.success && res.complaintNo) {
        setSuccessMsg(res.message || "Grievance filed successfully.");
        setDocketNo(res.complaintNo);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMsg(res.error || "Submission failed. Please check details.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Background radial effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] right-[5%] w-[800px] h-[500px] rounded-full bg-[#C00000]/[0.015] blur-[120px]"></div>
        <div className="absolute bottom-[20%] left-[5%] w-[600px] h-[600px] rounded-full bg-[#001C55]/[0.02] blur-[100px]"></div>
      </div>

      <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-md z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#001C55]/10 to-[#C00000]/5 border border-slate-200 flex items-center justify-center">
              <img src="/logo.png" className="w-7 h-7 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#001C55] font-bold text-xs tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[8px] text-[#C00000] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
            </div>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#001C55] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 z-10">
        {!docketNo ? (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#001C55]">Grievance Submission Portal</h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">File a human rights violation or legal grievance. All reports are handled confidentially.</p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-100 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-6">
                
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-3">1. Grievant Information</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                      placeholder="e.g. Mohan Lal Sharma"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Father's Name *</label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                      placeholder="e.g. Shri Ram Sharma"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender *</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55] bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mobile Number *</label>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>

                {/* Occurrence Info */}
                <div className="space-y-4 border-t pt-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 mb-3">2. Incident Details</h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Address of Occurrence *</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      rows={2}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                      placeholder="e.g. Gali No. 5, Rajendra Nagar, Lucknow"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">State *</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="e.g. Bihar"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">District *</label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="e.g. Patna"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Concerned Police Station *</label>
                      <input
                        type="text"
                        value={policeStation}
                        onChange={(e) => setPoliceStation(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                        placeholder="Name of local Thana"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Grievance Narrative / Details *</label>
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      required
                      rows={4}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#001C55]/15 focus:border-[#001C55]"
                      placeholder="Please provide full details of your grievance, including date, time, and persons involved..."
                    />
                  </div>
                </div>

                {/* Attachments */}
                <div className="space-y-4 border-t pt-5">
                  <div className="flex items-center justify-between border-b pb-2 mb-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">3. Attach Supporting Evidences</h3>
                    <span className="text-[10px] text-slate-400 font-semibold">(Max 5 files, up to 10MB each)</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleAddFile}
                        className="hidden"
                      />
                      <Upload className="w-4 h-4 text-[#001C55]" /> Add Evidences
                    </label>
                  </div>

                  {fileInputs.length > 0 && (
                    <div className="space-y-2">
                      {fileInputs.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200/80 bg-slate-50/50">
                          <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold truncate max-w-[80%]">
                            <FileText className="w-4 h-4 text-[#001C55] shrink-0" />
                            <span className="truncate">{file.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="text-slate-400 hover:text-[#C00000] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="border-t pt-6 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#C00000] text-white hover:bg-[#990000] text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(192, 0, 0,0.2)] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting Docket...
                      </>
                    ) : (
                      <>
                        Submit Grievance
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </>
        ) : (
          /* Success Panel */
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-serif font-bold text-slate-800">Grievance Registered Successfully</h2>
            <p className="text-xs text-slate-500 mt-2">
              Your grievance details and attachments have been secured in our portal.
            </p>

            <div className="bg-slate-50 border border-dashed rounded-xl p-4 my-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grievance Docket Number</span>
              <span className="text-xl font-mono font-extrabold text-[#C00000] mt-1 block">{docketNo}</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Please note down this docket number. You can track investigation logs, findings, and case updates at our status tracker.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/track?type=complaint&id=${docketNo}`}
                className="px-6 py-2.5 rounded-lg bg-[#001C55] text-white hover:bg-[#001236] text-xs font-bold transition-all shadow-[0_4px_12px_rgba(0, 28, 85,0.15)]"
              >
                Track Status Now
              </Link>
              <Link
                href="/"
                className="px-6 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-all"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
