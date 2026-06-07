"use client";

import React, { useState, useEffect } from "react";
import { getCertificates, toggleCertificateStatus } from "./actions";
import { Award, Search, Loader2, Download, AlertTriangle, ShieldCheck, QrCode } from "lucide-react";

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [filteredCerts, setFilteredCerts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCertificates();
      setCertificates(data);
      setFilteredCerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCerts(certificates);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredCerts(
        certificates.filter(
          (c) =>
            c.user_name.toLowerCase().includes(q) ||
            c.certificate_no.toLowerCase().includes(q) ||
            c.course_name.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, certificates]);

  const handleToggle = async (id: string, currentStatus: string) => {
    setToggleLoading(id);
    try {
      const res = await toggleCertificateStatus(id, currentStatus);
      if (res.success) {
        await fetchData(); // Refresh
      } else {
        alert(res.error || "Failed to update certificate status.");
      }
    } catch (err) {
      alert("Error updating certificate status.");
    } finally {
      setToggleLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#0F4C81]" /> Academy Certificates Registry
          </h1>
          <p className="text-slate-500 text-xs mt-1">Review generated academic credentials, manage QR-code validation pathways, and revoke certificates.</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Total Certificates: {filteredCerts.length}
        </div>
        
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search by student, course, certificate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:bg-white"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F4C81] mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading certificate registry...</p>
        </div>
      ) : filteredCerts.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <p className="text-xs text-slate-500">No certificate records found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCerts.map((cert) => (
            <div key={cert.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative hover:border-[#0F4C81]/25 transition-all">
              
              <div className="flex gap-4">
                {/* QR Code thumbnail */}
                <div className="w-20 h-20 bg-slate-50 border rounded-xl flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  <img src={cert.qr_code_url} alt="Verification QR" className="w-full h-full object-contain" />
                </div>
                
                {/* Details */}
                <div className="text-xs space-y-1.5 flex-1 min-w-0">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide block">{cert.certificate_no}</span>
                  <h3 className="font-bold text-slate-800 text-sm truncate font-serif">{cert.user_name}</h3>
                  <p className="font-semibold text-slate-600 truncate">{cert.course_name}</p>
                  <span className="text-[10px] text-slate-400 block font-medium">Issue Date: {new Date(cert.issue_date).toLocaleDateString("en-IN")}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t pt-4 mt-5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                    cert.status === "VALID" ? "bg-emerald-50 text-emerald-700 border-emerald-250" : "bg-rose-50 text-rose-700 border-rose-250"
                  }`}>
                    {cert.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(cert.id, cert.status)}
                    disabled={toggleLoading === cert.id}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                      cert.status === "VALID"
                        ? "border-rose-200 hover:bg-rose-50 text-rose-600"
                        : "border-emerald-200 hover:bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {toggleLoading === cert.id ? (
                      <Loader2 className="w-3 animate-spin" />
                    ) : cert.status === "VALID" ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" /> Revoke
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> Activate
                      </>
                    )}
                  </button>

                  <a
                    href={cert.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-50 border hover:bg-slate-100 text-[10px] font-bold text-slate-600 transition-colors inline-flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0F4C81]" /> PDF copy
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
