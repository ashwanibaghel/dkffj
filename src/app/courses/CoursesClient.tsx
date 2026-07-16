"use client";

import React, { useState, useMemo } from "react";
import CourseCard from "./CourseCard";
import { 
  GraduationCap, 
  Laptop, 
  Newspaper, 
  Palette, 
  Scissors, 
  Sparkles, 
  HeartPulse, 
  Wrench, 
  Briefcase, 
  Search, 
  X, 
  HelpCircle,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  fees: string;
  eligibility: string;
  image_url: string | null;
}

interface CoursesClientProps {
  initialCourses: Course[];
}

const CATEGORIES = [
  { key: "ALL", name: "All Categories", icon: GraduationCap, color: "from-[#001C55] to-blue-955", match: null },
  { key: "IT", name: "IT & Computer Science", icon: Laptop, color: "from-blue-600 to-indigo-700", match: "Information Technology" },
  { key: "Media", name: "Journalism & Media", icon: Newspaper, color: "from-sky-600 to-blue-700", match: "Journalism" },
  { key: "Design", name: "Design & Animation", icon: Palette, color: "from-purple-600 to-pink-700", match: "Design, Media" },
  { key: "Fashion", name: "Fashion & Textiles", icon: Scissors, color: "from-rose-600 to-orange-700", match: "Fashion Designing" },
  { key: "Beauty", name: "Beauty & Wellness", icon: Sparkles, color: "from-pink-500 to-rose-600", match: "Beauty, Wellness" },
  { key: "Health", name: "Healthcare & Paramedical", icon: HeartPulse, color: "from-emerald-600 to-teal-700", match: "Healthcare" },
  { key: "Trades", name: "Technical & Engineering", icon: Wrench, color: "from-amber-600 to-orange-700", match: "Engineering Trades" },
  { key: "Vocational", name: "Management & Vocational", icon: Briefcase, color: "from-indigo-600 to-violet-700", match: "Management, Vocational" }
];

