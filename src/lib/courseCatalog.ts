import { createClient } from "@supabase/supabase-js";

export interface NormalizedCourse {
  courseId: string;
  sector: string;
  sectorKey: string;
  topic: string;
  programType: "DIPLOMA" | "CERTIFICATE";
  title: string;
  duration: string;
  fees: number;
  eligibility: string;
  isActive: boolean;
}

export interface SectorGroup {
  key: string;
  name: string;
  topicCount: number;
  programCount: number;
  topics: {
    name: string;
    diploma?: NormalizedCourse;
    certificate?: NormalizedCourse;
  }[];
}

export const SECTORS = [
  { key: "IT", name: "Information Technology (IT) & Computer Science", match: "Information Technology" },
  { key: "Media", name: "Journalism, Media & Mass Communication", match: "Journalism" },
  { key: "Design", name: "Design, Media & Animation", match: "Design, Media" },
  { key: "Fashion", name: "Fashion Designing & Textile", match: "Fashion Designing" },
  { key: "Beauty", name: "Beauty, Wellness & Cosmetics", match: "Beauty, Wellness" },
  { key: "Health", name: "Healthcare & Allied Paramedical", match: "Healthcare" },
  { key: "Trades", name: "Engineering Trades, Technical & Technicians", match: "Engineering Trades" },
  { key: "Vocational", name: "Management, Vocational & Banking Skills", match: "Management, Vocational" }
];

export function normalizeCourseRecord(rawCourse: any): NormalizedCourse | null {
  if (!rawCourse || !rawCourse.title) return null;

  const desc = (rawCourse.description || "").toLowerCase();
  const title = rawCourse.title.trim();
  const titleLower = title.toLowerCase();

  // Filter out the 4 legacy standalone & test courses from Affiliation selection
  if (
    titleLower === "human rights law & advocacy" ||
    titleLower === "rti (right to information) activism" ||
    titleLower === "ngo management & social work" ||
    titleLower === "social welfare & legal aid" ||
    titleLower.includes("test course")
  ) {
    return null;
  }

  // Determine Sector
  let matchedSector = SECTORS[7]; // Default Vocational
  for (const s of SECTORS) {
    if (desc.includes(s.match.toLowerCase())) {
      matchedSector = s;
      break;
    }
  }

  // Determine Program Type
  const isDiploma = titleLower.startsWith("diploma") || titleLower.startsWith("advanced diploma");
  const programType: "DIPLOMA" | "CERTIFICATE" = isDiploma ? "DIPLOMA" : "CERTIFICATE";

  // Determine Topic Name
  let topicName = title
    .replace(/^Advanced Diploma in /i, "")
    .replace(/^Diploma in /i, "")
    .replace(/^Advanced Certificate in /i, "")
    .replace(/^Certificate in /i, "")
    .trim();

  return {
    courseId: rawCourse.id,
    sector: matchedSector.name,
    sectorKey: matchedSector.key,
    topic: topicName,
    programType,
    title,
    duration: rawCourse.duration || "1 Year",
    fees: Number(rawCourse.fees) || 999,
    eligibility: rawCourse.eligibility || "12th Pass or Equivalent",
    isActive: Boolean(rawCourse.is_active ?? true)
  };
}

// Fetch and return normalized active courses grouped by sector & topic
export async function getNormalizedCourseCatalog(onlyActive: boolean = true): Promise<{
  allCourses: NormalizedCourse[];
  sectorGroups: SectorGroup[];
  courseMap: Record<string, NormalizedCourse>;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tgszzjbvpcznndrfkkov.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_TU0EoaL-jusAaWLETkH5Ig_ODLvIw5n";
  const isNode = typeof window === "undefined";
  const customTransport = isNode ? require("ws") : undefined;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    global: { fetch: globalThis.fetch },
    realtime: customTransport ? { transport: customTransport } : undefined
  });

  let query = supabase.from("courses").select("*").order("title", { ascending: true });
  if (onlyActive) {
    query = query.eq("is_active", true);
  }

  const { data: rawCourses, error } = await query;
  if (error || !rawCourses) {
    console.error("Error fetching courses for catalog:", error);
    return { allCourses: [], sectorGroups: [], courseMap: {} };
  }

  const allCourses: NormalizedCourse[] = [];
  const courseMap: Record<string, NormalizedCourse> = {};

  rawCourses.forEach(rc => {
    const norm = normalizeCourseRecord(rc);
    if (norm) {
      allCourses.push(norm);
      courseMap[norm.courseId] = norm;
    }
  });

  // Group by sector
  const sectorGroups: SectorGroup[] = SECTORS.map(s => {
    const sectorCourses = allCourses.filter(c => c.sectorKey === s.key);
    
    // Group sector courses by topic
    const topicMap: Record<string, { name: string; diploma?: NormalizedCourse; certificate?: NormalizedCourse }> = {};
    sectorCourses.forEach(c => {
      const topicKey = c.topic.toLowerCase();
      if (!topicMap[topicKey]) {
        topicMap[topicKey] = { name: c.topic };
      }
      if (c.programType === "DIPLOMA") {
        topicMap[topicKey].diploma = c;
      } else {
        topicMap[topicKey].certificate = c;
      }
    });

    const topics = Object.values(topicMap);
    return {
      key: s.key,
      name: s.name,
      topicCount: topics.length,
      programCount: sectorCourses.length,
      topics
    };
  });

  return { allCourses, sectorGroups, courseMap };
}
