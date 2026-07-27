import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { incrementNamespaceVersion } from "@/lib/redis";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Verify admin authentication
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

    // 1. Delete test records from certificates (except real ones if any)
    await supabase.from("certificates").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 2. Delete test records from course_registrations
    await supabase.from("course_registrations").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 3. Delete test records from payments
    await supabase.from("payments").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 4. Delete test records from donations
    await supabase.from("donations").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 5. Delete test records from complaints
    await supabase.from("complaints").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 6. Delete test records from appreciation_applications
    await supabase.from("appreciation_applications").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 7. Delete non-migrated test memberships (preserve all migrated members + Ashwini Saurabh)
    await supabase
      .from("memberships")
      .delete()
      .not("ack_no", "like", "DKF-EXEC-%")
      .not("ack_no", "like", "DKE-EXEC-%")
      .not("ack_no", "like", "MIGRATED_%")
      .neq("ack_no", "DKF-INT-2026-1074");

    // 8. Invalidate Redis Cache & Next.js Router Cache
    await incrementNamespaceVersion("members");
    await incrementNamespaceVersion("home_leaders");
    revalidatePath("/admin", "layout");
    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      message: "Test data purged and cache revalidated successfully across Redis and Next.js!"
    });
  } catch (error: any) {
    console.error("Purge error:", error);
    return NextResponse.json({ error: "Failed to purge test records.", details: error.message }, { status: 500 });
  }
}
