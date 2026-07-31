import React from "react";
import Link from "next/link";
import { verifyCertificate } from "../actions";
import { ArrowLeft, CheckCircle, Award, ShieldAlert, Sparkles, BookOpen, ShieldCheck } from "lucide-react";
import VerifyDownloadButton from "./VerifyDownloadButton";

export const dynamic = "force-dynamic";

export default async function VerifyCertIdPage({ params }: { params: Promise<{ certId: string[] | string }> }) {
  const { certId } = await params;
  const rawCertId = Array.isArray(certId) ? certId.join("/") : certId;
  const decodedCertId = decodeURIComponent(rawCertId || "");
  const result = await verifyCertificate(decodedCertId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Mesh background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#001C55]/[0.02] blur-[100px]"></div>
      </div>

      <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-md z-50 sticky top-0 shadow-sm">
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
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#001C55] hover:text-[#001C55]/80 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto px-6 py-16 z-10 flex flex-col justify-center">
        {result && result.found ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xl animate-scaleUp">
            
            {/* Top Shield indicator tailored by Certificate Type */}
            <div className={`p-8 text-center relative text-white ${
              result.certType === "appreciation"
                ? "bg-gradient-to-br from-[#85581A] via-[#B8860B] to-[#754C16]"
                : result.certType === "membership"
                ? "bg-gradient-to-br from-[#001C55] to-[#0d2a6b]"
                : "bg-gradient-to-br from-[#0F5257] to-[#0B3C40]"
            }`}>
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                {result.certType === "appreciation" ? (
                  <Sparkles className="w-8 h-8 text-amber-200" />
                ) : result.certType === "membership" ? (
                  <ShieldCheck className="w-8 h-8 text-sky-300" />
                ) : (
                  <BookOpen className="w-8 h-8 text-emerald-200" />
                )}
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/15 border border-white/25 px-3.5 py-1 rounded-full inline-block">
                {result.certType === "appreciation"
                  ? "Certificate of Appreciation Verified"
                  : result.certType === "membership"
                  ? "Official Membership Registry"
                  : "Academic Course Certificate Verified"}
              </span>

              <h2 className="text-xl sm:text-2xl font-extrabold font-serif mt-4 leading-snug tracking-wide">{result.userName}</h2>
              
              <p className="text-xs text-white/90 mt-1.5 max-w-md mx-auto font-medium">
                {result.certType === "appreciation"
                  ? "Honored by the Executive Board for Distinguished Social Contribution & Human Rights Advocacy"
                  : result.certType === "membership"
                  ? "Is an officially registered member and executive officer of DKFFJ"
                  : "Has successfully completed all academic and practical training prerequisites"}
              </p>
            </div>

            {/* Details registry list */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                <div className="text-xs font-semibold">
                  <span>Certificate status: <strong className="text-emerald-700 font-bold uppercase">{result.status}</strong></span>
                  <p className="text-slate-500 font-normal mt-0.5">This document is verified and officially recorded in our national registry vault.</p>
                </div>
              </div>

              <div className="border-b border-slate-100 pb-5 space-y-4 text-xs font-semibold text-slate-700">
                {result.certType === "appreciation" ? (
                  <>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Social Work Field</span>
                      <span className="text-slate-900 text-right font-extrabold max-w-[280px]">{result.workingArea}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Designation / Honor</span>
                      <span className="text-slate-800 text-right font-bold">{result.designation || "Honorable Social Advocate"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Certificate Serial</span>
                      <span className="text-slate-900 font-mono font-black text-sm">{result.certificateNo}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Date of Issuance</span>
                      <span className="text-slate-800 font-bold">{result.issueDate}</span>
                    </div>
                  </>
                ) : result.certType === "membership" ? (
                  <>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Designation</span>
                      <span className="text-slate-800 text-right font-bold">{result.designation}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Working Area</span>
                      <span className="text-slate-800 text-right font-bold">{result.workingArea}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Membership ID</span>
                      <span className="text-slate-900 font-mono font-black text-sm">{result.certificateNo}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Date of Joining</span>
                      <span className="text-slate-800 font-bold">{result.issueDate}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Course Name</span>
                      <span className="text-slate-800 text-right font-bold">{result.courseName}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Certificate Serial</span>
                      <span className="text-slate-900 font-mono font-black text-sm">{result.certificateNo}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Grade / Performance</span>
                      <span className="text-slate-800 font-bold">{result.grade || "A"} ({result.performance || "Excellent"})</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider">Date of Issue</span>
                      <span className="text-slate-800 font-bold">{result.issueDate}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-center pt-2 w-full">
                <VerifyDownloadButton cert={result} />
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center shadow-xl max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h2 className="text-lg font-serif font-bold text-slate-800">Verification Failure</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              We could not find any active registry records matching:
            </p>
            <div className="my-4 px-3 py-2 bg-slate-50 border font-mono text-xs font-bold text-slate-700 rounded-lg">
              {decodedCertId}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              If this certificate was issued recently, it may take 24-48 hours to sync online. For further queries, please reach our helpdesk.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/verify"
                className="px-5 py-2.5 rounded-lg bg-[#001C55] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Search Another Serial
              </Link>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200/60 py-6 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} DK Foundation of Freedom and Justice. Official Registry Portal.</p>
      </footer>
    </div>
  );
}
