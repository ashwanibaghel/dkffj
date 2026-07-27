"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { verifyAdmin } from "../auth";
import { incrementNamespaceVersion } from "@/lib/redis";
import { revalidatePath } from "next/cache";

export async function savePricingSettingsAction(payload: {
  appreciationFee: number;
  membershipFeeNormal: number;
  membershipFeeDistrict: number;
  membershipFeeZone: number;
  membershipFeeState: number;
  membershipFeeNational: number;
}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized access" };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const settingsRows = [
      { setting_key: "appreciationFee", setting_value: String(payload.appreciationFee) },
      { setting_key: "membershipFeeNormal", setting_value: String(payload.membershipFeeNormal) },
      { setting_key: "membershipFeeDistrict", setting_value: String(payload.membershipFeeDistrict) },
      { setting_key: "membershipFeeZone", setting_value: String(payload.membershipFeeZone) },
      { setting_key: "membershipFeeState", setting_value: String(payload.membershipFeeState) },
      { setting_key: "membershipFeeNational", setting_value: String(payload.membershipFeeNational) },
    ];

    for (const row of settingsRows) {
      const { error } = await supabase
        .from("system_settings")
        .upsert(row, { onConflict: "setting_key" });

      if (error) {
        console.error(`Error upserting ${row.setting_key}:`, error);
        return { success: false, error: `Database error (${row.setting_key}): ${error.message}` };
      }
    }

    await incrementNamespaceVersion("settings");
    revalidatePath("/admin/settings", "layout");
    revalidatePath("/apply-appreciation", "layout");
    revalidatePath("/apply", "layout");

    return { success: true, message: "Pricing configuration updated & saved successfully!" };
  } catch (err: any) {
    console.error("savePricingSettingsAction error:", err);
    return { success: false, error: err.message || "Failed to save settings." };
  }
}
