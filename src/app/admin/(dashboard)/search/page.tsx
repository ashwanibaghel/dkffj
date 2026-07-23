"use client";

import React, { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Search, ArrowLeft, Loader2, Users, ShieldAlert, GraduationCap, Award } from "lucide-react";
import AdminEmptyState from "../components/AdminEmptyState";

type MembershipSearchResult = {
  id: string;
  ack_no: string;
  membership_no?: string | null;
  full_name: string;
  designation?: string | null;
  status: string;
  created_at: string;
};

type CourseSearchResult = {
  id: string;
  enrollment_no?: string | null;
  full_name: string;
  status: string;
  created_at: string;
  courses?: { title?: string | null } | { title?: string | null }[] | null;
};

type ComplaintSearchResult = {
  id: string;
  complaint_no: string;
  name: string;
  status: string;
  details?: string | null;
  created_at: string;
};

type CertificateSearchResult = {
  id: string;
  certificate_no: string;
  user_name: string;
  course_name: string;
  status: string;
  issue_date: string;
};

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<{
    memberships: MembershipSearchResult[];
    courses: CourseSearchResult[];
    complaints: ComplaintSearchResult[];
    certificates: CertificateSearchResult[];
  }>({
    memberships: [],
    courses: [],
    complaints: [],
    certificates: []
  });

  const performGlobalSearch = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const cleanQuery = query.trim();

    try {
      // 1. Search Memberships
      const { data: memberData } = await supabase
        .from("memberships")
        .select("id, ack_no, membership_no, full_name, designation, status, created_at")
        .or(`full_name.ilike.%${cleanQuery}%,ack_no.ilike.%${cleanQuery}%,membership_no.ilike.%${cleanQuery}%,email.ilike.%${cleanQuery}%,mobile.ilike.%${cleanQuery}%`)
        .limit(10);

      // 2. Search Course Registrations
      const { data: courseData } = await supabase
        .from("course_registrations")
        .select(`
          id,
          enrollment_no,
          full_name,
          status,
          created_at,
          courses (
            title
          )
        `)
        .or(`full_name.ilike.%${cleanQuery}%,enrollment_no.ilike.%${cleanQuery}%,email.ilike.%${cleanQuery}%,mobile.ilike.%${cleanQuery}%`)
        .limit(10);

      // 3. Search Complaints
      const { data: complaintData } = await supabase
        .from("complaints")
        .select("id, complaint_no, name, status, details, created_at")
        .or(`name.ilike.%${cleanQuery}%,complaint_no.ilike.%${cleanQuery}%,mobile.ilike.%${cleanQuery}%,details.ilike.%${cleanQuery}%`)
        .limit(10);

      // 4. Search Certificates
      const { data: certData } = await supabase
        .from("certificates")
        .select("id, certificate_no, user_name, course_name, status, issue_date")
        .or(`user_name.ilike.%${cleanQuery}%,certificate_no.ilike.%${cleanQuery}%,course_name.ilike.%${cleanQuery}%`)
        .limit(10);

      setResults({
        memberships: (memberData || []) as MembershipSearchResult[],
        courses: (courseData || []) as CourseSearchResult[],
        complaints: (complaintData || []) as ComplaintSearchResult[],
        certificates: (certData || []) as CertificateSearchResult[]
      });
    } catch (err) {
      console.error("Global search query failed:", err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    let animationFrame: number;

    if (query) {
      animationFrame = window.requestAnimationFrame(() => {
        void performGlobalSearch();
      });
      return () => window.cancelAnimationFrame(animationFrame);
    }

    animationFrame = window.requestAnimationFrame(() => setLoading(false));
    return () => window.cancelAnimationFrame(animationFrame);
  }, [performGlobalSearch, query]);

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (["APPROVED", "RESOLVED", "COMPLETED", "VALID"].includes(s)) return "bg-emerald-50 text-emerald-700 border-emerald-250";
    if (["PENDING", "SUBMITTED"].includes(s)) return "bg-amber-50 text-amber-705 border-amber-250";
    return "bg-rose-50 text-rose-700 border-rose-250";
  };

  const totalResults = 
    results.memberships.length + 
    results.courses.length + 
    results.complaints.length + 
    results.certificates.length;

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#001C55] hover:underline mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-[#001C55]" /> Global Search Results
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Showing search matches for &ldquo;<span className="font-bold text-slate-700">{query}</span>&rdquo;.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#001C55] mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Searching Database...</p>
        </div>
      ) : totalResults === 0 ? (
        <AdminEmptyState
          icon={Search}
          title="No records matched"
          description="Try adjusting your spelling or searching by full names, ACK IDs, docket IDs, certificate numbers, or phone numbers."
        />
      ) : (
        <div className="space-y-6">
          
          {/* Memberships Section */}
          {results.memberships.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Users className="w-4 h-4 text-[#001C55]" /> Memberships ({results.memberships.length})
              </div>
              <div className="divide-y divide-slate-150 text-xs font-semibold text-slate-700">
                {results.memberships.map((m) => (
                  <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-800">{m.full_name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Ack: {m.ack_no} {m.membership_no && `| Card: ${m.membership_no}`}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] border uppercase ${getStatusColor(m.status)}`}>
                        {m.status}
                      </span>
                      <Link 
                        href={`/admin/members?search=${m.ack_no}`} 
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700"
                      >
                        View Member
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses Section */}
          {results.courses.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-cyan-700" /> Academy Course Enrollments ({results.courses.length})
              </div>
              <div className="divide-y divide-slate-150 text-xs font-semibold text-slate-700">
                {results.courses.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-800">{c.full_name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Enrollment: {c.enrollment_no || "Awaiting Verification"} | Course: {c.courses?.title || "N/A"}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] border uppercase ${getStatusColor(c.status)}`}>
                        {c.status}
                      </span>
                      <Link 
                        href={`/admin/registrations?search=${c.enrollment_no || c.full_name}`} 
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700"
                      >
                        View Enrollment
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complaints Section */}
          {results.complaints.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-purple-700" /> Grievance Complaints ({results.complaints.length})
              </div>
              <div className="divide-y divide-slate-150 text-xs font-semibold text-slate-700">
                {results.complaints.map((comp) => (
                  <div key={comp.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-800">By: {comp.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Docket: {comp.complaint_no} | Summary: {comp.details?.substring(0, 60)}...</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] border uppercase ${getStatusColor(comp.status)}`}>
                        {comp.status}
                      </span>
                      <Link 
                        href={`/admin/complaints?search=${comp.complaint_no}`} 
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700"
                      >
                        View Complaint
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates Section */}
          {results.certificates.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Award className="w-4 h-4 text-emerald-700" /> Issued Certificates ({results.certificates.length})
              </div>
              <div className="divide-y divide-slate-150 text-xs font-semibold text-slate-700">
                {results.certificates.map((cert) => (
                  <div key={cert.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-800">{cert.user_name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Cert No: {cert.certificate_no} | Course: {cert.course_name}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] border uppercase ${getStatusColor(cert.status)}`}>
                        {cert.status}
                      </span>
                      <Link 
                        href={`/admin/certificates?search=${cert.certificate_no}`} 
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700"
                      >
                        View Certificate
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default function GlobalSearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#001C55] mx-auto mb-3" />
        <p className="text-xs text-slate-450 uppercase font-bold tracking-wider">Loading search environment...</p>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
