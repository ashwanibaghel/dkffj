import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { teamMembers } from "@/lib/teamData";
import { incrementNamespaceVersion } from "@/lib/redis";
import { revalidatePath } from "next/cache";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Verify admin session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    let inserted = 0;
    let updated = 0;

    // Process all 380 Executive Council members in batches
    for (const m of teamMembers) {
      const ackNo = `DKF-EXEC-${m.id}`;
      const status = m.status === 1 ? "APPROVED" : "REJECTED";
      const showHome = m.showHome === 1;

      // Check if record exists by ack_no or mobile
      const { data: existing } = await supabase
        .from("memberships")
        .select("id")
        .or(`ack_no.eq.${ackNo},mobile.eq.${m.mobile}`)
        .maybeSingle();

      const memberPayload = {
        ack_no: ackNo,
        membership_no: `DKFFJ/M/EXEC/${m.id}`,
        full_name: m.name.trim(),
        father_name: "Executive Board",
        gender: "Male",
        dob: "1990-01-01",
        mobile: m.mobile || `90000${m.id}`,
        whatsapp: m.mobile || `90000${m.id}`,
        email: `leader_${m.id}@dkffj.org`,
        address: m.location || "India",
        district: m.location || "Kanpur",
        state: "Uttar Pradesh",
        pincode: "208019",
        education: m.education || "Graduate",
        profession: "Social Worker",
        working_area: "Human Rights",
        designation: m.role || "Executive Member",
        photo_url: m.photo || "",
        status: status,
        show_home: showHome,
        remarks: "MIGRATED_EXECUTIVE_COUNCIL",
        is_migrated: true,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        await supabase.from("memberships").update(memberPayload).eq("id", existing.id);
        updated++;
      } else {
        await supabase.from("memberships").insert({
          ...memberPayload,
          user_id: user.id,
          created_at: new Date().toISOString()
        });
        inserted++;
      }
    }

    await incrementNamespaceVersion("members");
    revalidatePath("/admin/members", "layout");
    revalidatePath("/admin", "layout");
    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      message: `Restoration Complete! Processed: ${teamMembers.length} records. Inserted: ${inserted}, Updated: ${updated}`,
      totalProcessed: teamMembers.length
    });
  } catch (error: any) {
    console.error("Restoration error:", error);
    return NextResponse.json({ error: "Failed to restore members.", details: error.message }, { status: 500 });
  }
}
