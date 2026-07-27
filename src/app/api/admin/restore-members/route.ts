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
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    // Build complete batch payload matching exact memberships table schema
    const batchPayload = teamMembers.map((m) => {
      const ackNo = `DKF-EXEC-${m.id}`;
      const status = m.status === 1 ? "APPROVED" : "REJECTED";
      const showHome = m.showHome === 1;

      return {
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
        updated_at: new Date().toISOString()
      };
    });

    // 1. Clear any existing migrated executive council records
    await supabase.from("memberships").delete().or("ack_no.like.DKF-EXEC-%,ack_no.like.DKE-EXEC-%");

    // 2. Insert in chunks of 50 records
    const chunkSize = 50;
    let insertedTotal = 0;
    let lastErrMessage = "";

    for (let i = 0; i < batchPayload.length; i += chunkSize) {
      const chunk = batchPayload.slice(i, i + chunkSize);
      const { error: insertErr } = await supabase.from("memberships").insert(chunk);
      if (insertErr) {
        console.error(`Chunk insertion error at index ${i}:`, insertErr);
        lastErrMessage = insertErr.message;
      } else {
        insertedTotal += chunk.length;
      }
    }

    if (insertedTotal === 0 && lastErrMessage) {
      return NextResponse.json({ error: `Insertion failed: ${lastErrMessage}` }, { status: 500 });
    }

    await incrementNamespaceVersion("members");
    await incrementNamespaceVersion("home_leaders");
    revalidatePath("/admin/members", "layout");
    revalidatePath("/admin", "layout");
    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      message: `Restoration Successful! Successfully inserted ${insertedTotal} official Executive Council members into Supabase!`,
      totalInserted: insertedTotal
    });
  } catch (error: any) {
    console.error("Restoration error:", error);
    return NextResponse.json({ error: "Failed to restore members.", details: error.message }, { status: 500 });
  }
}