export default function CoursesClient({ initialCourses }: CoursesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL"); // "ALL" | "DIPLOMA" | "TRAINING"
  const [searchQuery, setSearchQuery] = useState<string>(" ");
  
  // Track which categories are expanded when viewing "ALL"
  // Default: Keep all collapsed for ultimate mobile/desktop cleanliness
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Trim and clean search query
  const cleanSearchQuery = searchQuery.trim().toLowerCase();

  // Helper to categorize each course dynamically based on description content
  const getCourseCategoryKey = (course: Course): string => {
    const desc = course.description.toLowerCase();
    const title = course.title.toLowerCase();
    
    // Check custom patterns for original/other courses using word boundaries
    if (/\brti\b/.test(title) || title.includes("right to information")) return "Media";
    if (/\bngo\b/.test(title) || title.includes("social work") || title.includes("human rights")) return "Vocational";

    // Standard matching against category description patterns
    for (const cat of CATEGORIES) {
      if (cat.match && desc.includes(cat.match.toLowerCase())) {
        return cat.key;
      }
    }
    return "Vocational"; // Default fallback
  };

  // Get counts for each category dynamically based on full list
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: initialCourses.length };
    
    // Initialize keys
    CATEGORIES.forEach(c => {
      if (c.key !== "ALL") counts[c.key] = 0;
    });

    initialCourses.forEach(course => {
      const key = getCourseCategoryKey(course);
      if (counts[key] !== undefined) {
        counts[key] += 1;
      } else {
        counts[key] = 1;
      }
    });

    return counts;
  }, [initialCourses]);

  // Main filter pipeline
  const filteredCourses = useMemo(() => {
    return initialCourses.filter(course => {
      // 1. Category Filter (only applies if a specific category is selected)
      if (selectedCategory !== "ALL") {
        const catKey = getCourseCategoryKey(course);
        if (catKey !== selectedCategory) return false;
      }

      // 2. Track Filter
      if (selectedTrack !== "ALL") {
        const isDiploma = course.duration === "1 Year" || course.title.toLowerCase().startsWith("diploma");
        if (selectedTrack === "DIPLOMA" && !isDiploma) return false;
        if (selectedTrack === "TRAINING" && isDiploma) return false;
      }

      // 3. Search Filter
      if (cleanSearchQuery) {
        const title = course.title.toLowerCase();
        const desc = course.description.toLowerCase();
        const elig = course.eligibility.toLowerCase();
        if (!title.includes(cleanSearchQuery) && !desc.includes(cleanSearchQuery) && !elig.includes(cleanSearchQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [initialCourses, selectedCategory, selectedTrack, cleanSearchQuery]);

  // Group filtered courses by category for grouped accordion listing
  const groupedCourses = useMemo(() => {
    const groups: Record<string, Course[]> = {};
    
    filteredCourses.forEach(course => {
      const key = getCourseCategoryKey(course);
      if (!groups[key]) groups[key] = [];
      groups[key].push(course);
    });

    return groups;
  }, [filteredCourses]);

  const toggleCategoryExpand = (catKey: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catKey]: !prev[catKey]
    }));
  };

  return (
    <div className="space-y-8 animate-fadeIn select-none">
      
      {/* 1. Category selector: Swipable Grid/Pills */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Browse Sectors</h2>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
            {CATEGORIES.length - 1} Specializations
          </span>
        </div>

        {/* Desktop Grid Layout / Swipable mobile layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;
            const Icon = cat.icon;
            const count = categoryCounts[cat.key] || 0;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex flex-col items-center justify-between p-3.5 rounded-xl border text-center transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-[#001C55] border-[#001C55] text-white shadow-md shadow-blue-955/10 scale-[1.02]"
                    : "bg-white border-slate-200 hover:border-blue-200 hover:-translate-y-0.5 text-slate-700"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${
                  isActive ? "bg-white/10 text-white" : "bg-slate-50 text-[#001C55]"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <span className="text-[10px] font-extrabold tracking-tight leading-tight block break-words">
                    {cat.name.replace(" Sector", "")}
                  </span>
                  <span className={`text-[8px] font-bold mt-1.5 px-1.5 py-0.5 rounded-full inline-block w-fit mx-auto ${
                    isActive ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {count} Courses
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Search & Track filter bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search courses by title, keyword, eligibility..."
            value={searchQuery === " " ? "" : searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-800 focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 font-semibold"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          {cleanSearchQuery && (
            <button 
              onClick={() => setSearchQuery(" ")} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Track filter selector (Diploma vs Certificate) */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline">Program Type</span>
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/50">
            {[
              { key: "ALL", name: "All Programs" },
              { key: "DIPLOMA", name: "Diploma Track (1 Yr)" },
              { key: "TRAINING", name: "Certificate Track (6 Mo)" }
            ].map((track) => (
              <button
                key={track.key}
                onClick={() => setSelectedTrack(track.key)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedTrack === track.key
                    ? "bg-[#001C55] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-200/55"
                }`}
              >
                {track.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Helper summary banner */}
      {cleanSearchQuery || selectedCategory !== "ALL" || selectedTrack !== "ALL" ? (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-[#001C55] font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>
              Showing {filteredCourses.length} results matching filter configurations
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              setSelectedTrack("ALL");
              setSearchQuery(" ");
            }}
            className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wider cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : null}

      {/* 4. Course Listing (Grouped Accordion vs Flat Grid) */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl max-w-md mx-auto">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">No Matching Courses</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto leading-relaxed">
            We couldn't find any courses matching your current filter settings. Try clearing search query or selecting another sector.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("ALL");
              setSelectedTrack("ALL");
              setSearchQuery(" ");
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#001C55] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : selectedCategory === "ALL" ? (
        // Accordion Grouped view by Category when "All Categories" is active
        <div className="space-y-4">
          {CATEGORIES.filter(cat => cat.key !== "ALL").map(cat => {
            const coursesInCat = groupedCourses[cat.key] || [];
            if (coursesInCat.length === 0) return null; // Only show if there are filtered courses in this group

            const isExpanded = !!expandedCategories[cat.key];
            const Icon = cat.icon;

            return (
              <div key={cat.key} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                {/* Accordion Header */}
                <button
                  onClick={() => toggleCategoryExpand(cat.key)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-[#001C55] border border-slate-100 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{cat.name.replace(" Sector", "")}</h3>
                      <span className="text-[9px] text-slate-500 font-bold mt-0.5 block">{coursesInCat.length} Courses available</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mr-1">
                      {isExpanded ? "Click to Collapse" : "Click to Expand"}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#001C55]" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Collapsible Course Grid */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-100 bg-slate-50/30 animate-slideUp">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {coursesInCat.map(course => (
                        <div key={course.id}>
                          <CourseCard course={course} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Flat Grid View when a specific category is selected
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCourses.map((course) => (
            <div key={course.id} className="animate-slideUp">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
