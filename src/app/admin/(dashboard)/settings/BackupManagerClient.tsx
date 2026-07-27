"use client";

import React, { useState } from "react";
import { Download, Database, ShieldCheck, RefreshCw, HardDrive, CheckCircle2 } from "lucide-react";

export default function BackupManagerClient() {
  const [downloading, setDownloading] = useState(false);
  const [purging, setPurging] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);

  const handleRestoreMembers = async () => {
    if (!confirm("Are you sure you want to restore all 389 Executive Council & Migrated members into Supabase database?")) {
      return;
    }
    setRestoring(true);
    try {
      const response = await fetch("/api/admin/restore-members", { method: "POST" });
      const result = await response.json();
      if (response.ok && result.success) {
        alert(`✅ ${result.message}`);
        window.location.reload();
      } else {
        alert(`Error: ${result.error || "Failed to restore members."}`);
      }
    } catch (err) {
      console.error("Restoration error:", err);
      alert("Failed to restore members.");
    } finally {
      setRestoring(false);
    }
  };

  const handleDownloadBackup = async () => {
    setDownloading(true);
    try {
      const response = await fetch("/api/admin/backup");
      if (!response.ok) {
        throw new Error("Failed to generate backup");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dkffj_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setLastBackupTime(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch (err) {
      console.error("Backup download error:", err);
      alert("Failed to download database backup. Please check your admin session.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePurgeTestData = async () => {
    if (!confirm("Are you sure you want to purge test data and clear Redis/Next.js cache? (All 389 official migrated members will be safely preserved)")) {
      return;
    }
    setPurging(true);
    try {
      const response = await fetch("/api/admin/purge-test-records", { method: "POST" });
      const result = await response.json();
      if (response.ok && result.success) {
        alert("✅ Test data purged and Redis/Next.js cache successfully reset!");
        window.location.reload();
      } else {
        alert(`Error: ${result.error || "Failed to purge test data."}`);
      }
    } catch (err) {
      console.error("Purge error:", err);
      alert("Failed to purge test data.");
    } finally {
      setPurging(false);
    }
  };

  return (
    <section className="bg-[#001C55]/5 dark:bg-slate-900 border border-[#001C55]/20 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#001C55] text-white flex items-center justify-center shadow-md">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#C00000] dark:text-red-400">Disaster Recovery Desk</span>
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100">Automated Database & Records Backup</h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Database Shield Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-1">
        <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Scope</p>
            <p className="font-extrabold text-slate-800 dark:text-slate-200">11 Full Database Tables</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Format</p>
            <p className="font-extrabold text-slate-800 dark:text-slate-200">Encrypted JSON Snapshot</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Last Downloaded</p>
            <p className="font-extrabold text-slate-800 dark:text-slate-200">{lastBackupTime || "Ready to Export"}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Export a complete, timestamped backup of all 389+ memberships, certificates, course enrollments, payments, donations, and complaint records for offline safety.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleDownloadBackup}
            disabled={downloading || purging || restoring}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-[#001C55] to-[#C00000] text-white hover:opacity-95 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Backup JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRestoreMembers}
            disabled={downloading || purging || restoring}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {restoring ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Restoring 389 Members...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Restore 389 Members</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePurgeTestData}
            disabled={downloading || purging || restoring}
            className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {purging ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Purging...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Purge Test Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
