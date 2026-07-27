import { PricingSettings, DEFAULT_PRICING_SETTINGS } from "@/lib/portalSettings";

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

export function getDynamicMembershipTiers(pricing?: PricingSettings): Record<MembershipLevelKey, MembershipTier> {
  const p = pricing || DEFAULT_PRICING_SETTINGS;

  return {
    NATIONAL: {
      key: "NATIONAL",
      label: "National Level Membership",
      hindiLabel: "राष्ट्रीय स्तर",
      fee: p.membershipFeeNational,
      badgeBg: "bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800",
      badgeText: "text-purple-800 dark:text-purple-300",
      description: "National Executive & All-India Jurisdiction"
    },
    STATE: {
      key: "STATE",
      label: "State Level Membership",
      hindiLabel: "राज्य स्तर",
      fee: p.membershipFeeState,
      badgeBg: "bg-indigo-100 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800",
      badgeText: "text-indigo-800 dark:text-indigo-300",
      description: "State Executive & State-wide Jurisdiction"
    },
    ZONE: {
      key: "ZONE",
      label: "Zone Level Membership",
      hindiLabel: "ज़ोन स्तर",
      fee: p.membershipFeeZone,
      badgeBg: "bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800",
      badgeText: "text-blue-800 dark:text-blue-300",
      description: "Zonal / Divisional Executive & Range Jurisdiction"
    },
    DISTRICT: {
      key: "DISTRICT",
      label: "District Level Membership",
      hindiLabel: "जिला स्तर",
      fee: p.membershipFeeDistrict,
      badgeBg: "bg-teal-100 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800",
      badgeText: "text-teal-800 dark:text-teal-300",
      description: "District Executive & Zila Jurisdiction"
    },
    NORMAL: {
      key: "NORMAL",
      label: "Normal Membership",
      hindiLabel: "सामान्य सदस्यता",
      fee: p.membershipFeeNormal,
      badgeBg: "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700",
      badgeText: "text-slate-800 dark:text-slate-300",
      description: "General Member / Volunteer Access"
    }
  };
}

export const MEMBERSHIP_TIERS = getDynamicMembershipTiers();
export const MEMBERSHIP_TIERS_LIST = Object.values(MEMBERSHIP_TIERS);

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

export function getFeeForLevel(levelKeyStr?: string, customPricing?: PricingSettings): number {
  const tiers = getDynamicMembershipTiers(customPricing);
  const key = (levelKeyStr || "NORMAL").toUpperCase() as MembershipLevelKey;
  if (tiers[key]) {
    return tiers[key].fee;
  }
  return tiers.NORMAL.fee;
}
