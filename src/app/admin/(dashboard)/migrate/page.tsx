"use client";

import React, { useState, useRef } from "react";
import { FolderOpen, FileJson, Play, CheckCircle2, AlertTriangle, Loader2, Database, UploadCloud } from "lucide-react";

type MemberData = {
  id: number;
  id_no: string;
  enroll_me: string;
  working_area: string;
  state: string;
  state2?: string;
  zone: string;
  distric: string;
  distric2?: string;
  tehsil: string;
  tehsil2?: string;
  frstname: string;
  fathername: string;
  surname: string;
  dob_date: string;
  dob_month: string;
  dob_year: string;
  gender: string;
  profession: string;
  education: string;
  address: string;
  pincode: string;
  mobile: string;
  whatsapp_no: string;
  email: string;
  polic_station: string;
  aadahr_card: string;
  user_photo: string;
  user_signature: string;
  addeddate: string;
  status: number;
};

type LogEntry = {
  type: "info" | "success" | "warning" | "error";
  text: string;
  timestamp: string;
};

export default function MigrationPage() {
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [membersList, setMembersList] = useState<MemberData[]>([]);
  const [selectedFolderFiles, setSelectedFolderFiles] = useState<File[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [currentProgress, setCurrentProgress] = useState({
    total: 0,
    current: 0,
    uploadedFiles: 0,
    skipped: 0,
    failed: 0
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry["type"], text: string) => {
    const newLog: LogEntry = {
      type,
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs((prev) => [...prev, newLog]);
    
    // Auto-scroll logs
    setTimeout(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setJsonFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string) as MemberData[];
        if (Array.isArray(parsed)) {
          setMembersList(parsed);
          addLog("success", `Loaded ${parsed.length} member records from JSON file.`);
        } else {
          addLog("error", "Invalid JSON format: Expected an array of members.");
        }
      } catch (err) {
        addLog("error", "Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    setSelectedFolderFiles(fileList);
    addLog("success", `Selected directory containing ${fileList.length} files.`);
  };

  // Helper to find a file by name from the selected folder files list
  const findFileInFolder = (fileName: string) => {
    if (!fileName) return null;
    const cleanName = fileName.trim().toLowerCase();
    return selectedFolderFiles.find((f) => f.name.toLowerCase() === cleanName) || null;
  };

  const uploadFileToProxy = async (file: File, bucket: string, targetPath: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);
    formData.append("path", targetPath);

    try {
      const res = await fetch("/api/migrate-upload", {
        method: "POST",
        headers: {
          "x-migration-secret": "DKFFJ_MIGRATION_SECRET_2026"
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return data.url;
        }
      }
      return null;
    } catch (err) {
      console.error(`Upload error for ${file.name}:`, err);
      return null;
    }
  };

  const startMigration = async () => {
    if (membersList.length === 0) {
      addLog("error", "No member records loaded. Please select the parsed_members.json file.");
      return;
    }

    setIsMigrating(true);
    setLogs([]);
    addLog("info", "Starting browser-to-server migration pipeline...");
    addLog("info", `Scanning folder for files corresponding to ${membersList.length} members...`);

    setCurrentProgress({
      total: membersList.length,
      current: 0,
      uploadedFiles: 0,
      skipped: 0,
      failed: 0
    });

    let uploadedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    // Process members sequentially to manage connection load and provide live updates
    for (let i = 0; i < membersList.length; i++) {
      const m = membersList[i];
      const memberName = `${m.frstname} ${m.surname || ""}`.trim();
      addLog("info", `[${i + 1}/${membersList.length}] Processing ${memberName}...`);

      const userIdStr = `old_user_${m.id_no}`;
      let photoUrl = "";
      let sigUrl = "";
      let aadhaarUrl = "";

      // 1. Upload Photo
      if (m.user_photo) {
        const photoFile = findFileInFolder(m.user_photo);
        if (photoFile) {
          addLog("info", `Uploading photo: ${m.user_photo}...`);
          const url = await uploadFileToProxy(photoFile, "photos", `${userIdStr}/photo_${m.user_photo}`);
          if (url) {
            photoUrl = url;
            uploadedCount++;
          } else {
            addLog("warning", `⚠️ Photo upload failed for ${m.user_photo}`);
          }
        }
      }

      // 2. Upload Signature
      if (m.user_signature) {
        const sigFile = findFileInFolder(m.user_signature);
        if (sigFile) {
          addLog("info", `Uploading signature: ${m.user_signature}...`);
          const url = await uploadFileToProxy(sigFile, "signatures", `${userIdStr}/signature_${m.user_signature}`);
          if (url) {
            sigUrl = url;
            uploadedCount++;
          } else {
            addLog("warning", `⚠️ Signature upload failed for ${m.user_signature}`);
          }
        }
      }

      // 3. Upload Aadhaar
      if (m.aadahr_card) {
        const aadhaarFile = findFileInFolder(m.aadahr_card);
        if (aadhaarFile) {
          addLog("info", `Uploading Aadhaar: ${m.aadahr_card}...`);
          const url = await uploadFileToProxy(aadhaarFile, "aadhaar", `${userIdStr}/aadhaar_${m.aadahr_card}`);
          if (url) {
            aadhaarUrl = url;
            uploadedCount++;
          } else {
            addLog("warning", `⚠️ Aadhaar upload failed for ${m.aadahr_card}`);
          }
        }
      }

      // 4. Call DB Insert API on Vercel for this single member
      const dobStr = `${m.dob_year}-${m.dob_month.padStart(2, "0")}-${m.dob_date.padStart(2, "0")}`;
      
      const payload = {
        secret: "DKFFJ_MIGRATION_SECRET_2026",
        members: [
          {
            id_no: m.id_no,
            enroll_me: m.enroll_me,
            working_area: m.working_area,
            state: m.state,
            state2: m.state2 || "",
            zone: m.zone,
            distric: m.distric,
            distric2: m.distric2 || "",
            tehsil: m.tehsil,
            tehsil2: m.tehsil2 || "",
            frstname: m.frstname,
            fathername: m.fathername,
            surname: m.surname,
            dob: dobStr,
            gender: m.gender,
            profession: m.profession,
            education: m.education,
            address: m.address,
            pincode: m.pincode,
            mobile: m.mobile,
            whatsapp_no: m.whatsapp_no,
            email: m.email,
            polic_station: m.polic_station,
            aadahr_card_url: aadhaarUrl,
            user_photo_url: photoUrl,
            user_signature_url: sigUrl,
            addeddate: m.addeddate,
            status: m.status
          }
        ]
      };

      try {
        const dbRes = await fetch("/api/migrate-db", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (dbRes.ok) {
          const dbData = await dbRes.json();
          if (dbData.success) {
            const results = dbData.results;
            if (results.migrated > 0) {
              addLog("success", `✅ Successfully migrated: ${memberName} (ID: ${m.id_no})`);
            } else if (results.skipped > 0) {
              addLog("warning", `ℹ️ Skipped (already exists): ${memberName}`);
              skippedCount++;
            } else {
              addLog("error", `❌ Failed to insert: ${memberName}`);
              failedCount++;
            }
          } else {
            addLog("error", `❌ Database API error for ${memberName}: ${dbData.error}`);
            failedCount++;
          }
        } else {
          addLog("error", `❌ Server returned ${dbRes.status} for database insertion of ${memberName}`);
          failedCount++;
        }
      } catch (err: any) {
        addLog("error", `❌ Exception inserting ${memberName}: ${err.message || err}`);
        failedCount++;
      }

      setCurrentProgress({
        total: membersList.length,
        current: i + 1,
        uploadedFiles: uploadedCount,
        skipped: skippedCount,
        failed: failedCount
      });
    }

    addLog("success", "🎉 Migration process completed!");
    setIsMigrating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-[#001C55] dark:text-blue-400" /> Member Data Migration Panel
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          Securely transfer old PHP members, profile photos, signatures, and ID cards to Supabase Storage and PostgreSQL.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Zone CARD */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Migration Sources</h2>
          
          {/* JSON File Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">1. Select parsed_members.json</label>
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#001C55]/50 dark:hover:border-blue-500/50 rounded-xl p-4 flex flex-col items-center justify-center transition-colors">
              <FileJson className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                {jsonFile ? jsonFile.name : "Select parsed_members.json"}
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleJsonChange}
                disabled={isMigrating}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Directory Picker */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">2. Select membership_form Folder</label>
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#001C55]/50 dark:hover:border-blue-500/50 rounded-xl p-4 flex flex-col items-center justify-center transition-colors">
              <FolderOpen className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                {selectedFolderFiles.length > 0 ? `Selected directory with ${selectedFolderFiles.length} files` : "Select local membership_form directory"}
              </span>
              <input
                type="file"
                multiple
                // @ts-ignore
                webkitdirectory=""
                directory=""
                onChange={handleFolderChange}
                disabled={isMigrating}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Trigger button */}
          <button
            type="button"
            onClick={startMigration}
            disabled={isMigrating || membersList.length === 0 || selectedFolderFiles.length === 0}
            className="w-full bg-[#001C55] hover:bg-[#001236] text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isMigrating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Migrating Data...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start Data Migration
              </>
            )}
          </button>
        </div>

        {/* Progress & Stats Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Migration Progress</h2>

          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
              <span className="text-2xl font-black mt-1 text-slate-900 dark:text-white">
                {currentProgress.current} <span className="text-xs text-slate-400 font-bold">/ {currentProgress.total}</span>
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uploaded Files</span>
              <span className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
                {currentProgress.uploadedFiles}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skipped Users</span>
              <span className="text-2xl font-black mt-1 text-amber-500">
                {currentProgress.skipped}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Failed Users</span>
              <span className="text-2xl font-black mt-1 text-rose-500">
                {currentProgress.failed}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-200/50 dark:border-slate-900">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${currentProgress.total > 0 ? (currentProgress.current / currentProgress.total) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>{currentProgress.total > 0 ? Math.round((currentProgress.current / currentProgress.total) * 100) : 0}% Completed</span>
              <span>Migration pipeline online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Console */}
      <div className="bg-slate-950 text-slate-200 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-72">
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-850 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5 text-blue-400" /> Pipeline Terminal Log Console
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-bold text-slate-400 uppercase">Live Console</span>
          </span>
        </div>
        <div
          ref={logContainerRef}
          className="p-4 flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {logs.length === 0 ? (
            <div className="text-slate-500 flex flex-col items-center justify-center h-full gap-2">
              <AlertTriangle className="w-6 h-6 text-slate-600" />
              <span>Select files and directories to initialize console feedback logs.</span>
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                <span
                  className={
                    log.type === "success"
                      ? "text-emerald-400"
                      : log.type === "warning"
                      ? "text-amber-400"
                      : log.type === "error"
                      ? "text-rose-400"
                      : "text-slate-300"
                  }
                >
                  {log.text}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
