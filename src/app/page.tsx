"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import VerificationWidget from "@/components/VerificationWidget";
import HeroSlider from "@/components/HeroSlider";
import GuidelinesAccordion from "@/components/GuidelinesAccordion";
import { getActiveCourses } from "@/app/courses/actions";
import { getHomeLeaders, getHomeNews } from "@/app/actions/home";
import DocumentsFilter from "@/components/DocumentsFilter";
import CourseCard from "@/app/courses/CourseCard";
import { 
  Shield, 
  FileText, 
  BookOpen, 
  Search, 
  Users, 
  GraduationCap, 
  Download, 
  FileCheck, 
  FileDown, 
  PlayCircle,
  Clock,
  Briefcase,
  ChevronRight,
  Gavel,
  Award,
  Globe2,
  FileSpreadsheet
} from "lucide-react";

export default function Home() {
  const [courses, setCourses] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [showAllLeaders, setShowAllLeaders] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      const activeCourses = await getActiveCourses();
      setCourses(activeCourses);
    }
    async function loadLeaders() {
      const homeLeaders = await getHomeLeaders();
      setLeaders(homeLeaders);
    }
    async function loadNews() {
      const homeNews = await getHomeNews();
      setNews(homeNews);
    }
    loadCourses();
    loadLeaders();
    loadNews();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-hidden pb-16 md:pb-0">
      
      {/* Light Geometric/Mesh Design Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Blue Radial Center Glow */}
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[#001C55]/[0.03] blur-[130px]"></div>
        <div className="absolute top-[40%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] rounded-full bg-[#C00000]/[0.015] blur-[120px]"></div>
      </div>

      {/* Top Credentials Banner (Matches Old Design but Premium & Responsive) */}
      <div className="bg-[#001C55] text-white py-5 px-6 border-b border-white/10 relative z-50 text-center shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-1.5">
          <div className="w-16 h-16 rounded-full bg-white p-1.5 flex items-center justify-center shadow-md">
            <img src="/logo.png" className="w-full h-full object-contain" alt="DKFFJ Logo" />
          </div>
          <h1 className="font-serif font-black text-lg sm:text-2xl tracking-wider text-white uppercase mt-1 leading-tight">
            DK FOUNDATION OF FREEDOM AND JUSTICE
          </h1>
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#c5a880] uppercase">
            HUMAN RIGHTS PROTECTION
          </p>
          <p className="text-[10px] sm:text-xs text-slate-300 font-medium tracking-wide">
            Regd By Ministry Of Corporate Affairs Govt. Of India
          </p>
        </div>
      </div>

      {/* Global Navigation Header */}
      <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          
          {/* Logo with Crest Icon */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#001C55]/10 to-[#C00000]/5 border border-slate-200 flex items-center justify-center transition-all group-hover:border-[#001C55]/30">
              <img src="/logo.png" className="w-9 h-9 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#001C55] font-bold text-sm tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[9px] text-[#C00000] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
              <span className="text-[7px] text-slate-500 font-medium tracking-wide mt-0.5">Govt. of India Registered NGO</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <Link href="/" className="text-[#001C55] hover:text-[#001C55] transition-colors">Home</Link>
            <Link href="#about" className="hover:text-[#001C55] transition-colors">About Us</Link>
            <Link href="#services" className="hover:text-[#001C55] transition-colors">Services</Link>
            <Link href="/courses" className="hover:text-[#001C55] transition-colors">Academy</Link>
            <Link href="#documents" className="hover:text-[#001C55] transition-colors">Legals</Link>
            <Link href="#news" className="hover:text-[#001C55] transition-colors">News</Link>
            <Link href="#video-gallery" className="hover:text-[#001C55] transition-colors">Gallery</Link>
            <Link href="#contact" className="hover:text-[#001C55] transition-colors">Contact</Link>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <Link 
              href="/admin/login" 
              className="border border-[#001C55] text-[#001C55] hover:bg-[#001C55] hover:text-white text-xs font-bold px-4 py-2.5 rounded-lg active:scale-95 transition-all"
            >
              Admin Portal
            </Link>
            <Link 
              href="/donate" 
              className="bg-[#C00000] text-white text-xs font-bold px-6 py-2.5 rounded-lg hover:bg-[#990000] active:scale-95 transition-all shadow-[0_4px_15px_rgba(192, 0, 0,0.2)]"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <section id="hero" className="relative min-h-[480px] md:min-h-[620px] flex items-center justify-center px-6 w-full overflow-hidden bg-slate-950">
          {/* Automatic Cross-fade Background Hero Images Slider */}
          <HeroSlider />

          {/* Content overlay on top of background */}
          <div className="relative z-20 max-w-7xl mx-auto w-full flex items-center justify-center">
            
            {/* Centered Welcome Buttons Panel */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="bg-black/25 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row justify-center items-center gap-4 shadow-xl">
                <Link 
                  href="/apply" 
                  className="bg-[#001C55] hover:bg-[#001236] text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-lg transition-all active:scale-95 shadow-[0_5px_15px_rgba(0, 28, 85,0.3)] min-w-[180px] text-center"
                >
                  Join Membership
                </Link>
                
                <Link 
                  href="/complaint" 
                  className="bg-[#C00000] hover:bg-[#990000] text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-lg transition-all active:scale-95 shadow-[0_5px_15px_rgba(192, 0, 0,0.3)] min-w-[180px] text-center"
                >
                  File Complaint
                </Link>
                
                <Link 
                  href="/courses" 
                  className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border border-white/20 font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-lg transition-all active:scale-95 min-w-[180px] text-center"
                >
                  Explore Courses
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* 2. Impact Statistics Bar */}
        <section className="bg-white border-y border-slate-200 py-10 px-6">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="flex flex-col gap-1 border-r border-slate-100 last:border-none">
              <span className="text-3xl font-extrabold text-[#001C55]">15,000+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Registered Members</span>
            </div>
            <div className="flex flex-col gap-1 border-r border-slate-100 last:border-none">
              <span className="text-3xl font-extrabold text-[#C00000]">4,500+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Complaints Resolved</span>
            </div>
            <div className="flex flex-col gap-1 border-r border-slate-100 last:border-none">
              <span className="text-3xl font-extrabold text-slate-800">5,000+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Certificates Issued</span>
            </div>
            <div className="flex flex-col gap-1 border-r border-slate-100 last:border-none">
              <span className="text-3xl font-extrabold text-slate-800">28+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">States Covered</span>
            </div>
            <div className="flex flex-col gap-1 last:border-none">
              <span className="text-3xl font-extrabold text-[#001C55]">120+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Awareness Camps</span>
            </div>
          </div>
        </section>

        {/* 3. About Organization Section */}
        <section id="about" className="py-12 md:py-24 px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">Who We Are</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Pillars of Dignity and Constitutional Advocacy</h2>
              <div className="h-1 w-16 bg-[#001C55] mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Cards Grid: Spacing and Typography Improved */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Mission Card */}
              <div className="bg-white p-10 md:p-12 rounded-3xl border border-slate-200/60 shadow-[0_10px_30px_rgba(0, 28, 85,0.02)] hover:shadow-[0_15px_40px_rgba(0, 28, 85,0.06)] hover:border-[#001C55]/30 transition-all duration-300 flex flex-col gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#001C55]/10 flex items-center justify-center text-[#001C55] shrink-0">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 font-serif">Our Mission</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-normal">
                    To eliminate corruption and human rights infringements by deploying RTI checks, providing active representation to marginalized families, and promoting social welfare throughout India.
                  </p>
                </div>
              </div>

              {/* Vision Card */}
              <div className="bg-white p-10 md:p-12 rounded-3xl border border-slate-200/60 shadow-[0_10px_30px_rgba(0, 28, 85,0.02)] hover:shadow-[0_15px_40px_rgba(0, 28, 85,0.06)] hover:border-[#C00000]/20 transition-all duration-300 flex flex-col gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#C00000]/10 flex items-center justify-center text-[#C00000] shrink-0">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 font-serif">Our Vision</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-normal">
                    To establish a transparent, rights-aware society in India where every citizen has access to speedy legal assistance, transparent administration, and absolute human dignity.
                  </p>
                </div>
              </div>

              {/* Objectives Card */}
              <div className="bg-white p-10 md:p-12 rounded-3xl border border-slate-200/60 shadow-[0_10px_30px_rgba(0, 28, 85,0.02)] hover:shadow-[0_15px_40px_rgba(0, 28, 85,0.06)] hover:border-[#001C55]/30 transition-all duration-300 flex flex-col gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#001C55]/10 flex items-center justify-center text-[#001C55] shrink-0">
                  <Gavel className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 font-serif">Our Objectives</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-normal">
                    Educating common people on the Right to Information Act, supporting citizens in filing official grievances with government bodies, and establishing certifying legal and social studies.
                  </p>
                </div>
              </div>
            </div>

            {/* Supreme Court Arrest Guidelines (DK Basu Case) Accordion */}
            <div className="mt-8 bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-sm max-w-4xl mx-auto w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">Legal Awareness</span>
                  <h3 className="text-2xl font-bold text-slate-900 font-serif">
                    Supreme Court Arrest Guidelines (D.K. Basu Case)
                  </h3>
                </div>
                <div className="shrink-0 bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 rounded-full px-3 py-1 uppercase tracking-wider self-start">
                  ⚖️ Mandatory Compliance
                </div>
              </div>
              
              <p className="text-xs text-slate-500 mb-6 leading-relaxed font-light">
                The Hon'ble Supreme Court of India in the landmark case of <strong>D.K. Basu vs. State of West Bengal</strong> has laid down specific, mandatory procedures to be followed by law enforcement during arrest and detention to prevent custodial violence.
              </p>
              
              {/* Guidelines Accordion Component */}
              <GuidelinesAccordion />
            </div>

          </div>
        </section>

        {/* 4. Services Section (Premium Lucide Icons & Larger Size) */}
        <section id="services" className="py-12 md:py-24 px-6 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">Our Operations</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Comprehensive Public Service System</h2>
              <div className="h-1 w-16 bg-[#001C55] mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {/* Service 1 */}
              <div className="group border border-slate-200/80 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-3 md:gap-4 bg-slate-50/50 hover:bg-white hover:-translate-y-1 hover:shadow-lg hover:border-[#001C55]/30 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#001C55]/10 flex items-center justify-center text-[#001C55] group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 font-serif">Human Rights Support</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-light">Legal assistance and representation against state arbitrary actions and constitutional violations.</p>
              </div>

              {/* Service 2 */}
              <div className="group border border-slate-200/80 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-3 md:gap-4 bg-slate-50/50 hover:bg-white hover:-translate-y-1 hover:shadow-lg hover:border-[#C00000]/25 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#C00000]/10 flex items-center justify-center text-[#C00000] group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 font-serif">Grievance Assistance</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-light">Assisting local citizens in drafting, filing, and tracking official grievance applications to authorities.</p>
              </div>

              {/* Service 3 */}
              <div className="group border border-slate-200/80 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-3 md:gap-4 bg-slate-50/50 hover:bg-white hover:-translate-y-1 hover:shadow-lg hover:border-[#001C55]/30 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#001C55]/10 flex items-center justify-center text-[#001C55] group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 font-serif">Legal Awareness</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-light">Organizing educational camps to inform common citizens about their legal rights and standard procedures.</p>
              </div>

              {/* Service 4 */}
              <div className="group border border-slate-200/80 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-3 md:gap-4 bg-slate-50/50 hover:bg-white hover:-translate-y-1 hover:shadow-lg hover:border-[#C00000]/25 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#C00000]/10 flex items-center justify-center text-[#C00000] group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 font-serif">RTI Advocacy</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-light">Spreading information and filing thousands of RTIs to combat corruption and expose scams in government programs.</p>
              </div>

              {/* Service 5 */}
              <div className="group border border-slate-200/80 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-3 md:gap-4 bg-slate-50/50 hover:bg-white hover:-translate-y-1 hover:shadow-lg hover:border-[#001C55]/30 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#001C55]/10 flex items-center justify-center text-[#001C55] group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 font-serif">Membership Program</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-light">Enrolling dedicated social and legal activists across all Indian states with official verification ID cards.</p>
              </div>

              {/* Service 6 */}
              <div className="group border border-slate-200/80 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-3 md:gap-4 bg-slate-50/50 hover:bg-white hover:-translate-y-1 hover:shadow-lg hover:border-[#C00000]/25 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#C00000]/10 flex items-center justify-center text-[#C00000] group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 font-serif">Certification Academy</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-light">Providing official certification courses in citizen rights, RTI drafting, and community leadership.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Featured Courses Section (Improved visual hierarchy & badges) */}
        <section id="courses" className="py-12 md:py-24 px-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">DKFFJ Academy</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Legal Study & Advocacy Certifications</h2>
              <div className="h-1 w-16 bg-[#001C55] mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Courses Cards Carousel */}
            <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-thin">
              {courses.length === 0 ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="w-[85vw] sm:w-[380px] md:w-full shrink-0 md:shrink snap-start bg-white border border-slate-200 rounded-3xl p-8 flex flex-col gap-5 animate-pulse min-h-[300px]">
                    <div className="h-6 w-2/3 bg-slate-100 rounded-full"></div>
                    <div className="h-8 w-full bg-slate-100 rounded-xl"></div>
                    <div className="h-16 w-full bg-slate-100 rounded-xl"></div>
                    <div className="h-10 w-full bg-slate-100 rounded-xl mt-auto"></div>
                  </div>
                ))
              ) : (
                courses.slice(0, 3).map((course) => (
                  <div 
                    key={course.id} 
                    className="w-[85vw] sm:w-[380px] md:w-full shrink-0 md:shrink snap-start"
                  >
                    <CourseCard course={course} />
                  </div>
                ))
              )}
            </div>

            {/* Explore All Courses Button */}
            <div className="flex justify-center mt-8">
              <Link 
                href="/courses" 
                className="inline-flex items-center gap-2 bg-[#001C55] hover:bg-[#001236] text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all active:scale-95 shadow-[0_5px_15px_rgba(0, 28, 85,0.2)] hover:-translate-y-0.5 cursor-pointer"
              >
                Explore All Courses <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 6. Leadership Team Section (Improved alignment, heights, & real images) */}
        <section className="py-12 md:py-24 px-6 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">Our Leadership</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Executive Council Members</h2>
              <div className="h-1 w-16 bg-[#001C55] mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {leaders.length === 0 ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className={`bg-slate-50 border border-slate-200/80 rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col items-center justify-between gap-4 md:gap-6 animate-pulse h-full min-h-[200px] md:min-h-[300px] ${idx >= 4 ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="flex flex-col items-center gap-3 md:gap-4">
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-slate-200 shrink-0"></div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-4 w-16 md:w-28 bg-slate-200 rounded-full"></div>
                        <div className="h-3 w-12 md:w-20 bg-slate-200 rounded-full"></div>
                      </div>
                    </div>
                    <div className="w-full flex flex-col gap-2">
                      <div className="h-3 w-full bg-slate-200 rounded-full"></div>
                      <div className="h-3 w-2/3 bg-slate-200 rounded-full"></div>
                    </div>
                  </div>
                ))
              ) : (
                (showAllLeaders ? leaders : leaders.slice(0, 8)).map((leader, index) => {
                  const isHiddenOnMobile = !showAllLeaders && index >= 4;
                  return (
                    <div 
                      key={leader.id} 
                      className={`bg-slate-50 border border-slate-200/80 rounded-2xl md:rounded-3xl overflow-hidden p-4 md:p-8 text-center flex flex-col items-center justify-between gap-3 md:gap-6 hover:shadow-md transition-all duration-300 h-full ${
                        index % 2 === 0 ? "hover:border-[#001C55]/30" : "hover:border-[#C00000]/20"
                      } ${isHiddenOnMobile ? 'hidden lg:flex' : 'flex'}`}
                    >
                      <div className="flex flex-col items-center gap-3 md:gap-4">
                        {leader.photo && leader.photo.trim() !== "" ? (
                          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-[#001C55]/30 shadow-inner shrink-0 bg-slate-100">
                            <img 
                              src={leader.photo} 
                              className="w-full h-full object-cover" 
                              alt={leader.name} 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/members/default.jpg";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#001C55]/15 to-[#C00000]/5 border-2 border-[#001C55]/30 text-[#001C55] font-bold text-sm md:text-xl flex items-center justify-center shrink-0 shadow-inner">
                            {(() => {
                              const nameParts = leader.name.trim().split(/\s+/);
                              return nameParts.length > 1 
                                ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                                : nameParts[0] ? nameParts[0].slice(0, 2).toUpperCase() : "??";
                            })()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 font-serif leading-tight">{leader.name}</h4>
                          <span className="text-[9px] md:text-[10px] text-[#C00000] font-bold uppercase tracking-wider mt-1">{leader.role}</span>
                        </div>
                      </div>
                      <p className="text-[10px] md:text-[11px] text-slate-500 leading-relaxed font-light mt-1 md:mt-2 line-clamp-3 md:line-clamp-none">
                        {leader.description}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* View Full Council / See More Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              {leaders.length > 4 && (
                <button 
                  onClick={() => setShowAllLeaders(!showAllLeaders)}
                  className="inline-flex items-center justify-center gap-2 bg-[#001C55] hover:bg-[#001236] text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all active:scale-95 shadow-[0_5px_15px_rgba(0, 28, 85,0.2)] hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
                >
                  {showAllLeaders ? "See Less" : "See More"}
                </button>
              )}
              <Link 
                href="/team" 
                className="inline-flex items-center justify-center gap-2 border border-slate-300 hover:border-[#001C55] text-[#001C55] hover:bg-slate-50 font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all active:scale-95 hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
              >
                View Full Registry
              </Link>
            </div>
          </div>
        </section>
        {/* Dedicated Credentials Verification Section */}
        <section id="verify-section" className="py-12 md:py-24 px-6 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-12">
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">Verification Registry</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Official Credentials Verification Desk</h2>
              <div className="h-1 w-16 bg-[#001C55] mx-auto mt-4 rounded-full"></div>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed font-light">
                Verify NGO member certificates, designation letters, or official coordinator appointments instantly.
              </p>
            </div>

            <div className="flex justify-center w-full">
              <VerificationWidget />
            </div>
          </div>
        </section>

        {/* 7. Documents & Registrations Section (Download CTA, sizes, & hover effects) */}
        <section id="documents" className="py-12 md:py-24 px-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">Official Downloads</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Registration Documents & Tax Approvals</h2>
              <div className="h-1 w-16 bg-[#001C55] mx-auto mt-4 rounded-full"></div>
            </div>

            <DocumentsFilter />
          </div>
        </section>

        {/* 8. Latest News Section */}
        <section id="news" className="py-12 md:py-24 px-6 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest font-sans">Announcements</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Latest Press & Campaign News</h2>
              <div className="h-1 w-16 bg-[#001C55] mx-auto mt-4 rounded-full"></div>
            </div>

            {/* News Cards Carousel */}
            <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-thin">
              {news.length === 0 ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="w-[85vw] sm:w-[380px] md:w-full shrink-0 md:shrink snap-start bg-slate-50 border border-slate-200/80 rounded-2xl p-8 flex flex-col gap-4 animate-pulse min-h-[180px]">
                    <div className="h-4 w-1/4 bg-slate-200 rounded-full"></div>
                    <div className="h-6 w-3/4 bg-slate-200 rounded-full"></div>
                    <div className="h-12 w-full bg-slate-200 rounded-xl"></div>
                  </div>
                ))
              ) : (
                news.map((item, idx) => (
                  <div 
                    key={item.id || idx} 
                    className={`w-[85vw] sm:w-[380px] md:w-full shrink-0 md:shrink snap-start bg-slate-50 border border-slate-200/80 rounded-2xl p-8 flex flex-col gap-4 hover:border-[#001C55]/30 transition-all duration-300 ${
                      idx % 2 === 1 ? "hover:border-[#C00000]/25" : ""
                    }`}
                  >
                    <span 
                      className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded self-start ${
                        idx % 2 === 1 ? "text-[#C00000] bg-[#C00000]/10" : "text-[#001C55] bg-[#001C55]/10"
                      }`}
                    >
                      {item.date}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 font-serif leading-snug">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-light">{item.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* 9. Video Gallery Section */}
        <section id="video-gallery" className="py-12 md:py-24 px-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest font-sans">Press Briefings</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Official Video Library</h2>
              <div className="h-1 w-16 bg-[#001C55] mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Video Gallery Carousel */}
            <div className="flex overflow-x-auto md:grid md:grid-cols-2 gap-6 pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-thin">
              <div className="w-[85vw] sm:w-[480px] md:w-full shrink-0 md:shrink snap-start flex flex-col gap-3 group">
                <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-md aspect-video bg-black relative">
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/hjLMgfZ_Wp4?si=AK0l6ivlxAr0QeMD" 
                    title="DKFFJ Media Broadcast" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                </div>
                <h4 className="text-sm font-bold text-slate-800 font-serif px-1 mt-1 flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-[#C00000]" /> Media Coverage & Ground Report
                </h4>
              </div>

              <div className="w-[85vw] sm:w-[480px] md:w-full shrink-0 md:shrink snap-start flex flex-col gap-3 group">
                <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-md aspect-video bg-black relative">
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dT87hA0fhbM?si=7xM2EQASk1OLY1R2" 
                    title="DKFFJ Ground Report" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                </div>
                <h4 className="text-sm font-bold text-slate-800 font-serif px-1 mt-1 flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-[#C00000]" /> Executive Council Address
                </h4>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Contact & Complaint Lodging Form */}
        <section id="contact" className="py-12 md:py-24 px-6 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
            
            {/* Left Contact Form */}
            <div className="lg:col-span-7 bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col gap-6">
              <div>
                <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest font-sans">Submit Grievance</span>
                <h3 className="text-2xl font-bold font-serif text-slate-900 mt-1">File Public Complaint / Grievance</h3>
                <p className="text-xs text-slate-500 mt-1">Provide clear inputs below. Our active human rights desk will review and assign support coordinators.</p>
              </div>

              <form className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Full Name *</label>
                    <input type="text" required placeholder="Your Name" className="bg-white border border-slate-200 focus:border-[#001C55] focus:ring-1 focus:ring-[#001C55] text-xs px-4 py-3 rounded-lg outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Mobile No. *</label>
                    <input type="text" required placeholder="Phone Number" className="bg-white border border-slate-200 focus:border-[#001C55] focus:ring-1 focus:ring-[#001C55] text-xs px-4 py-3 rounded-lg outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Email Address</label>
                    <input type="email" placeholder="email@example.com" className="bg-white border border-slate-200 focus:border-[#001C55] focus:ring-1 focus:ring-[#001C55] text-xs px-4 py-3 rounded-lg outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Grievance Type *</label>
                    <select required className="bg-white border border-slate-200 focus:border-[#001C55] text-xs px-4 py-3 rounded-lg outline-none">
                      <option>General Legal Inquiry</option>
                      <option>Human Rights Infringement</option>
                      <option>RTI Drafting Request</option>
                      <option>Membership Query</option>
                      <option>Grievance / Public complaint</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Details / Complaint Text *</label>
                  <textarea required rows={4} placeholder="State your problem clearly with landmarks, dates, and names of officials involved if applicable..." className="bg-white border border-slate-200 focus:border-[#001C55] focus:ring-1 focus:ring-[#001C55] text-xs px-4 py-3 rounded-lg outline-none resize-none"></textarea>
                </div>

                {/* Submitting Text Improved */}
                <button type="submit" className="bg-[#001C55] hover:bg-[#001236] text-white font-bold text-xs uppercase tracking-widest py-4 rounded-lg mt-2 transition-all active:scale-95 shadow-[0_4px_12px_rgba(0, 28, 85,0.15)] cursor-pointer">
                  Submit Complaint
                </button>
              </form>
            </div>

            {/* Right Contact Info Details */}
            <div className="lg:col-span-5 flex flex-col gap-8 text-left">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">Office Locations</span>
                <h3 className="text-2xl font-bold font-serif text-slate-900">DKFFJ Coordinates</h3>
                <div className="h-1 w-12 bg-[#001C55] mt-2 rounded-full"></div>
              </div>

              <div className="flex flex-col gap-6 text-xs text-slate-600">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-[#001C55]/10 flex items-center justify-center text-[#001C55] shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 mb-1">Mobile Support Lines</h5>
                    <p className="font-mono text-slate-700 font-semibold">+91 9871219033, +91 8960552986</p>
                    <p className="font-mono text-slate-400 mt-0.5">Alt: +91 9453457930</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-[#001C55]/10 flex items-center justify-center text-[#001C55] shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 mb-1">Official Emails</h5>
                    <p className="font-mono text-slate-700 font-semibold">info@dkffj.org</p>
                    <p className="font-mono text-slate-400 mt-0.5">dkfoundationoffreedom@gmail.com</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-[#001C55]/10 flex items-center justify-center text-[#001C55] shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 mb-1">Corporate & Regional Offices</h5>
                    <p className="mb-2 leading-relaxed"><strong>Head Office:</strong> 117/M/29-C Kakadeo M-Block, Madhuvan Appt. Road, Kanpur, UP 208019</p>
                    <p className="mb-2 leading-relaxed"><strong>Ajmer Office:</strong> Sarwar Guest House, Ander Kot District, Ajmer, Rajasthan 305001</p>
                    <p className="mb-2 leading-relaxed"><strong>Lucknow Office:</strong> 20B, Gata No. 458, Bhakamau BKT, Basha, Lucknow, UP 226026</p>
                    <p className="leading-relaxed"><strong>Delhi Office:</strong> 18/51 Trilok Puri, Near Shiv Mandir, Delhi 110091</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Global Footer (Improved with NITI, MCA, 12A, 80G and verification links) */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-10 text-xs text-slate-500">
          
          <div className="flex flex-col gap-3 text-left">
            <h5 className="font-serif font-bold text-[#001C55] text-sm leading-none">DKFFJ NGO</h5>
            <p className="leading-relaxed font-light text-slate-400">
              DK Foundation of Freedom and Justice is a constitutional rights protection organ registered under Section 8 of the Companies Act, 2013, Ministry of Corporate Affairs, Govt. of India.
            </p>
            <div className="flex flex-col gap-1 mt-2 text-[10px] text-slate-400 font-semibold font-mono">
              <span>CIN: U88100UP2023NPL181342</span>
              <span className="text-[#001C55]">✓ MCA Registered Section 8</span>
              <span className="text-[#001C55]">✓ NITI Aayog: UP/2023/0343513</span>
              <span className="text-[#001C55]">✓ IT Exemption: 12A & 80G</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-left">
            <h5 className="font-bold text-slate-800 uppercase tracking-wider">Quick Links</h5>
            <div className="flex flex-col gap-2">
              <Link href="#about" className="hover:text-[#001C55] transition-colors">About Objectives</Link>
              <Link href="#services" className="hover:text-[#001C55] transition-colors">Operations Details</Link>
              <Link href="#courses" className="hover:text-[#001C55] transition-colors">Academy Courses</Link>
              <Link href="#documents" className="hover:text-[#001C55] transition-colors">Downloadable Legals</Link>
              <Link href="/admin/login" className="hover:text-[#001C55] transition-colors">Admin Portal</Link>
              <Link href="#verify-section" className="text-[#001C55] font-bold hover:underline transition-all">Verify Registry Certificate</Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-left">
            <h5 className="font-bold text-slate-800 uppercase tracking-wider">Official Policies</h5>
            <div className="flex flex-col gap-2">
              <Link href="#" className="hover:text-[#001C55] transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#001C55] transition-colors">Terms and Conditions</Link>
              <Link href="#" className="hover:text-[#001C55] transition-colors">Refund and Cancellation Policy</Link>
              <Link href="#" className="hover:text-[#001C55] transition-colors">Citizen Charter</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-start md:items-end text-left md:text-right">
            <h5 className="font-bold text-slate-800 uppercase tracking-wider">Social Handles</h5>
            <div className="flex gap-4 text-[#001C55]">
              <a href="https://www.facebook.com/dkffjorg" target="_blank" className="hover:text-[#001236] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.325-.593 1.325-1.324v-21.35c0-.732-.595-1.325-1.325-1.325z"/></svg>
              </a>
              <a href="https://twitter.com/dkfofaj" target="_blank" className="hover:text-[#001236] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block">
              &copy; {new Date().getFullYear()} DKFFJ. All rights reserved.
            </span>
          </div>

        </div>
      </footer>

      {/* 13. Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 py-3 px-4 flex gap-2 justify-around shadow-[0_-5px_15px_rgba(0,0,0,0.08)]">
        <Link 
          href="#contact" 
          className="flex-1 text-center bg-[#001C55] hover:bg-[#001236] text-white text-[10px] font-bold py-2.5 rounded-lg uppercase tracking-wider transition-colors"
        >
          Join Member
        </Link>
        <Link 
          href="#contact" 
          className="flex-1 text-center bg-[#C00000] hover:bg-[#990000] text-white text-[10px] font-bold py-2.5 rounded-lg uppercase tracking-wider transition-colors"
        >
          File Complaint
        </Link>
        <Link 
          href="#verify-section" 
          className="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold py-2.5 rounded-lg uppercase tracking-wider transition-colors"
        >
          Verify Certificate
        </Link>
      </div>

    </div>
  );
}
