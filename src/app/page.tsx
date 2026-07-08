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
  ChevronDown,
  Gavel,
  Award,
  Globe2,
  FileSpreadsheet,
  Menu,
  X
} from "lucide-react";

export default function Home() {
  const [courses, setCourses] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [showAllLeaders, setShowAllLeaders] = useState(false);
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky nav only after credentials banner is fully scrolled away (~140px)
      setShowStickyNav(window.scrollY > 130);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div className="min-h-screen bg-[#f0f7ff] text-slate-900 flex flex-col font-sans relative pb-16 md:pb-0">
      
      {/* Light Geometric/Mesh Design Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Blue Radial Center Glow */}
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[#1565C0]/[0.03] blur-[130px]"></div>
        <div className="absolute top-[40%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] rounded-full bg-[#C00000]/[0.015] blur-[120px]"></div>
      </div>

      {/* Top Credentials Banner — scrolls away naturally, NO sticky */}
      <div className="bg-[#1565C0] text-white border-b border-white/20 relative z-40">

        {/* ── Top Utility Social Bar ── */}
        <div className="bg-[#0A2E66] border-b border-white/10 px-4 sm:px-6 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            {/* Left: Contact Info */}
            <div className="flex items-center gap-4 text-white/95 text-[11px] font-semibold tracking-wide">
              <a 
                href="https://wa.me/919871219033" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1.5 hover:text-green-400 transition-colors"
              >
                <svg className="w-4 h-4 fill-current text-green-400" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.858.002-2.634-1.023-5.11-2.884-6.974C16.588 1.91 14.113.882 11.48.882c-5.443 0-9.863 4.42-9.866 9.86-.001 1.762.48 3.487 1.396 4.98L2.025 21.8l6.326-1.657c-1.554 1.056-1.748 1.01-1.704 1.011zm11.724-4.593c-.307-.154-1.82-.9-2.102-1.002-.281-.102-.486-.154-.69.154-.204.307-.79.997-.97 1.202-.178.204-.358.23-.665.077-2.586-1.293-3.69-1.92-5.168-4.445-.39-.667.39-.62 1.117-2.062.123-.246.062-.46-.03-.615-.093-.154-.79-1.9-.1.97-.246.307-.486.358-.69.358-.204-.002-.435-.003-.665-.003-.23 0-.603.086-.918.43-.314.342-1.202 1.176-1.202 2.87 0 1.691 1.233 3.326 1.403 3.557.17.23 2.424 3.7 5.87 5.18 2.052.88 2.886.96 3.91.81 1.21-.18 1.82-.74 2.08-1.4.26-.66.26-1.23.18-1.35-.08-.12-.3-.22-.61-.38z"/>
                </svg>
                <span>WhatsApp Support: +91 98712 19033</span>
              </a>
              <span className="text-white/30 hidden sm:inline">|</span>
              <span className="hidden sm:inline text-yellow-300">Govt. Registered NGO</span>
            </div>

            {/* Right: Social Icons Row */}
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-[10px] uppercase font-bold tracking-wider hidden md:inline">Connect With Us:</span>
              
              {/* WhatsApp Channel */}
              <a 
                href="https://whatsapp.com/channel/0029Va64Sq3KWEL0Fq19xi1g" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="WhatsApp Channel"
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-500 hover:text-white hover:scale-110 transition-all text-white/90"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.858.002-2.634-1.023-5.11-2.884-6.974C16.588 1.91 14.113.882 11.48.882c-5.443 0-9.863 4.42-9.866 9.86-.001 1.762.48 3.487 1.396 4.98L2.025 21.8l6.326-1.657c-1.554 1.056-1.748 1.01-1.704 1.011zm11.724-4.593c-.307-.154-1.82-.9-2.102-1.002-.281-.102-.486-.154-.69.154-.204.307-.79.997-.97 1.202-.178.204-.358.23-.665.077-2.586-1.293-3.69-1.92-5.168-4.445-.39-.667.39-.62 1.117-2.062.123-.246.062-.46-.03-.615-.093-.154-.79-1.9-.1.97-.246.307-.486.358-.69.358-.204-.002-.435-.003-.665-.003-.23 0-.603.086-.918.43-.314.342-1.202 1.176-1.202 2.87 0 1.691 1.233 3.326 1.403 3.557.17.23 2.424 3.7 5.87 5.18 2.052.88 2.886.96 3.91.81 1.21-.18 1.82-.74 2.08-1.4.26-.66.26-1.23.18-1.35-.08-.12-.3-.22-.61-.38z"/>
                </svg>
              </a>

              {/* Telegram */}
              <a 
                href="https://t.me/dkfoundationoffreedom" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Telegram Channel"
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0088cc] hover:text-white hover:scale-110 transition-all text-white/90"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.02-1.99 1.25-5.61 3.7-.53.37-1 .55-1.42.54-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.75 3.88-1.69 6.46-2.8 7.74-3.33 3.68-1.52 4.44-1.78 4.94-1.79.11 0 .36.03.52.16.14.11.18.27.2.42.02.13.01.27-.01.37z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a 
                href="https://www.youtube.com/@dkffjorg" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="YouTube Channel"
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF0000] hover:text-white hover:scale-110 transition-all text-white/90"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/dkffjorg?igsh=eDFlb3ZlbHM0Ymhi" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Instagram"
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E1306C] hover:text-white hover:scale-110 transition-all text-white/90"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a 
                href="https://www.linkedin.com/in/danish-khan-0134b687?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="LinkedIn"
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0077B5] hover:text-white hover:scale-110 transition-all text-white/90"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ── Top Nav Strip ── sits at the very top like a header bar */}
        {/* ── Top Nav Strip ── sits at the very top like a header bar */}
        <div className="border-b border-white/20 px-4 sm:px-6 py-2.5 bg-[#0D47A1]">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Desktop Navigation */}
            <div className="hidden md:flex w-full justify-between items-center">
              <nav className="flex flex-wrap gap-x-7 gap-y-1.5 text-[11px] font-bold uppercase tracking-widest text-white/90 items-center">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                <Link href="#services" className="hover:text-white transition-colors">Services</Link>
                <Link href="/courses" className="hover:text-white transition-colors">Academy</Link>
                <Link href="/documents" className="hover:text-white transition-colors">Legals</Link>
                <Link href="#contact" className="hover:text-white transition-colors">Contact</Link>
                
                {/* Hover Dropdown */}
                <div className="relative group">
                  <button className="hover:text-white transition-colors flex items-center gap-1 uppercase">
                    <span>More</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute top-full left-0 mt-1.5 w-48 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                    <Link href="/news" className="block px-4 py-2 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:text-[#1565C0] transition-colors">News</Link>
                    <Link href="/gallery" className="block px-4 py-2 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:text-[#1565C0] transition-colors">Gallery</Link>
                    <Link href="/apply-appreciation" className="block px-4 py-2 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:text-[#1565C0] transition-colors">Apply Appreciation</Link>
                    <Link href="/track" className="block px-4 py-2 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:text-[#1565C0] transition-colors">Track Application</Link>
                  </div>
                </div>

                <Link href="/my-account" className="hover:text-white transition-colors text-yellow-300 font-extrabold">My Account</Link>
              </nav>
              <div className="flex items-center gap-2">
                <Link href="/apply" className="bg-[#1565C0] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded hover:bg-[#0D47A1] transition-colors shadow-md">
                  Join Membership
                </Link>
                <Link href="/donate" className="bg-[#C00000] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded hover:bg-[#990000] transition-colors shadow-md">
                  Donate Now
                </Link>
              </div>
            </div>

            {/* Mobile Header Bar */}
            <div className="flex md:hidden w-full justify-between items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white focus:outline-none p-1 bg-white/10 rounded-md hover:bg-white/20 transition-all"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-1.5">
                <Link href="/apply" className="bg-[#1565C0] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-md">
                  Join Membership
                </Link>
                <Link href="/donate" className="bg-[#C00000] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-md">
                  Donate Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Credentials (Logo + Name) ── */}
        <div className="text-center pt-8 pb-7 px-6">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
            <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 flex items-center justify-center filter drop-shadow-2xl">
              <img src="/logo.png" className="w-full h-full object-contain" style={{ clipPath: "circle(48.5%)" }} alt="DKFFJ Logo" />
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl tracking-wider text-white uppercase leading-tight mt-1">
              DK FOUNDATION OF FREEDOM AND JUSTICE
            </h1>
            <p className="text-xs sm:text-sm font-bold tracking-[0.3em] text-yellow-200 uppercase">
              HUMAN RIGHTS PROTECTION
            </p>
            <p className="text-[10px] sm:text-xs text-blue-100 font-medium tracking-wide">
              Regd By Ministry Of Corporate Affairs Govt. Of India
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Nav — fixed, slides in ONLY after credentials banner scrolls away */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          showStickyNav
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        } bg-[#1565C0]/98 backdrop-blur-md border-b border-white/20 shadow-lg`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left section: Hamburger (on mobile) + Logo + Text */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden text-white focus:outline-none p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo — only visible after scrolling (no double logo problem) */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center transition-all group-hover:bg-white/20">
                <img src="/logo.png" className="w-7 h-7 object-contain" alt="DKFFJ" />
              </div>
              {/* Desktop Text */}
              <div className="hidden md:flex flex-col">
                <span className="text-white font-black text-xs tracking-wide font-serif leading-tight">DK Foundation</span>
                <span className="text-[8px] text-[#c5a880] font-bold tracking-wider">OF FREEDOM AND JUSTICE</span>
              </div>
              {/* Mobile Text (DKFFJ) */}
              <span className="flex md:hidden text-white font-black text-sm tracking-widest font-sans">
                DKFFJ
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-[11px] font-bold uppercase tracking-wider text-slate-200">
            <Link href="/" className="hover:text-[#c5a880] transition-colors">Home</Link>
            <Link href="/about" className="hover:text-[#c5a880] transition-colors">About</Link>
            <Link href="#services" className="hover:text-[#c5a880] transition-colors">Services</Link>
            <Link href="/courses" className="hover:text-[#c5a880] transition-colors">Academy</Link>
            <Link href="/documents" className="hover:text-[#c5a880] transition-colors">Legals</Link>
            <Link href="#contact" className="hover:text-[#c5a880] transition-colors">Contact</Link>
            
            {/* Hover Dropdown */}
            <div className="relative group">
              <button className="hover:text-[#c5a880] transition-colors flex items-center gap-1 uppercase">
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute top-full left-0 mt-1.5 w-48 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                <Link href="/news" className="block px-4 py-2 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:text-[#1565C0] transition-colors">News</Link>
                <Link href="/gallery" className="block px-4 py-2 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:text-[#1565C0] transition-colors">Gallery</Link>
                <Link href="/apply-appreciation" className="block px-4 py-2 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:text-[#1565C0] transition-colors">Appreciation</Link>
                <Link href="/track" className="block px-4 py-2 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:text-[#1565C0] transition-colors">Track</Link>
              </div>
            </div>
          </nav>

          {/* Desktop Right Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/apply"
              className="bg-[#1565C0] text-white text-[11px] font-black px-4 py-1.5 rounded-lg hover:bg-[#0D47A1] transition-all shadow-[0_4px_12px_rgba(21,101,192,0.35)]"
            >
              Join Membership
            </Link>
            <Link
              href="/my-account"
              className="border border-white/60 bg-white/10 hover:bg-white hover:text-[#1565C0] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
            >
              My Account
            </Link>
            <Link
              href="/admin/login"
              className="border border-white/30 text-white/80 hover:bg-white hover:text-[#1565C0] text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
            >
              Admin
            </Link>
            <Link
              href="/donate"
              className="bg-[#C00000] text-white text-[11px] font-black px-4 py-1.5 rounded-lg hover:bg-[#990000] transition-all shadow-[0_4px_12px_rgba(192,0,0,0.35)]"
            >
              Donate Now
            </Link>
          </div>

          {/* Mobile Right Buttons (Donate & Join, hamburger moved to left) */}
          <div className="flex md:hidden items-center gap-1.5">
            <Link
              href="/apply"
              className="bg-[#1565C0] text-white text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-[#0D47A1] transition-all shadow-[0_4px_12px_rgba(21,101,192,0.35)]"
            >
              Join
            </Link>
            <Link
              href="/donate"
              className="bg-[#C00000] text-white text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-[#990000] transition-all shadow-[0_4px_12px_rgba(192,0,0,0.35)]"
            >
              Donate
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <section id="hero" className="relative min-h-[480px] md:min-h-[620px] flex items-end pb-8 px-6 w-full overflow-hidden bg-slate-950">
          {/* Automatic Cross-fade Background Hero Images Slider */}
          <HeroSlider />

          {/* Content overlay on top of background */}
          <div className="relative z-20 max-w-7xl mx-auto w-full flex justify-center">
            
             {/* Centered Welcome Buttons Panel */}
             <div className="flex flex-col items-center gap-6 text-center w-full">
               <div className="bg-black/30 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row justify-center items-center gap-4 shadow-xl">
                 <Link 
                   href="/apply" 
                   className="bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-lg transition-all active:scale-95 shadow-[0_5px_15px_rgba(0, 28, 85,0.3)] min-w-[180px] text-center"
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

               {/* Quick tracking & account shortcuts */}
               <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-semibold">
                 <Link
                   href="/track"
                   className="text-white hover:text-yellow-250 transition-colors uppercase tracking-widest font-black underline decoration-white/30 decoration-2 underline-offset-4"
                 >
                   Track Application
                 </Link>
                 <span className="text-white/40 text-sm">|</span>
                 <Link
                   href="/my-account"
                   className="text-white hover:text-yellow-250 transition-colors uppercase tracking-widest font-black underline decoration-white/30 decoration-2 underline-offset-4"
                 >
                   My Account Portal
                 </Link>
               </div>
             </div>

          </div>
        </section>

        {/* Dynamic Infinite Scrolling News Ticker Banner */}
        <div className="bg-[#1565C0] border-y border-[#0D47A1] text-white flex items-center relative z-30 shadow-md">
          {/* Static Title Tag */}
          <div className="bg-[#C00000] px-4 py-3 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-2 shrink-0 select-none shadow-[4px_0_15px_rgba(0,0,0,0.15)] relative z-10 border-r border-[#990000]">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>Latest Updates</span>
          </div>

          {/* Marquee Content */}
          <div className="flex-1 overflow-hidden py-3 text-xs sm:text-sm font-semibold tracking-wide flex items-center">
            {news && news.length > 0 ? (
              <div className="animate-marquee whitespace-nowrap">
                {news.map((item) => (
                  <span key={item.id} className="mx-8 inline-flex items-center gap-2">
                    <span className="text-[#c5a880] font-black">✦</span>
                    <span className="hover:text-yellow-250 transition-colors cursor-pointer">{item.title}</span>
                  </span>
                ))}
                {/* Duplicate for infinite loop */}
                {news.map((item) => (
                  <span key={`dup-${item.id}`} className="mx-8 inline-flex items-center gap-2">
                    <span className="text-[#c5a880] font-black">✦</span>
                    <span className="hover:text-yellow-250 transition-colors cursor-pointer">{item.title}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="px-4 text-slate-200 animate-pulse italic">
                Loading official news updates...
              </div>
            )}
          </div>
        </div>

        {/* 2. Official Recognition & Registration Credentials Bar */}
        <section className="bg-white border-y border-sky-100 py-8 px-6">
          <div className="max-w-6xl mx-auto w-full">
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-6">Officially Recognised &amp; Registered By</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {/* MCA — links to MCA company search portal */}
              <a
                href="https://www.mca.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-sky-100 bg-[#f0f7ff] hover:shadow-md hover:border-[#1565C0]/30 hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1565C0]/10 flex items-center justify-center group-hover:bg-[#1565C0]/20 transition-colors">
                  <svg className="w-5 h-5 text-[#1565C0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-[#1565C0] uppercase tracking-wide group-hover:underline">Section 8 Company</p>
                  <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Ministry of Corporate Affairs</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">CIN: U88900UP2023NPL185611</p>
                  <p className="text-[8px] text-[#1565C0]/60 mt-1 flex items-center justify-center gap-0.5">Verify ↗</p>
                </div>
              </a>

              {/* NITI Aayog — NGO Darpan portal */}
              <a
                href="https://ngodarpan.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-sky-100 bg-[#f0f7ff] hover:shadow-md hover:border-[#1565C0]/30 hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1565C0]/10 flex items-center justify-center group-hover:bg-[#1565C0]/20 transition-colors">
                  <svg className="w-5 h-5 text-[#1565C0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-[#1565C0] uppercase tracking-wide group-hover:underline">NITI Aayog</p>
                  <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Govt. of India NGO Registry</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">ID: UP/2023/0351342</p>
                  <p className="text-[8px] text-[#1565C0]/60 mt-1">Verify ↗</p>
                </div>
              </a>

              {/* 12A — Income Tax India portal */}
              <a
                href="https://www.incometaxindia.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-sky-100 bg-[#f0f7ff] hover:shadow-md hover:border-green-200 hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-green-700 uppercase tracking-wide group-hover:underline">12A Registered</p>
                  <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Income Tax Exemption</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">Income Tax Act, 1961</p>
                  <p className="text-[8px] text-green-600/60 mt-1">Know More ↗</p>
                </div>
              </a>

              {/* 80G — Income Tax India portal */}
              <a
                href="https://www.incometaxindia.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-sky-100 bg-[#f0f7ff] hover:shadow-md hover:border-amber-200 hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-amber-700 uppercase tracking-wide group-hover:underline">80G Certified</p>
                  <p className="text-[9px] text-slate-500 font-semibold mt-0.5">Donations Tax Deductible</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">Income Tax Act, 1961</p>
                  <p className="text-[8px] text-amber-600/60 mt-1">Know More ↗</p>
                </div>
              </a>

            </div>

            {/* Expandable Accreditations & Verification Table */}
            <div className="mt-8 border border-sky-100/80 rounded-2xl bg-[#f0f7ff]/40 p-5 md:p-6 text-left">
              <h4 className="text-xs font-black text-[#001C55] uppercase tracking-wider mb-4 flex items-center gap-1.5 font-serif">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C00000]"></span> Legal Registrations &amp; Accreditations Directory
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3.5 text-[11px] text-slate-600 font-medium">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">Section 8 Company:</span>
                  <span className="font-semibold text-slate-800">DK Foundation of Freedom and Justice</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">Section 8 Licence No:</span>
                  <span className="font-mono font-bold text-slate-700">146043</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">CIN:</span>
                  <span className="font-mono font-bold text-[#001C55]">U88900UP2023NPL185611</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">PAN Number:</span>
                  <span className="font-mono font-bold text-slate-700">AAKCD1596R</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">TAN Number:</span>
                  <span className="font-mono font-bold text-slate-700">LKND10615D</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">Unique ID NITI Aayog:</span>
                  <span className="font-mono font-bold text-slate-700">UP/2023/0351342</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">NGO ID (Ministry of Social Justice):</span>
                  <span className="font-mono font-bold text-slate-700 font-sans">UP/00034249</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">ISO 9001:2015 Cert No:</span>
                  <span className="font-mono font-bold text-slate-700">QCCI/23Q/DOE/2909</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">CSR Registration No:</span>
                  <span className="font-mono font-bold text-slate-700">CSR00068100</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">12A Document ID No:</span>
                  <span className="font-mono font-bold text-slate-700">AAKCD1596RE2024101</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">80G Document ID No:</span>
                  <span className="font-mono font-bold text-slate-700">AAKCD1596RF2024101</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">MSME Registration No:</span>
                  <span className="font-mono font-bold text-slate-700">UDYAM-UP-43-0117271</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">Ministry of Education ISBN:</span>
                  <span className="font-mono font-bold text-slate-700 font-sans">28791/ISBN/2024/P</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">UN Affiliation Status:</span>
                  <span className="font-bold text-[#C00000] tracking-wide">Under Process</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-400">Official Website:</span>
                  <a href="https://www.dkffj.org" target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-[#1565C0] hover:underline">www.dkffj.org</a>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3. About Organization Section */}
        <section id="about" className="py-12 md:py-24 px-6 bg-[#f0f7ff]">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">Who We Are</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Pillars of Dignity and Constitutional Advocacy</h2>
              <div className="h-1 w-16 bg-[#1565C0] mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Cards Grid: Spacing and Typography Improved */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Mission Card */}
              <div className="bg-white p-10 md:p-12 rounded-3xl border border-sky-100/60 shadow-[0_10px_30px_rgba(0, 28, 85,0.02)] hover:shadow-[0_15px_40px_rgba(0, 28, 85,0.06)] hover:border-[#1565C0]/30 transition-all duration-300 flex flex-col gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#1565C0]/10 flex items-center justify-center text-[#1565C0] shrink-0">
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
              <div className="bg-white p-10 md:p-12 rounded-3xl border border-sky-100/60 shadow-[0_10px_30px_rgba(0, 28, 85,0.02)] hover:shadow-[0_15px_40px_rgba(0, 28, 85,0.06)] hover:border-[#C00000]/20 transition-all duration-300 flex flex-col gap-6">
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
              <div className="bg-white p-10 md:p-12 rounded-3xl border border-sky-100/60 shadow-[0_10px_30px_rgba(0, 28, 85,0.02)] hover:shadow-[0_15px_40px_rgba(0, 28, 85,0.06)] hover:border-[#1565C0]/30 transition-all duration-300 flex flex-col gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#1565C0]/10 flex items-center justify-center text-[#1565C0] shrink-0">
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
            <div className="mt-8 bg-white border border-sky-100/80 rounded-3xl p-8 md:p-10 shadow-sm max-w-4xl mx-auto w-full">
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
        <section id="services" className="py-12 md:py-24 px-6 bg-white border-t border-sky-100">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">Our Operations</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Comprehensive Public Service System</h2>
              <div className="h-1 w-16 bg-[#1565C0] mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {/* Service 1 */}
              <div className="group border border-sky-100/80 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-3 md:gap-4 bg-[#f0f7ff]/50 hover:bg-white hover:-translate-y-1 hover:shadow-lg hover:border-[#1565C0]/30 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1565C0]/10 flex items-center justify-center text-[#1565C0] group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 font-serif">Human Rights Support</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-light">Legal assistance and representation against state arbitrary actions and constitutional violations.</p>
              </div>

              {/* Service 2 */}
              <div className="group border border-sky-100/80 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-3 md:gap-4 bg-[#f0f7ff]/50 hover:bg-white hover:-translate-y-1 hover:shadow-lg hover:border-[#C00000]/25 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#C00000]/10 flex items-center justify-center text-[#C00000] group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 font-serif">Grievance Assistance</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-light">Assisting local citizens in drafting, filing, and tracking official grievance applications to authorities.</p>
              </div>

              {/* Service 3 */}
              <div className="group border border-sky-100/80 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-3 md:gap-4 bg-[#f0f7ff]/50 hover:bg-white hover:-translate-y-1 hover:shadow-lg hover:border-[#1565C0]/30 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1565C0]/10 flex items-center justify-center text-[#1565C0] group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 font-serif">Legal Awareness</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-light">Organizing educational camps to inform common citizens about their legal rights and standard procedures.</p>
              </div>

              {/* Service 4 */}
              <div className="group border border-sky-100/80 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-3 md:gap-4 bg-[#f0f7ff]/50 hover:bg-white hover:-translate-y-1 hover:shadow-lg hover:border-[#C00000]/25 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#C00000]/10 flex items-center justify-center text-[#C00000] group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 font-serif">RTI Advocacy</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-light">Spreading information and filing thousands of RTIs to combat corruption and expose scams in government programs.</p>
              </div>

              {/* Service 5 */}
              <div className="group border border-sky-100/80 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-3 md:gap-4 bg-[#f0f7ff]/50 hover:bg-white hover:-translate-y-1 hover:shadow-lg hover:border-[#1565C0]/30 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1565C0]/10 flex items-center justify-center text-[#1565C0] group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 font-serif">Membership Program</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed font-light">Enrolling dedicated social and legal activists across all Indian states with official verification ID cards.</p>
              </div>

              {/* Service 6 */}
              <div className="group border border-sky-100/80 rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-3 md:gap-4 bg-[#f0f7ff]/50 hover:bg-white hover:-translate-y-1 hover:shadow-lg hover:border-[#C00000]/25 transition-all duration-300">
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
        <section id="courses" className="py-12 md:py-24 px-6 bg-[#f0f7ff] border-t border-sky-100">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">DKFFJ Academy</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Legal Study & Advocacy Certifications</h2>
              <div className="h-1 w-16 bg-[#1565C0] mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Courses Cards Carousel */}
            <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-thin">
              {courses.length === 0 ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="w-[85vw] sm:w-[380px] md:w-full shrink-0 md:shrink snap-start bg-white border border-sky-100 rounded-3xl p-8 flex flex-col gap-5 animate-pulse min-h-[300px]">
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
                className="inline-flex items-center gap-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all active:scale-95 shadow-[0_5px_15px_rgba(0, 28, 85,0.2)] hover:-translate-y-0.5 cursor-pointer"
              >
                Explore All Courses <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 6. Leadership Team Section (Improved alignment, heights, & real images) */}
        <section className="py-12 md:py-24 px-6 bg-white border-t border-sky-100">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">Our Leadership</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Executive Council Members</h2>
              <div className="h-1 w-16 bg-[#1565C0] mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {leaders.length === 0 ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className={`bg-[#f0f7ff] border border-sky-100/80 rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col items-center justify-between gap-4 md:gap-6 animate-pulse h-full min-h-[200px] md:min-h-[300px] ${idx >= 4 ? 'hidden lg:flex' : 'flex'}`}>
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
                      className={`bg-[#f0f7ff] border border-sky-100/80 rounded-2xl md:rounded-3xl overflow-hidden p-4 md:p-8 text-center flex flex-col items-center justify-between gap-3 md:gap-6 hover:shadow-md transition-all duration-300 h-full ${
                        index % 2 === 0 ? "hover:border-[#1565C0]/30" : "hover:border-[#C00000]/20"
                      } ${isHiddenOnMobile ? 'hidden lg:flex' : 'flex'}`}
                    >
                      <div className="flex flex-col items-center gap-3 md:gap-4">
                        {leader.photo && leader.photo.trim() !== "" ? (
                          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-[#1565C0]/30 shadow-inner shrink-0 bg-slate-100">
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
                          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#1565C0]/15 to-[#C00000]/5 border-2 border-[#1565C0]/30 text-[#1565C0] font-bold text-sm md:text-xl flex items-center justify-center shrink-0 shadow-inner">
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
                  className="inline-flex items-center justify-center gap-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all active:scale-95 shadow-[0_5px_15px_rgba(0, 28, 85,0.2)] hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
                >
                  {showAllLeaders ? "See Less" : "See More"}
                </button>
              )}
              <Link 
                href="/team" 
                className="inline-flex items-center justify-center gap-2 border border-slate-300 hover:border-[#1565C0] text-[#1565C0] hover:bg-[#f0f7ff] font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all active:scale-95 hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
              >
                View Full Registry
              </Link>
            </div>
          </div>
        </section>
        {/* Dedicated Credentials Verification Section */}
        <section id="verify-section" className="py-12 md:py-24 px-6 bg-white border-t border-sky-100">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-12">
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">Verification Registry</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Official Credentials Verification Desk</h2>
              <div className="h-1 w-16 bg-[#1565C0] mx-auto mt-4 rounded-full"></div>
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
        <section id="documents" className="py-12 md:py-24 px-6 bg-[#f0f7ff] border-t border-sky-100">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">Official Downloads</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Registration Documents & Tax Approvals</h2>
              <div className="h-1 w-16 bg-[#1565C0] mx-auto mt-4 rounded-full"></div>
            </div>

            <DocumentsFilter />
          </div>
        </section>

        {/* 8. Latest News Section */}
        <section id="news" className="py-12 md:py-24 px-6 bg-white border-t border-sky-100">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest font-sans">Announcements</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Latest Press & Campaign News</h2>
              <div className="h-1 w-16 bg-[#1565C0] mx-auto mt-4 rounded-full"></div>
            </div>

            {/* News Cards Carousel */}
            <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-thin">
              {news.length === 0 ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="w-[85vw] sm:w-[380px] md:w-full shrink-0 md:shrink snap-start bg-[#f0f7ff] border border-sky-100/80 rounded-2xl p-8 flex flex-col gap-4 animate-pulse min-h-[180px]">
                    <div className="h-4 w-1/4 bg-slate-200 rounded-full"></div>
                    <div className="h-6 w-3/4 bg-slate-200 rounded-full"></div>
                    <div className="h-12 w-full bg-slate-200 rounded-xl"></div>
                  </div>
                ))
              ) : (
                news.map((item, idx) => (
                  <div 
                    key={item.id || idx} 
                    className={`w-[85vw] sm:w-[380px] md:w-full shrink-0 md:shrink snap-start bg-[#f0f7ff] border border-sky-100/80 rounded-2xl p-8 flex flex-col gap-4 hover:border-[#1565C0]/30 transition-all duration-300 ${
                      idx % 2 === 1 ? "hover:border-[#C00000]/25" : ""
                    }`}
                  >
                    <span 
                      className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded self-start ${
                        idx % 2 === 1 ? "text-[#C00000] bg-[#C00000]/10" : "text-[#1565C0] bg-[#1565C0]/10"
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
        <section id="video-gallery" className="py-12 md:py-24 px-6 bg-[#f0f7ff] border-t border-sky-100">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 md:gap-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest font-sans">Press Briefings</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Official Video Library</h2>
              <div className="h-1 w-16 bg-[#1565C0] mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Video Gallery Carousel */}
            <div className="flex overflow-x-auto md:grid md:grid-cols-2 gap-6 pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-thin">
              <div className="w-[85vw] sm:w-[480px] md:w-full shrink-0 md:shrink snap-start flex flex-col gap-3 group">
                <div className="rounded-2xl overflow-hidden border border-sky-100/80 shadow-md aspect-video bg-black relative">
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
                <div className="rounded-2xl overflow-hidden border border-sky-100/80 shadow-md aspect-video bg-black relative">
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
        <section id="contact" className="py-12 md:py-24 px-6 bg-white border-t border-sky-100">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start">
            
            {/* Left Contact Form */}
            <div className="lg:col-span-7 bg-[#f0f7ff] p-8 md:p-10 rounded-3xl border border-sky-100/80 shadow-sm flex flex-col gap-6">
              <div>
                <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest font-sans">Submit Grievance</span>
                <h3 className="text-2xl font-bold font-serif text-slate-900 mt-1">File Public Complaint / Grievance</h3>
                <p className="text-xs text-slate-500 mt-1">Provide clear inputs below. Our active human rights desk will review and assign support coordinators.</p>
              </div>

              <form className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Full Name *</label>
                    <input type="text" required placeholder="e.g. Suresh Verma" className="bg-white border border-sky-100 focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] text-xs px-4 py-3 rounded-lg outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Mobile No. *</label>
                    <input type="text" required placeholder="e.g. 9876543210" className="bg-white border border-sky-100 focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] text-xs px-4 py-3 rounded-lg outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Email Address</label>
                    <input type="email" placeholder="e.g. suresh.verma@gmail.com" className="bg-white border border-sky-100 focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] text-xs px-4 py-3 rounded-lg outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Grievance Type *</label>
                    <select required className="bg-white border border-sky-100 focus:border-[#1565C0] text-xs px-4 py-3 rounded-lg outline-none">
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
                  <textarea required rows={4} placeholder="State your problem clearly with landmarks, dates, and names of officials involved if applicable..." className="bg-white border border-sky-100 focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0] text-xs px-4 py-3 rounded-lg outline-none resize-none"></textarea>
                </div>

                {/* Submitting Text Improved */}
                <button type="submit" className="bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold text-xs uppercase tracking-widest py-4 rounded-lg mt-2 transition-all active:scale-95 shadow-[0_4px_12px_rgba(0, 28, 85,0.15)] cursor-pointer">
                  Submit Complaint
                </button>
              </form>
            </div>

            {/* Right Contact Info Details */}
            <div className="lg:col-span-5 flex flex-col gap-8 text-left">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-[#C00000] font-extrabold uppercase tracking-widest">Office Locations</span>
                <h3 className="text-2xl font-bold font-serif text-slate-900">DKFFJ Coordinates</h3>
                <div className="h-1 w-12 bg-[#1565C0] mt-2 rounded-full"></div>
              </div>

              <div className="flex flex-col gap-6 text-xs text-slate-600">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-[#1565C0]/10 flex items-center justify-center text-[#1565C0] shrink-0">
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
                  <div className="w-8 h-8 rounded-lg bg-[#1565C0]/10 flex items-center justify-center text-[#1565C0] shrink-0">
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
                  <div className="w-8 h-8 rounded-lg bg-[#1565C0]/10 flex items-center justify-center text-[#1565C0] shrink-0">
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
      <footer className="border-t border-sky-100 bg-[#e8f4fd] py-12 px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-10 text-xs text-slate-500">
          
          <div className="flex flex-col gap-3 text-left">
            <h5 className="font-serif font-bold text-[#1565C0] text-sm leading-none">DKFFJ NGO</h5>
            <p className="leading-relaxed font-light text-slate-400">
              DK Foundation of Freedom and Justice is a constitutional rights protection organ registered under Section 8 of the Companies Act, 2013, Ministry of Corporate Affairs, Govt. of India.
            </p>
            <div className="flex flex-col gap-1 mt-2 text-[10px] text-slate-400 font-semibold font-mono font-sans">
              <span>CIN: U88900UP2023NPL185611</span>
              <span className="text-[#1565C0]">✓ MCA Registered Section 8</span>
              <span className="text-[#1565C0]">✓ NITI Aayog: UP/2023/0351342</span>
              <span className="text-[#1565C0]">✓ IT Exemption: 12A &amp; 80G</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-left">
            <h5 className="font-bold text-slate-800 uppercase tracking-wider">Quick Links</h5>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="hover:text-[#1565C0] transition-colors">About Objectives</Link>
              <Link href="#services" className="hover:text-[#1565C0] transition-colors">Operations Details</Link>
              <Link href="/courses" className="hover:text-[#1565C0] transition-colors">Academy Courses</Link>
              <Link href="/documents" className="hover:text-[#1565C0] transition-colors">Downloadable Legals</Link>
              <Link href="/admin/login" className="hover:text-[#1565C0] transition-colors">Admin Portal</Link>
              <Link href="#verify-section" className="text-[#1565C0] font-bold hover:underline transition-all">Verify Registry Certificate</Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-left">
            <h5 className="font-bold text-slate-800 uppercase tracking-wider">Official Policies</h5>
            <div className="flex flex-col gap-2">
              <Link href="#" className="hover:text-[#1565C0] transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#1565C0] transition-colors">Terms and Conditions</Link>
              <Link href="#" className="hover:text-[#1565C0] transition-colors">Refund and Cancellation Policy</Link>
              <Link href="#" className="hover:text-[#1565C0] transition-colors">Citizen Charter</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-start md:items-end text-left md:text-right">
            <h5 className="font-bold text-slate-800 uppercase tracking-wider">Contact & Socials</h5>
            <div className="flex flex-col gap-1.5 text-slate-500 text-[11px] md:items-end font-medium">
              <a 
                href="https://wa.me/919871219033" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-[#1565C0] font-bold text-[#25D366] flex items-center gap-1 hover:underline"
              >
                <span>WhatsApp: +91 98712 19033</span>
              </a>
              <span>Email: info@dkffj.org</span>
              <span>Kanpur, Uttar Pradesh, India</span>
            </div>
            <div className="flex gap-2.5 mt-2">
              {/* WhatsApp Channel */}
              <a 
                href="https://whatsapp.com/channel/0029Va64Sq3KWEL0Fq19xi1g" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="WhatsApp Channel"
                className="w-7 h-7 rounded-full bg-slate-200 hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all text-slate-600"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.858.002-2.634-1.023-5.11-2.884-6.974C16.588 1.91 14.113.882 11.48.882c-5.443 0-9.863 4.42-9.866 9.86-.001 1.762.48 3.487 1.396 4.98L2.025 21.8l6.326-1.657c-1.554 1.056-1.748 1.01-1.704 1.011zm11.724-4.593c-.307-.154-1.82-.9-2.102-1.002-.281-.102-.486-.154-.69.154-.204.307-.79.997-.97 1.202-.178.204-.358.23-.665.077-2.586-1.293-3.69-1.92-5.168-4.445-.39-.667.39-.62 1.117-2.062.123-.246.062-.46-.03-.615-.093-.154-.79-1.9-.1.97-.246.307-.486.358-.69.358-.204-.002-.435-.003-.665-.003-.23 0-.603.086-.918.43-.314.342-1.202 1.176-1.202 2.87 0 1.691 1.233 3.326 1.403 3.557.17.23 2.424 3.7 5.87 5.18 2.052.88 2.886.96 3.91.81 1.21-.18 1.82-.74 2.08-1.4.26-.66.26-1.23.18-1.35-.08-.12-.3-.22-.61-.38z"/>
                </svg>
              </a>
              {/* Telegram */}
              <a 
                href="https://t.me/dkfoundationoffreedom" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Telegram Channel"
                className="w-7 h-7 rounded-full bg-slate-200 hover:bg-[#0088cc] hover:text-white flex items-center justify-center transition-all text-slate-600"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.02-1.99 1.25-5.61 3.7-.53.37-1 .55-1.42.54-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.75 3.88-1.69 6.46-2.8 7.74-3.33 3.68-1.52 4.44-1.78 4.94-1.79.11 0 .36.03.52.16.14.11.18.27.2.42.02.13.01.27-.01.37z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a 
                href="https://www.youtube.com/@dkffjorg" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="YouTube Channel"
                className="w-7 h-7 rounded-full bg-slate-200 hover:bg-[#FF0000] hover:text-white flex items-center justify-center transition-all text-slate-600"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/dkffjorg?igsh=eDFlb3ZlbHM0Ymhi" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Instagram"
                className="w-7 h-7 rounded-full bg-slate-200 hover:bg-[#E1306C] hover:text-white flex items-center justify-center transition-all text-slate-600"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a 
                href="https://www.linkedin.com/in/danish-khan-0134b687?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="LinkedIn"
                className="w-7 h-7 rounded-full bg-slate-200 hover:bg-[#0077B5] hover:text-white flex items-center justify-center transition-all text-slate-600"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block">
              &copy; {new Date().getFullYear()} DKFFJ. All rights reserved.
            </span>
          </div>

        </div>
      </footer>

      {/* 13. Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-sky-100 z-50 py-3 px-4 flex gap-2 justify-around shadow-[0_-5px_15px_rgba(0,0,0,0.08)]">
        <Link 
          href="#contact" 
          className="flex-1 text-center bg-[#1565C0] hover:bg-[#0D47A1] text-white text-[10px] font-bold py-2.5 rounded-lg uppercase tracking-wider transition-colors"
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
          className="flex-1 text-center bg-[#1565C0] hover:bg-slate-700 text-white text-[10px] font-bold py-2.5 rounded-lg uppercase tracking-wider transition-colors"
        >
          Verify Certificate
        </Link>
      </div>

      {/* Mobile Drawer Navigation Overlay */}
      <div
        className={`fixed inset-0 z-[100] md:hidden bg-slate-950/40 backdrop-blur-md transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`absolute top-0 left-0 w-[280px] h-full bg-[#0D47A1] text-white shadow-2xl transition-transform duration-300 transform flex flex-col justify-between ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Menu Header */}
          <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#0a3c8a]">
            <span className="font-serif font-black text-sm tracking-widest text-white uppercase">
              DK FOUNDATION
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-white focus:outline-none p-1 bg-white/10 rounded-md hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Links */}
          <div className="flex-1 overflow-y-auto py-6 px-5 space-y-4">
            <nav className="flex flex-col gap-3 text-sm font-bold uppercase tracking-wider text-white/95">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-white/10 transition-all"
              >
                Home
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-white/10 transition-all"
              >
                About Us
              </Link>
              <Link
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-white/10 transition-all"
              >
                Services
              </Link>
              <Link
                href="/courses"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-white/10 transition-all"
              >
                Academy
              </Link>
              <Link
                href="/documents"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-white/10 transition-all"
              >
                Legals
              </Link>
              <Link
                href="/news"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-white/10 transition-all"
              >
                News
              </Link>
              <Link
                href="/gallery"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-white/10 transition-all"
              >
                Gallery
              </Link>
              <Link
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg hover:bg-white/10 transition-all"
              >
                Contact
              </Link>
              <Link
                href="/apply-appreciation"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-yellow-300 hover:bg-white/10 transition-all font-extrabold flex items-center justify-between"
              >
                <span>Appreciation Certificate</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-yellow-300 hover:bg-white/10 transition-all font-extrabold flex items-center justify-between"
              >
                <span>Track Application</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/my-account"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-yellow-300 hover:bg-white/10 transition-all font-extrabold flex items-center justify-between"
              >
                <span>My Account</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </nav>

            {/* Social Links Grid in Mobile Drawer */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <span className="text-[10px] uppercase font-black tracking-widest text-white/50 block mb-3">Connect With Us</span>
              <div className="grid grid-cols-5 gap-2">
                
                {/* WhatsApp Channel */}
                <a 
                  href="https://whatsapp.com/channel/0029Va64Sq3KWEL0Fq19xi1g" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all text-white/90"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.858.002-2.634-1.023-5.11-2.884-6.974C16.588 1.91 14.113.882 11.48.882c-5.443 0-9.863 4.42-9.866 9.86-.001 1.762.48 3.487 1.396 4.98L2.025 21.8l6.326-1.657c-1.554 1.056-1.748 1.01-1.704 1.011zm11.724-4.593c-.307-.154-1.82-.9-2.102-1.002-.281-.102-.486-.154-.69.154-.204.307-.79.997-.97 1.202-.178.204-.358.23-.665.077-2.586-1.293-3.69-1.92-5.168-4.445-.39-.667.39-.62 1.117-2.062.123-.246.062-.46-.03-.615-.093-.154-.79-1.9-.1.97-.246.307-.486.358-.69.358-.204-.002-.435-.003-.665-.003-.23 0-.603.086-.918.43-.314.342-1.202 1.176-1.202 2.87 0 1.691 1.233 3.326 1.403 3.557.17.23 2.424 3.7 5.87 5.18 2.052.88 2.886.96 3.91.81 1.21-.18 1.82-.74 2.08-1.4.26-.66.26-1.23.18-1.35-.08-.12-.3-.22-.61-.38z"/>
                  </svg>
                </a>

                {/* Telegram */}
                <a 
                  href="https://t.me/dkfoundationoffreedom" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#0088cc] hover:text-white transition-all text-white/90"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.02-1.99 1.25-5.61 3.7-.53.37-1 .55-1.42.54-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.75 3.88-1.69 6.46-2.8 7.74-3.33 3.68-1.52 4.44-1.78 4.94-1.79.11 0 .36.03.52.16.14.11.18.27.2.42.02.13.01.27-.01.37z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a 
                  href="https://www.youtube.com/@dkffjorg" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-all text-white/90"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a 
                  href="https://www.instagram.com/dkffjorg?igsh=eDFlb3ZlbHM0Ymhi" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#E1306C] hover:text-white transition-all text-white/90"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a 
                  href="https://www.linkedin.com/in/danish-khan-0134b687?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#0077B5] hover:text-white transition-all text-white/90"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Menu Footer */}
          <div className="p-5 pb-24 border-t border-white/10 bg-[#0a3c8a] space-y-2.5">
            <Link
              href="/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-[#1565C0] text-white text-xs font-black uppercase tracking-widest py-2.5 rounded-lg hover:bg-[#0D47A1] transition-colors shadow-md"
            >
              Join Membership
            </Link>
            <Link
              href="/donate"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-[#C00000] text-white text-xs font-black uppercase tracking-widest py-2.5 rounded-lg hover:bg-[#990000] transition-colors shadow-md"
            >
              Donate Now
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center border border-white/20 text-white/80 text-xs font-bold py-2 rounded-lg hover:bg-white/10 transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Blinking WhatsApp Button */}
      <a 
        href="https://whatsapp.com/channel/0029Va64Sq3KWEL0Fq19xi1g"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-6 z-[9999] flex items-center gap-2 bg-[#25D366] text-white font-extrabold text-xs px-4 py-2.5 rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:bg-[#20ba59] hover:scale-105 transition-all duration-300 group border border-white/20 animate-pulse"
        style={{ animationDuration: "2s" }}
      >
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.858.002-2.634-1.023-5.11-2.884-6.974C16.588 1.91 14.113.882 11.48.882c-5.443 0-9.863 4.42-9.866 9.86-.001 1.762.48 3.487 1.396 4.98L2.025 21.8l6.326-1.657c-1.554 1.056-1.748 1.01-1.704 1.011zm11.724-4.593c-.307-.154-1.82-.9-2.102-1.002-.281-.102-.486-.154-.69.154-.204.307-.79.997-.97 1.202-.178.204-.358.23-.665.077-2.586-1.293-3.69-1.92-5.168-4.445-.39-.667.39-.62 1.117-2.062.123-.246.062-.46-.03-.615-.093-.154-.79-1.9-.1.97-.246.307-.486.358-.69.358-.204-.002-.435-.003-.665-.003-.23 0-.603.086-.918.43-.314.342-1.202 1.176-1.202 2.87 0 1.691 1.233 3.326 1.403 3.557.17.23 2.424 3.7 5.87 5.18 2.052.88 2.886.96 3.91.81 1.21-.18 1.82-.74 2.08-1.4.26-.66.26-1.23.18-1.35-.08-.12-.3-.22-.61-.38z"/>
        </svg>
        <span className="tracking-wider uppercase font-bold text-[10px]">Connect With Us</span>
      </a>
    </div>
  );
}
