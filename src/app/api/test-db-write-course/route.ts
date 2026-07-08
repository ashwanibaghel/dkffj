import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    // Get or create seed user
    let user = await prisma.users.findFirst();
    if (!user) {
      user = await prisma.users.create({
        data: {
          id: "00000000-0000-0000-0000-000000000001",
          email: "test-user-seed@test-load.com",
          role: "USER",
          full_name: "Seed User"
        }
      });
    }

    // Get or create seed course
    let course = await prisma.courses.findFirst();
    if (!course) {
      course = await prisma.courses.create({
        data: {
          title: "Test Course Load",
          description: "Load testing course description",
          duration: "3 Months",
          fees: 1500,
          eligibility: "12th Pass",
          is_active: true
        }
      });
    }

    const randomId = Math.floor(100000 + Math.random() * 900000);
    const reg = await prisma.course_registrations.create({
      data: {
        enrollment_no: `ENROLL-TEST-${randomId}-${Date.now()}`,
        user_id: user.id,
        course_id: course.id,
        full_name: "Loadtest Course Enrollment",
        mobile: "9999999999",
        email: `loadtest-${randomId}@test-load.com`,
        father_name: "Test Father",
        photo_url: "https://tgszzjbvpcznndrfkkov.supabase.co/storage/v1/object/public/photos/default.png",
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, id: reg.id });
  } catch (error: any) {
    console.error("Test write course error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
