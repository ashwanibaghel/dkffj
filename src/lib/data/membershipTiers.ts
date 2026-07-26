export type MembershipLevelKey = "NATIONAL" | "STATE" | "ZONE" | "DISTRICT" | "NORMAL";

export interface MembershipTier {
  key: MembershipLevelKey;
  label: string;
  hindiLabel: string;
  fee: number;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const MEMBERSHIP_TIERS: Record<MembershipLevelKey, MembershipTier> = {
  NATIONAL: {
    key: "NATIONAL",
    label: "National Level Membership",
    hindiLabel: "राष्ट्रीय स्तर",
    fee: 51000,
    badgeBg: "bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800",
    badgeText: "text-purple-800 dark:text-purple-300",
    description: "National Executive & All-India Jurisdiction"
  },
  STATE: {
    key: "STATE",
    label: "State Level Membership",
    hindiLabel: "राज्य स्तर",
    fee: 11000,
    badgeBg: "bg-indigo-100 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800",
    badgeText: "text-indigo-800 dark:text-indigo-300",
    description: "State Executive & State-wide Jurisdiction"
  },
  ZONE: {
    key: "ZONE",
    label: "Zone Level Membership",
    hindiLabel: "ज़ोन स्तर",
    fee: 5100,
    badgeBg: "bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800",
    badgeText: "text-blue-800 dark:text-blue-300",
    description: "Zonal / Divisional Executive & Range Jurisdiction"
  },
  DISTRICT: {
    key: "DISTRICT",
    label: "District Level Membership",
    hindiLabel: "जिला स्तर",
    fee: 2100,
    badgeBg: "bg-teal-100 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800",
    badgeText: "text-teal-800 dark:text-teal-300",
    description: "District Executive & Zila Jurisdiction"
  },
  NORMAL: {
    key: "NORMAL",
    label: "Normal Membership",
    hindiLabel: "सामान्य सदस्यता",
    fee: 1100,
    badgeBg: "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700",
    badgeText: "text-slate-800 dark:text-slate-300",
    description: "General Member / Volunteer Access"
  }
};

export const MEMBERSHIP_TIERS_LIST = Object.values(MEMBERSHIP_TIERS);

/**
 * Auto-detects membership level from member's designation & working area string
 */
export function autoDetectMembershipLevel(designation?: string, workingArea?: string): MembershipLevelKey {
  const text = `${designation || ''} ${workingArea || ''}`.toUpperCase().trim();

  if (text.includes("NATIONAL") || text.includes("RASHTRIYA") || text.includes("ALL INDIA") || text.includes("INDIA")) {
    return "NATIONAL";
  }
  if (text.includes("STATE") || text.includes("PRADESH") || text.includes("RAJYA")) {
    return "STATE";
  }
  if (text.includes("ZONE") || text.includes("MANDAL") || text.includes("RANGE") || text.includes("DIVISION")) {
    return "ZONE";
  }
  if (text.includes("DISTRICT") || text.includes("JILA") || text.includes("ZILA") || text.includes("CITY")) {
    return "DISTRICT";
  }

  return "NORMAL";
}

/**
 * Get fee amount for a given level key or level text
 */
export function getFeeForLevel(levelKeyStr?: string): number {
  if (!levelKeyStr) return 1100;
  const key = levelKeyStr.toUpperCase() as MembershipLevelKey;
  if (MEMBERSHIP_TIERS[key]) {
    return MEMBERSHIP_TIERS[key].fee;
  }
  return 1100;
}
