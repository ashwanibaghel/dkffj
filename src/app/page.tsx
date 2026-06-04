import Link from "next/link";
import VerificationWidget from "@/components/VerificationWidget";
import HeroSlider from "@/components/HeroSlider";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative overflow-hidden">
      
      {/* Light Geometric/Mesh Design Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Blue Radial Center Glow */}
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[#0F4C81]/[0.03] blur-[130px]"></div>
        <div className="absolute top-[40%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] rounded-full bg-[#D62828]/[0.015] blur-[120px]"></div>
      </div>

      {/* Global Navigation Header */}
      <header className="border-b border-slate-200/60 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          
          {/* Logo with Crest Icon */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F4C81]/10 to-[#D62828]/5 border border-slate-200 flex items-center justify-center transition-all group-hover:border-[#0F4C81]/30">
              <img src="/logo.png" className="w-9 h-9 object-contain" alt="DKFFJ Logo" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#0F4C81] font-bold text-sm tracking-wide font-serif leading-tight">DK Foundation</span>
              <span className="text-[9px] text-[#D62828] font-bold tracking-wider leading-none">OF FREEDOM AND JUSTICE</span>
              <span className="text-[7px] text-slate-500 font-medium tracking-wide mt-0.5">Govt. of India Registered NGO</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <Link href="/" className="text-[#0F4C81] hover:text-[#0F4C81] transition-colors">Home</Link>
            <Link href="#about" className="hover:text-[#0F4C81] transition-colors">About Us</Link>
            <Link href="#services" className="hover:text-[#0F4C81] transition-colors">Services</Link>
            <Link href="#courses" className="hover:text-[#0F4C81] transition-colors">Academy</Link>
            <Link href="#documents" className="hover:text-[#0F4C81] transition-colors">Legals</Link>
            <Link href="#contact" className="hover:text-[#0F4C81] transition-colors">Contact</Link>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <Link 
              href="#contact" 
              className="bg-[#D62828] text-white text-xs font-bold px-6 py-2.5 rounded-lg hover:bg-[#b02020] active:scale-95 transition-all shadow-[0_4px_15px_rgba(214,40,40,0.2)]"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <section className="relative py-20 md:py-32 px-6 w-full overflow-hidden bg-slate-950">
          {/* Automatic Cross-fade Background Hero Images Slider */}
          <HeroSlider />

          {/* Content overlay on top of background */}
          <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-3 py-1 self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D62828] animate-ping"></span>
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">MCA & NITI Aayog Approved Portal</span>
              </div>

              {/* Main Header with drop-shadows for high readability */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight font-serif drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                Protecting <span className="text-sky-400">Human Rights</span>, <br />
                Empowering Citizens, <br />
                Securing <span className="text-red-400">Justice</span>
              </h1>

              {/* Subtext description with drop-shadow for high legibility */}
              <p className="text-slate-200 text-sm md:text-base leading-relaxed max-w-xl font-light drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                DK Foundation of Freedom and Justice (DKFFJ) stands as India's premier human rights protection, legal aid, and public advocacy coalition. We help poor and marginalized citizens defend their constitutional rights through legal support, RTI awareness, and official welfare campaigns.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-4 relative z-30">
                
                <Link 
                  href="#joining" 
                  className="bg-[#0F4C81] hover:bg-[#0c3e6b] text-white font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-lg transition-all active:scale-95 shadow-[0_5px_15px_rgba(15,76,129,0.3)]"
                >
                  Join Membership
                </Link>
                
                <Link 
                  href="#complaint" 
                  className="bg-[#D62828] hover:bg-[#b02020] text-white font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-lg transition-all active:scale-95 shadow-[0_5px_15px_rgba(214,40,40,0.3)]"
                >
                  File a Complaint
                </Link>
                
                <Link 
                  href="#courses" 
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/15 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-lg transition-all active:scale-95"
                >
                  Explore Courses
                </Link>

              </div>

            </div>

            {/* Right Hero Column (Interactive Portal Widget) */}
            <div className="lg:col-span-5 w-full flex items-center justify-center lg:justify-end relative z-20">
              <VerificationWidget />
            </div>

          </div>
        </section>

        {/* 2. Impact Statistics Bar */}
        <section className="bg-white border-y border-slate-200 py-10 px-6">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="flex flex-col gap-1 border-r border-slate-100 last:border-none">
              <span className="text-3xl font-extrabold text-[#0F4C81]">15,000+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Registered Members</span>
            </div>
            <div className="flex flex-col gap-1 border-r border-slate-100 last:border-none">
              <span className="text-3xl font-extrabold text-[#D62828]">4,500+</span>
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
              <span className="text-3xl font-extrabold text-[#0F4C81]">120+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Awareness Camps</span>
            </div>
          </div>
        </section>

        {/* 3. About Organization Section */}
        <section id="about" className="py-20 px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#D62828] font-extrabold uppercase tracking-widest">Who We Are</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Pillars of Dignity and Constitutional Advocacy</h2>
              <div className="h-1 w-16 bg-[#0F4C81] mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81] mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Our Mission</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-light">
                  To eliminate corruption and human rights infringements by deploying RTI checks, providing active representation to marginalized families, and promoting social welfare throughout India.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-lg bg-[#D62828]/10 flex items-center justify-center text-[#D62828] mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Our Vision</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-light">
                  To establish a transparent, rights-aware society in India where every citizen has access to speedy legal assistance, transparent administration, and absolute human dignity.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81] mb-6">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Our Objectives</h3>
                <p className="text-slate-600 text-xs leading-relaxed font-light">
                  Educating common people on the Right to Information Act, supporting citizens in filing official grievances with government bodies, and establishing certifying legal and social studies.
                </p>
              </div>
            </div>

            {/* Supreme Court Arrest Guidelines (DK Basu Case) Accordion */}
            <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 font-serif flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D62828]"></span>
                Supreme Court Arrest Guidelines (D.K. Basu Case)
              </h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed font-light">
                The Hon'ble Supreme Court of India in <strong>D.K. Basu vs. State of West Bengal</strong> has laid down mandatory guidelines to be followed by law enforcement during arrests and detention to prevent custodial torture.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3">
                  <span className="font-bold text-[#0F4C81]">1.</span>
                  <p className="text-slate-600">Police officers conducting arrests must wear clear, visible name tags with accurate designations.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3">
                  <span className="font-bold text-[#0F4C81]">2.</span>
                  <p className="text-slate-600">An arrest memo must be prepared at the time of arrest, witnessed by a family member or local respectable citizen.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3">
                  <span className="font-bold text-[#0F4C81]">3.</span>
                  <p className="text-slate-600">The arrestee is entitled to inform a friend or relative of their location within 8-12 hours of arrest.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3">
                  <span className="font-bold text-[#0F4C81]">4.</span>
                  <p className="text-slate-600">Arrested persons must undergo a medical examination at the time of arrest and every 48 hours in custody.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 4. Services Section */}
        <section id="services" className="py-20 px-6 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#D62828] font-extrabold uppercase tracking-widest">Our Operations</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Comprehensive Public Service System</h2>
              <div className="h-1 w-16 bg-[#0F4C81] mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Service 1 */}
              <div className="border border-slate-200/80 rounded-2xl p-6 flex flex-col gap-3 hover:border-[#0F4C81]/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04A15.003 15.003 0 015 10c0-6 4-8.997 4-8.997s4 2.997 4 8.997c0 1.306-.18 2.568-.52 3.768M16.5 16.155A9 9 0 1113.5 3c2.43 0 4.621.996 6.21 2.61" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-slate-800">Human Rights Support</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-light">Legal assistance and representation against state arbitrary actions and constitutional violations.</p>
              </div>

              {/* Service 2 */}
              <div className="border border-slate-200/80 rounded-2xl p-6 flex flex-col gap-3 hover:border-[#0F4C81]/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#D62828]/10 flex items-center justify-center text-[#D62828]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-slate-800">Grievance Assistance</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-light">Assisting local citizens in drafting, filing, and tracking official grievance applications to authorities.</p>
              </div>

              {/* Service 3 */}
              <div className="border border-slate-200/80 rounded-2xl p-6 flex flex-col gap-3 hover:border-[#0F4C81]/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-slate-800">Legal Awareness</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-light">Organizing educational camps to inform common citizens about their legal rights and standard procedures.</p>
              </div>

              {/* Service 4 */}
              <div className="border border-slate-200/80 rounded-2xl p-6 flex flex-col gap-3 hover:border-[#0F4C81]/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#D62828]/10 flex items-center justify-center text-[#D62828]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-slate-800">RTI Advocacy</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-light">Spreading information and filing thousands of RTIs to combat corruption and expose scams in government programs.</p>
              </div>

              {/* Service 5 */}
              <div className="border border-slate-200/80 rounded-2xl p-6 flex flex-col gap-3 hover:border-[#0F4C81]/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-slate-800">Membership Program</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-light">Enrolling dedicated social and legal activists across all Indian states with official verification ID cards.</p>
              </div>

              {/* Service 6 */}
              <div className="border border-slate-200/80 rounded-2xl p-6 flex flex-col gap-3 hover:border-[#0F4C81]/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-[#D62828]/10 flex items-center justify-center text-[#D62828]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-slate-800">Certification Academy</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-light">Providing official certification courses in citizen rights, RTI drafting, and community leadership.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Featured Courses Section */}
        <section id="courses" className="py-20 px-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#D62828] font-extrabold uppercase tracking-widest">DKFFJ Academy</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Legal Study & Advocacy Certifications</h2>
              <div className="h-1 w-16 bg-[#0F4C81] mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Course 1 */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="p-6 flex flex-col gap-4">
                  <span className="text-[9px] text-[#0F4C81] font-bold bg-[#0F4C81]/10 px-2 py-0.5 rounded-full uppercase tracking-wider self-start">4 Weeks Certification</span>
                  <h4 className="text-base font-bold text-slate-800">RTI Drafting Specialist</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">Learn the art of drafting powerful Right to Information applications to demand transparency from government bodies.</p>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-800 font-extrabold text-sm">FREE / Open for All</span>
                  <Link href="#contact" className="bg-[#0F4C81] text-white text-xs font-bold px-4 py-2 rounded hover:bg-[#0c3e6b] transition-all">Apply</Link>
                </div>
              </div>

              {/* Course 2 */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="p-6 flex flex-col gap-4">
                  <span className="text-[9px] text-[#D62828] font-bold bg-[#D62828]/10 px-2 py-0.5 rounded-full uppercase tracking-wider self-start">6 Weeks Certification</span>
                  <h4 className="text-base font-bold text-slate-800">Human Rights Advocacy Course</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">An advanced module covering key international declarations, the Indian constitution, and standard legal recourse methods.</p>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-800 font-extrabold text-sm">FREE / Open for All</span>
                  <Link href="#contact" className="bg-[#0F4C81] text-white text-xs font-bold px-4 py-2 rounded hover:bg-[#0c3e6b] transition-all">Apply</Link>
                </div>
              </div>

              {/* Course 3 */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="p-6 flex flex-col gap-4">
                  <span className="text-[9px] text-[#0F4C81] font-bold bg-[#0F4C81]/10 px-2 py-0.5 rounded-full uppercase tracking-wider self-start">2 Weeks Certification</span>
                  <h4 className="text-base font-bold text-slate-800">Citizen Rights and B.S. Guidelines</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-light">Short crash course outlining the essential Supreme Court arrest guidelines and standard police reporting formats.</p>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-800 font-extrabold text-sm">FREE / Open for All</span>
                  <Link href="#contact" className="bg-[#0F4C81] text-white text-xs font-bold px-4 py-2 rounded hover:bg-[#0c3e6b] transition-all">Apply</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Leadership Team Section */}
        <section className="py-20 px-6 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#D62828] font-extrabold uppercase tracking-widest">Our Leadership</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Executive Council Members</h2>
              <div className="h-1 w-16 bg-[#0F4C81] mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Leader 1 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden p-6 text-center flex flex-col items-center gap-4 hover:border-[#0F4C81]/30 transition-all">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#0F4C81]/30">
                  <img src="/3.jpg" className="w-full h-full object-cover" alt="Danish Khan" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-slate-800">Danish Khan</h4>
                  <span className="text-[10px] text-[#D62828] font-bold uppercase tracking-wider mt-0.5">Founder & Director</span>
                  <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">India's famous RTI & Social Activist. Raised voice against custodial deaths, corruption, and social injustice before national media.</p>
                </div>
              </div>

              {/* Leader 2 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden p-6 text-center flex flex-col items-center gap-4 hover:border-[#0F4C81]/30 transition-all">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#0F4C81]/30">
                  <img src="/1.jpg" className="w-full h-full object-cover" alt="Mohd Wasim Qureshi" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-slate-800">Mohd Wasim Qureshi</h4>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">National President</span>
                  <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">Prominent industrialist and social welfare contributor representing national operations from Ajmer, Rajasthan.</p>
                </div>
              </div>

              {/* Leader 3 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden p-6 text-center flex flex-col items-center gap-4 hover:border-[#0F4C81]/30 transition-all">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#0F4C81]/30">
                  <img src="/2.jpg" className="w-full h-full object-cover" alt="Vipin Kumar Sharma" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-slate-800">Vipin Kumar Sharma</h4>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Chief Executive Officer</span>
                  <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">Government-approved journalist, National CEO of DKFFJ, overseeing executive operations and grievance reporting from BKT, Lucknow.</p>
                </div>
              </div>

              {/* Leader 4 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden p-6 text-center flex flex-col items-center gap-4 hover:border-[#0F4C81]/30 transition-all">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#0F4C81]/30">
                  <img src="/4.jpg" className="w-full h-full object-cover" alt="Jay Prakash Tiwari" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-slate-800">Jay Prakash Tiwari</h4>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">National Secretary</span>
                  <p className="text-[9px] text-slate-500 mt-2 leading-relaxed">Leading administrative operations, registrations compliance, and national coordinate activities from Ayodhya, UP.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Documents & Registrations Section */}
        <section id="documents" className="py-20 px-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#D62828] font-extrabold uppercase tracking-widest">Official Downloads</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Registration Documents & Tax Approvals</h2>
              <div className="h-1 w-16 bg-[#0F4C81] mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Document 1 */}
              <a href="/documents/1750940512.pdf" target="_blank" className="bg-white border border-slate-200/80 rounded-2xl p-6 flex justify-between items-center hover:border-[#0F4C81]/30 transition-all group shadow-sm">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">MCA Articles of Association</span>
                    <span className="text-[9px] text-slate-400 mt-1 uppercase">PDF | 181 KB</span>
                  </div>
                </div>
                <div className="text-slate-400 group-hover:text-[#0F4C81] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                </div>
              </a>

              {/* Document 2 */}
              <a href="/documents/1713277338.pdf" target="_blank" className="bg-white border border-slate-200/80 rounded-2xl p-6 flex justify-between items-center hover:border-[#0F4C81]/30 transition-all group shadow-sm">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">12A Income Tax Exemption</span>
                    <span className="text-[9px] text-slate-400 mt-1 uppercase">PDF | 55 KB</span>
                  </div>
                </div>
                <div className="text-slate-400 group-hover:text-[#0F4C81] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                </div>
              </a>

              {/* Document 3 */}
              <a href="/documents/1713277369.pdf" target="_blank" className="bg-white border border-slate-200/80 rounded-2xl p-6 flex justify-between items-center hover:border-[#0F4C81]/30 transition-all group shadow-sm">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">80G Income Tax Certificate</span>
                    <span className="text-[9px] text-slate-400 mt-1 uppercase">PDF | 55 KB</span>
                  </div>
                </div>
                <div className="text-slate-400 group-hover:text-[#0F4C81] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                </div>
              </a>

              {/* Document 4 */}
              <a href="/documents/1713277422.pdf" target="_blank" className="bg-white border border-slate-200/80 rounded-2xl p-6 flex justify-between items-center hover:border-[#0F4C81]/30 transition-all group shadow-sm">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">CSR Registration Certificate</span>
                    <span className="text-[9px] text-slate-400 mt-1 uppercase">PDF | 48 KB</span>
                  </div>
                </div>
                <div className="text-slate-400 group-hover:text-[#0F4C81] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                </div>
              </a>

              {/* Document 5 */}
              <a href="/documents/1713278028.PDF" target="_blank" className="bg-white border border-slate-200/80 rounded-2xl p-6 flex justify-between items-center hover:border-[#0F4C81]/30 transition-all group shadow-sm">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">NITI Aayog Registration</span>
                    <span className="text-[9px] text-slate-400 mt-1 uppercase">PDF | 56 KB</span>
                  </div>
                </div>
                <div className="text-slate-400 group-hover:text-[#0F4C81] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                </div>
              </a>

              {/* Document 6 */}
              <a href="/documents/1750870809.pdf" target="_blank" className="bg-white border border-slate-200/80 rounded-2xl p-6 flex justify-between items-center hover:border-[#0F4C81]/30 transition-all group shadow-sm">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.5 8H16.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">Police Appreciation Certificate</span>
                    <span className="text-[9px] text-slate-400 mt-1 uppercase">PDF | 672 KB</span>
                  </div>
                </div>
                <div className="text-slate-400 group-hover:text-[#0F4C81] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* 8. Latest News & Video Highlights */}
        <section className="py-20 px-6 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] text-[#D62828] font-extrabold uppercase tracking-widest">News & Media</span>
              <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Latest Campaigns and Video Briefings</h2>
              <div className="h-1 w-16 bg-[#0F4C81] mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Video Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-video bg-black">
                <iframe 
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/hjLMgfZ_Wp4?si=AK0l6ivlxAr0QeMD" 
                  title="DKFFJ Media Broadcast" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                ></iframe>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-video bg-black">
                <iframe 
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dT87hA0fhbM?si=7xM2EQASk1OLY1R2" 
                  title="DKFFJ Ground Report" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* News Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col gap-3">
                <span className="text-[9px] text-[#0F4C81] font-bold">September 2024</span>
                <h4 className="text-sm font-bold text-slate-800">डीके फाउंडेशन ऑफ फ़्रीडम एंड जस्टिस नियमावली</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-light">Foundation parameters defining executive operations, local RTI coordinator guidelines, and social relief camp registrations.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col gap-3">
                <span className="text-[9px] text-[#0F4C81] font-bold">August 2024</span>
                <h4 className="text-sm font-bold text-slate-800">मानवधिकार हनन को रोकना देश के हर नागरिक का प्रथम कर्तव्य है</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-light">CEO Vipin Sharma's address to the legal advocacy cell on helping unjustly detained youth and lodging standard writs of Habeas Corpus.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col gap-3">
                <span className="text-[9px] text-[#0F4C81] font-bold">June 2025</span>
                <h4 className="text-sm font-bold text-slate-800">National Executive Meeting at Ajmer Guest House</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-light">Director Danish Khan and National President Wasim Qureshi finalize structural deployment parameters for standard member certificates.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Contact & Complaint Lodging Form */}
        <section id="contact" className="py-20 px-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left Contact Form */}
            <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col gap-6">
              <div>
                <span className="text-[10px] text-[#D62828] font-extrabold uppercase tracking-widest">Submit Case</span>
                <h3 className="text-2xl font-bold font-serif text-slate-900 mt-1">Get in Touch / File a Grievance</h3>
                <p className="text-xs text-slate-500 mt-1">Fill out the official inquiry or complaint file. Our coordinators will contact you.</p>
              </div>

              <form className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Full Name *</label>
                    <input type="text" required placeholder="Your Name" className="bg-slate-50 border border-slate-200 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-xs px-4 py-3 rounded-lg outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Mobile No. *</label>
                    <input type="text" required placeholder="Phone Number" className="bg-slate-50 border border-slate-200 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-xs px-4 py-3 rounded-lg outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Email Address</label>
                    <input type="email" placeholder="email@example.com" className="bg-slate-50 border border-slate-200 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-xs px-4 py-3 rounded-lg outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">Grievance Type *</label>
                    <select required className="bg-slate-50 border border-slate-200 focus:border-[#0F4C81] text-xs px-4 py-3 rounded-lg outline-none">
                      <option>General Legal Inquiry</option>
                      <option>Human Rights Infringement</option>
                      <option>RTI Drafting Request</option>
                      <option>Membership Query</option>
                      <option>Grievance / Public complaint</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Details / Complaint Text *</label>
                  <textarea required rows={4} placeholder="State your problem clearly with landmarks, dates, and names of officers involved if applicable..." className="bg-slate-50 border border-slate-200 focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] text-xs px-4 py-3 rounded-lg outline-none resize-none"></textarea>
                </div>

                <button type="submit" className="bg-[#0F4C81] hover:bg-[#0c3e6b] text-white font-bold text-xs uppercase tracking-widest py-4 rounded-lg mt-2 transition-all active:scale-95 shadow-[0_4px_12px_rgba(15,76,129,0.15)] cursor-pointer">
                  Submit Application
                </button>
              </form>
            </div>

            {/* Right Contact Info Details */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-[#D62828] font-extrabold uppercase tracking-widest">Office Locations</span>
                <h3 className="text-2xl font-bold font-serif text-slate-900">DKFFJ Coordinates</h3>
                <div className="h-1 w-12 bg-[#0F4C81] mt-2 rounded-full"></div>
              </div>

              <div className="flex flex-col gap-6 text-xs text-slate-600">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81] shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 mb-1">Mobile Support Lines</h5>
                    <p className="font-mono">+91 9871219033, +91 8960552986</p>
                    <p className="font-mono text-slate-400 mt-0.5">Alt: +91 9453457930</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81] shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 mb-1">Official Emails</h5>
                    <p className="font-mono">info@dkffj.org</p>
                    <p className="font-mono text-slate-400 mt-0.5">dkfoundationoffreedom@gmail.com</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-[#0F4C81]/10 flex items-center justify-center text-[#0F4C81] shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 mb-1">Corporate & Regional Offices</h5>
                    <p className="mb-2"><strong>Head Office:</strong> 117/M/29-C Kakadeo M-Block, Madhuvan Appt. Road, Kanpur, UP 208019</p>
                    <p className="mb-2"><strong>Ajmer Office:</strong> Sarwar Guest House, Ander Kot District, Ajmer, Rajasthan 305001</p>
                    <p className="mb-2"><strong>Lucknow Office:</strong> 20B, Gata No. 458, Bhakamau BKT, Basha, Lucknow, UP 226026</p>
                    <p><strong>Delhi Office:</strong> 18/51 Trilok Puri, Near Shiv Mandir, Delhi 110091</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-10 text-xs text-slate-500">
          
          <div className="flex flex-col gap-3">
            <h5 className="font-serif font-bold text-[#0F4C81] text-sm leading-none">DKFFJ</h5>
            <p className="leading-relaxed font-light text-slate-400">
              DK Foundation of Freedom and Justice is a constitutional rights protection organ registered under Section 8 of the Companies Act, 2013, Ministry of Corporate Affairs, Govt. of India.
            </p>
            <span className="text-[10px] text-slate-400 mt-2 font-mono">CIN: U88100UP2023NPL181342</span>
          </div>

          <div className="flex flex-col gap-3">
            <h5 className="font-bold text-slate-800 uppercase tracking-wider">Quick Links</h5>
            <div className="flex flex-col gap-2">
              <Link href="#about" className="hover:text-[#0F4C81] transition-colors">About Objectives</Link>
              <Link href="#services" className="hover:text-[#0F4C81] transition-colors">Operations Details</Link>
              <Link href="#courses" className="hover:text-[#0F4C81] transition-colors">Academy Courses</Link>
              <Link href="#documents" className="hover:text-[#0F4C81] transition-colors">Downloadable Legals</Link>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h5 className="font-bold text-slate-800 uppercase tracking-wider">Official Policies</h5>
            <div className="flex flex-col gap-2">
              <Link href="#" className="hover:text-[#0F4C81] transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#0F4C81] transition-colors">Terms and Conditions</Link>
              <Link href="#" className="hover:text-[#0F4C81] transition-colors">Refund and Cancellation Policy</Link>
              <Link href="#" className="hover:text-[#0F4C81] transition-colors">Citizen Charter</Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-start md:items-end">
            <h5 className="font-bold text-slate-800 uppercase tracking-wider">Social Handles</h5>
            <div className="flex gap-4 text-[#0f4c81]">
              <a href="https://www.facebook.com/dkffjorg" target="_blank" className="hover:text-[#0c3e6b] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.325-.593 1.325-1.324v-21.35c0-.732-.595-1.325-1.325-1.325z"/></svg>
              </a>
              <a href="https://twitter.com/dkfofaj" target="_blank" className="hover:text-[#0c3e6b] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
            </div>
            <span className="text-[10px] text-slate-400 mt-2">
              &copy; {new Date().getFullYear()} DKFFJ. All rights reserved.
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
}
