import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const [
      { data: memberships },
      { data: complaints },
      { data: registrations },
      { data: payments },
      { data: donations },
      { data: certificates },
      { data: appreciations }
    ] = await Promise.all([
      supabase.from("memberships").select("id, full_name, ack_no, status, created_at, is_migrated, role").order("created_at", { ascending: false }).limit(20),
      supabase.from("complaints").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("course_registrations").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("donations").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("certificates").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("appreciation_applications").select("*").order("created_at", { ascending: false }).limit(20)
    ]);

    return NextResponse.json({
      membershipsCount: memberships?.length || 0,
      recentMemberships: memberships,
      complaintsCount: complaints?.length || 0,
      complaints: complaints,
      registrationsCount: registrations?.length || 0,
      registrations: registrations,
      paymentsCount: payments?.length || 0,
      payments: payments,
      donationsCount: donations?.length || 0,
      donations: donations,
      certificatesCount: certificates?.length || 0,
      certificates: certificates,
      appreciationsCount: appreciations?.length || 0,
      appreciations: appreciations
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
