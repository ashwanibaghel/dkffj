import React from "react";
import Link from "next/link";
import { getActiveCourses } from "./actions";
import CoursesClient from "./CoursesClient";
import { ArrowLeft, GraduationCap, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await getActiveCourses();

  // Serialize Prisma Decimal to String to allow safe Server-to-Client prop transmission
  const serializedCourses = courses.map((course: any) => ({
    ...course,
    fees: course.fees ? course.fees.toString() : "0"
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative select-none">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[20%] w-[700px] h-[500px] rounded-full bg-[#001C55]/[0.02] blur-[120px]"></div>
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
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#001C55] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <GraduationCap className="w-12 h-12 text-[#001C55] mx-auto mb-3" />
          <h1 className="text-3xl font-extrabold font-serif text-[#001C55]">DKFFJ Academy Portal</h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Professional skill development and certification programs aligned with NSDC standards. Search and enroll in a course to lead the change.
          </p>
        </div>

        {serializedCourses.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl max-w-md mx-auto">
            <ShieldAlert className="w-12 h-12 text-slate-350 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Courses Available</h3>
            <p className="text-xs text-slate-500 mt-1">Please contact the administrator or check back later.</p>
          </div>
        ) : (
          <CoursesClient initialCourses={serializedCourses} />
        )}
      </main>
    </div>
  );
}
