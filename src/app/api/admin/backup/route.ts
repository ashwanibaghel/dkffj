import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
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

    // Fetch all database tables
    const [
      { data: memberships },
      { data: users },
      { data: certificates },
      { data: registrations },
      { data: payments },
      { data: donations },
      { data: complaints },
      { data: appreciations },
      { data: documents },
      { data: news },
      { data: banners }
    ] = await Promise.all([
      supabase.from("memberships").select("*"),
      supabase.from("users").select("id, email, full_name, role, created_at"),
      supabase.from("certificates").select("*"),
      supabase.from("course_registrations").select("*"),
      supabase.from("payments").select("*"),
      supabase.from("donations").select("*"),
      supabase.from("complaints").select("*"),
      supabase.from("appreciation_applications").select("*"),
      supabase.from("documents").select("*"),
      supabase.from("news_blogs").select("*"),
      supabase.from("banners").select("*")
    ]);

    const backupPayload = {
      meta: {
        exportedAt: new Date().toISOString(),
        exportedBy: user.email,
        system: "DKFFJ Next.js Core Portal",
        environment: process.env.NODE_ENV,
        counts: {
          memberships: memberships?.length || 0,
          users: users?.length || 0,
          certificates: certificates?.length || 0,
          registrations: registrations?.length || 0,
          payments: payments?.length || 0,
          donations: donations?.length || 0,
          complaints: complaints?.length || 0,
          appreciations: appreciations?.length || 0,
          documents: documents?.length || 0,
          news: news?.length || 0,
          banners: banners?.length || 0
        }
      },
      data: {
        memberships: memberships || [],
        users: users || [],
        certificates: certificates || [],
        course_registrations: registrations || [],
        payments: payments || [],
        donations: donations || [],
        complaints: complaints || [],
        appreciation_applications: appreciations || [],
        documents: documents || [],
        news_blogs: news || [],
        banners: banners || []
      }
    };

    const fileName = `dkffj_database_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

    return new NextResponse(JSON.stringify(backupPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`
      }
    });
  } catch (error: any) {
    console.error("Database backup generation error:", error);
    return NextResponse.json({ error: "Failed to generate backup.", details: error.message }, { status: 500 });
  }
}
