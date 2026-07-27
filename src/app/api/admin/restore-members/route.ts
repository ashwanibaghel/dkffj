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

    // Build batch payload preserving original Approved vs Rejected status (status === 1 ? "APPROVED" : "REJECTED")
    const batchPayload = teamMembers.map((m) => {
      const ackNo = `DKF-EXEC-${m.id}`;
      const status = m.status === 1 ? "APPROVED" : "REJECTED";
      const showHome = m.showHome === 1;

      let cleanPhoto = m.photo || "";
      if (cleanPhoto.startsWith("/uploads/membership_form/")) {
        const fileName = cleanPhoto.replace("/uploads/membership_form/", "");
        cleanPhoto = `https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/membership_form/${fileName}`;
      }

      return {
        user_id: user.id,
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
        photo_url: cleanPhoto,
        aadhaar_url: "",
        signature_url: "",
        status: status,
        show_home: showHome,
        remarks: "MIGRATED_EXECUTIVE_COUNCIL",
        updated_at: new Date().toISOString()
      };
    });

    // 1. Fetch existing memberships to avoid deleting or overwriting custom client edits
    const { data: existingRecords } = await supabase
      .from("memberships")
      .select("ack_no");

    const existingAckSet = new Set(existingRecords?.map((r) => r.ack_no) || []);

    // 2. Insert missing records only
    const recordsToInsert = batchPayload.filter((r) => !existingAckSet.has(r.ack_no));

    const chunkSize = 50;
    let insertedTotal = 0;
    let lastErrMessage = "";

    if (recordsToInsert.length > 0) {
      for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
        const chunk = recordsToInsert.slice(i, i + chunkSize);
        const { error: insertErr } = await supabase.from("memberships").insert(chunk);
        if (insertErr) {
          console.error(`Chunk insertion error at index ${i}:`, insertErr);
          lastErrMessage = insertErr.message;
        } else {
          insertedTotal += chunk.length;
        }
      }
    }

    // 3. Update existing executive council records with exact original status (APPROVED vs REJECTED)
    for (const m of teamMembers) {
      const ackNo = `DKF-EXEC-${m.id}`;
      const origStatus = m.status === 1 ? "APPROVED" : "REJECTED";
      await supabase
        .from("memberships")
        .update({ status: origStatus, show_home: m.showHome === 1 })
        .eq("ack_no", ackNo);
    }

    await incrementNamespaceVersion("members");
    await incrementNamespaceVersion("home_leaders");
    revalidatePath("/admin/members", "layout");
    revalidatePath("/admin", "layout");
    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      message: `Restoration Complete! Preserved exact original Approved/Rejected statuses for all members. Inserted missing records: ${insertedTotal}`,
      totalInserted: insertedTotal
    });
  } catch (error: any) {
    console.error("Restoration error:", error);
    return NextResponse.json({ error: "Failed to restore members.", details: error.message }, { status: 500 });
  }
}
