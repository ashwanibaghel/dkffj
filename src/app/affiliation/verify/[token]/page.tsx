import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  CheckCircle,
  Calendar,
  MapPin,
  BookOpen,
  Sparkles
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AffiliationVerifyTokenPage({
  params
}: {
  params: Promise<{ token: string[] | string }>;
}) {
  const resolvedParams = await params;
  const rawToken = Array.isArray(resolvedParams.token) ? resolvedParams.token.join("/") : resolvedParams.token;
  const decodedToken = decodeURIComponent(rawToken || "").trim();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Search by verification_token, affiliation_no, application_no, or slug via Supabase REST Client
  const { data: affiliation } = await supabase
    .from("affiliations")
    .select("*, domains:affiliation_domains(*)")
    .or(`verification_token.eq.${decodedToken},affiliation_no.ilike.${decodedToken},application_no.ilike.${decodedToken},slug.eq.${decodedToken}`)
    .maybeSingle();

  // Dev Store Lookup
  const { getDevAffiliations } = await import("@/lib/affiliation-dev-store");
  const devAffiliates = getDevAffiliations();
  const devMatch = devAffiliates.find(
    a => a.verificationToken === decodedToken || a.affiliationNo === decodedToken || a.applicationNo === decodedToken || a.slug === decodedToken
  );

  let approvedCoursesList: any[] = [];
  if (devMatch && devMatch.status === "APPROVED") {
    const { getNormalizedCourseCatalog } = await import("@/lib/courseCatalog");
    const { courseMap } = await getNormalizedCourseCatalog(false);
    const appIds = devMatch.approvedCourseIds || devMatch.requestedCourseIds || [];
    approvedCoursesList = appIds.map(id => courseMap[id]).filter(Boolean);
  }

  // Dev fallback data if DB table isn't migrated yet
  const mockAffiliation = !affiliation && devMatch
    ? {
        organization_name: devMatch.organizationName,
        organization_type: devMatch.organizationType,
        organization_type_other: devMatch.organizationTypeOther,
        affiliation_no: devMatch.affiliationNo || "DKFFJ/F/2026/0001",
        verification_token: devMatch.verificationToken,
        district: devMatch.district,
        state: devMatch.state,
        establishment_year: devMatch.establishmentYear,
        current_status: devMatch.status,
        valid_from: devMatch.validFrom || new Date().toISOString(),
        valid_to: devMatch.validTo || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        domains: [{ id: "1", domain_type: "COMPUTER_IT" }]
      }
    : null;

  const target = affiliation || mockAffiliation;
  const isValid = target && target.current_status === "APPROVED";
  const validFromStr = target?.valid_from ? new Date(target.valid_from).toLocaleDateString("en-IN") : "N/A";
  const validToStr = target?.valid_to ? new Date(target.valid_to).toLocaleDateString("en-IN") : "N/A";

  const appUrl = "https://www.dkffj.org";
  const verifyTokenUrl = target ? `${appUrl}/affiliation/verify/${target.verification_token}` : "";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=3&ecc=M&data=${encodeURIComponent(verifyTokenUrl)}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#001C55]/[0.03] blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md z-50 sticky top-0 shadow-sm">
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

      {/* Main Content Container */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 z-10 flex flex-col justify-center">
        {isValid && target ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xl animate-scaleUp">
            {/* Top Shield Header */}
            <div className="p-8 text-center relative text-white bg-gradient-to-br from-[#001C55] via-[#0b2b70] to-[#051740]">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShieldCheck className="w-9 h-9 text-sky-300" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest bg-white/15 border border-white/25 px-3.5 py-1 rounded-full inline-block">
                Official Affiliation Verified
              </span>

              <h2 className="text-xl sm:text-2xl font-extrabold font-serif mt-4 leading-snug tracking-wide">
                {target.organization_name}
              </h2>

              <p className="text-xs text-white/90 mt-2 max-w-md mx-auto font-medium">
                Is an officially authorized affiliate institute of DK Foundation of Freedom and Justice.
              </p>
            </div>

            {/* Public Verified Details */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Verified Badge */}
              <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                <div className="text-xs font-semibold">
                  <span>Affiliation Status: <strong className="text-emerald-700 uppercase font-extrabold">ACTIVE / VALID</strong></span>
                  <p className="text-slate-500 font-normal mt-0.5">This institute is verified and recorded in the DKFFJ National Institutional Registry.</p>
                </div>
              </div>

              {/* Public Privacy Shielded Details */}
              <div className="border-b border-slate-100 pb-5 space-y-3.5 text-xs font-semibold text-slate-700">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider">Official Affiliation No</span>
                  <span className="text-[#001C55] font-mono font-black text-sm">{target.affiliation_no}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider">Organization Type</span>
                  <span className="text-slate-800 font-bold">{target.organization_type_other || target.organization_type}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider">Location / Territory</span>
                  <span className="text-slate-800 font-bold">{target.district}, {target.state}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider">Establishment Year</span>
                  <span className="text-slate-800 font-bold">{target.establishment_year}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider">Validity Period</span>
                  <span className="text-slate-800 font-bold">{validFromStr} — {validToStr}</span>
                </div>

                {target.domains && target.domains.length > 0 && (
                  <div className="py-2">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-1.5">Approved Training Domains</span>
                    <div className="flex flex-wrap gap-1.5">
                      {target.domains.map((d: any) => (
                        <span key={d.id} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700">
                          {d.domain_type.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {approvedCoursesList.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">Approved Training Programs</span>
                      <span className="px-2.5 py-0.5 bg-[#001C55]/10 text-[#001C55] rounded-full text-[10px] font-black">
                        {approvedCoursesList.length} Authorized
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {approvedCoursesList.map((ac: any) => (
                        <div key={ac.courseId} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex items-center justify-between">
                          <div className="min-w-0 flex-1 pr-2">
                            <strong className="text-slate-800 block truncate">{ac.title}</strong>
                            <span className="text-[10px] text-slate-500 block truncate">{ac.sector} • {ac.duration}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-blue-100 text-[#001C55] rounded text-[9.5px] font-extrabold shrink-0">
                            {ac.programType === "DIPLOMA" ? "Diploma" : "Certificate"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* QR & Public Verification Stamp */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Registry QR Scan Stamp</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Scan to verify authentic digital record on DKFFJ server.</p>
                </div>
                <img src={qrCodeUrl} className="w-20 h-20 rounded-lg border border-slate-300 p-1 bg-white shrink-0" alt="Verification QR" />
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
            <div className="my-4 px-3 py-2 bg-slate-50 border font-mono text-xs font-bold text-slate-700 rounded-lg break-all">
              {decodedToken}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              If this affiliation was issued recently, it may take up to 24 hours to sync online.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/affiliation/verify"
                className="px-5 py-2.5 rounded-lg bg-[#001C55] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm text-center"
              >
                Search Another Number
              </Link>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider transition-colors text-center"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} DK Foundation of Freedom and Justice. Official Registry Portal.</p>
      </footer>
    </div>
  );
}
