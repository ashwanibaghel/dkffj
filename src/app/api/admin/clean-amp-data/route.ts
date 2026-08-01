import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { cleanAmpText } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let cleanedAppreciation = 0;
    let cleanedMemberships = 0;
    let cleanedCourses = 0;

    // 1. Clean appreciation_applications
    const { data: apps } = await supabase.from("appreciation_applications").select("*");
    if (apps) {
      for (const app of apps) {
        const cleanName = cleanAmpText(app.full_name);
        const cleanField = cleanAmpText(app.social_work_field);
        const cleanDesc = cleanAmpText(app.description);
        const cleanFather = cleanAmpText(app.father_name);
        const cleanPhotoUrl = app.photo_url ? app.photo_url.replace(/ydfeyymikxndqijykyly\.supabase\.co/gi, "tgszzjbvpcznndrfkkov.supabase.co") : app.photo_url;

        if (
          cleanName !== app.full_name ||
          cleanField !== app.social_work_field ||
          cleanDesc !== app.description ||
          cleanFather !== app.father_name ||
          cleanPhotoUrl !== app.photo_url
        ) {
          await supabase
            .from("appreciation_applications")
            .update({
              full_name: cleanName,
              social_work_field: cleanField,
              description: cleanDesc,
              father_name: cleanFather || null,
              photo_url: cleanPhotoUrl || null,
            })
            .eq("id", app.id);
          cleanedAppreciation++;
        }
      }
    }

    // 2. Clean memberships
    const { data: members } = await supabase.from("memberships").select("*");
    if (members) {
      for (const m of members) {
        const cleanName = cleanAmpText(m.full_name);
        const cleanFather = cleanAmpText(m.father_name);
        const cleanDesignation = cleanAmpText(m.designation);
        const cleanWorkingArea = cleanAmpText(m.working_area);

        if (
          cleanName !== m.full_name ||
          cleanFather !== m.father_name ||
          cleanDesignation !== m.designation ||
          cleanWorkingArea !== m.working_area
        ) {
          await supabase
            .from("memberships")
            .update({
              full_name: cleanName,
              father_name: cleanFather || null,
              designation: cleanDesignation || null,
              working_area: cleanWorkingArea || null,
            })
            .eq("id", m.id);
          cleanedMemberships++;
        }
      }
    }

    // 3. Clean course_registrations
    const { data: regs } = await supabase.from("course_registrations").select("*");
    if (regs) {
      for (const r of regs) {
        const cleanName = cleanAmpText(r.full_name);
        const cleanFather = cleanAmpText(r.father_name);

        if (cleanName !== r.full_name || cleanFather !== r.father_name) {
          await supabase
            .from("course_registrations")
            .update({
              full_name: cleanName,
              father_name: cleanFather || null,
            })
            .eq("id", r.id);
          cleanedCourses++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Database Amp& Cleanup Finished! Cleaned ${cleanedAppreciation} appreciation records, ${cleanedMemberships} membership records, and ${cleanedCourses} course records.`,
      stats: {
        cleanedAppreciation,
        cleanedMemberships,
        cleanedCourses,
      },
    });
  } catch (err: any) {
    console.error("Clean amp data error:", err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
