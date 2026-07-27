import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tgszzjbvpcznndrfkkov.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_TU0EoaL-jusAaWLETkH5Ig_ODLvIw5n";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, count, error } = await supabase
      .from("memberships")
      .select("id, full_name, ack_no, status, remarks, created_at", { count: "exact" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const execMembers = data?.filter(m => m.ack_no && (m.ack_no.startsWith("DKF-EXEC-") || m.ack_no.startsWith("DKE-EXEC-"))) || [];
    const phpMembers = data?.filter(m => m.remarks === "MIGRATED_PHP") || [];
    const otherMembers = data?.filter(m => !execMembers.includes(m) && !phpMembers.includes(m)) || [];

    const approvedExec = execMembers.filter(m => m.status === "APPROVED").length;
    const rejectedExec = execMembers.filter(m => m.status === "REJECTED").length;

    return NextResponse.json({
      totalCount: count || data?.length || 0,
      execMembersCount: execMembers.length,
      approvedExecCount: approvedExec,
      rejectedExecCount: rejectedExec,
      phpMembersCount: phpMembers.length,
      otherMembersCount: otherMembers.length,
      otherMembersSample: otherMembers.slice(0, 10),
      sampleRecords: data?.slice(0, 15)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
