import { createClient } from "@supabase/supabase-js";

export interface PricingSettings {
  appreciationFee: number;
  membershipFeeNormal: number;
  membershipFeeDistrict: number;
  membershipFeeZone: number;
  membershipFeeState: number;
  membershipFeeNational: number;
}

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  appreciationFee: 49,
  membershipFeeNormal: 1100,
  membershipFeeDistrict: 2100,
  membershipFeeZone: 5100,
  membershipFeeState: 11000,
  membershipFeeNational: 51000,
};

export async function getPricingSettings(): Promise<PricingSettings> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tgszzjbvpcznndrfkkov.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_TU0EoaL-jusAaWLETkH5Ig_ODLvIw5n";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("system_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "appreciationFee",
        "membershipFeeNormal",
        "membershipFeeDistrict",
        "membershipFeeZone",
        "membershipFeeState",
        "membershipFeeNational"
      ]);

    if (error || !data || data.length === 0) {
      return DEFAULT_PRICING_SETTINGS;
    }

    const settingsMap: Record<string, number> = {};
    data.forEach((row) => {
      const num = Number(row.setting_value);
      if (!isNaN(num) && num >= 0) {
        settingsMap[row.setting_key] = num;
      }
    });

    return {
      appreciationFee: settingsMap.appreciationFee ?? DEFAULT_PRICING_SETTINGS.appreciationFee,
      membershipFeeNormal: settingsMap.membershipFeeNormal ?? DEFAULT_PRICING_SETTINGS.membershipFeeNormal,
      membershipFeeDistrict: settingsMap.membershipFeeDistrict ?? DEFAULT_PRICING_SETTINGS.membershipFeeDistrict,
      membershipFeeZone: settingsMap.membershipFeeZone ?? DEFAULT_PRICING_SETTINGS.membershipFeeZone,
      membershipFeeState: settingsMap.membershipFeeState ?? DEFAULT_PRICING_SETTINGS.membershipFeeState,
      membershipFeeNational: settingsMap.membershipFeeNational ?? DEFAULT_PRICING_SETTINGS.membershipFeeNational,
    };
  } catch (err) {
    console.error("Error fetching pricing settings:", err);
    return DEFAULT_PRICING_SETTINGS;
  }
}
