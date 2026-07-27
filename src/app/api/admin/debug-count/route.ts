import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, count, error } = await supabase
      .from("memberships")
      .select("id, full_name, ack_no, membership_no, status, is_migrated, remarks, created_at", { count: "exact" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalCount = count || data?.length || 0;
    const migratedCount = data?.filter(m => 
      m.is_migrated || 
      m.remarks?.includes("MIGRATED") || 
      m.ack_no?.startsWith("DKF-EXEC-") || 
      m.ack_no?.startsWith("DKE-EXEC-") || 
      m.ack_no?.startsWith("MIGRATED_")
    ).length || 0;

    return NextResponse.json({
      totalCount,
      migratedCount,
      nonMigratedCount: totalCount - migratedCount,
      sampleRows: data?.slice(0, 20),
      allAckNos: data?.map(m => m.ack_no)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
