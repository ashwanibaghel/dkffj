import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    // 1. Delete course registrations
    const delCoursesReg = await prisma.course_registrations.deleteMany({
      where: {
        email: {
          endsWith: "@test-load.com"
        }
      }
    });

    // 2. Delete memberships
    const delMemberships = await prisma.memberships.deleteMany({
      where: {
        email: {
          endsWith: "@test-load.com"
        }
      }
    });

    // 3. Delete complaints
    const delComplaints = await prisma.complaints.deleteMany({
      where: {
        email: {
          endsWith: "@test-load.com"
        }
      }
    });

    // 4. Clean up seed course if dummy created
    await prisma.courses.deleteMany({
      where: {
        title: "Test Course Load"
      }
    });

    // 5. Clean up seed user if dummy created
    await prisma.users.deleteMany({
      where: {
        email: "test-user-seed@test-load.com"
      }
    });

    return NextResponse.json({
      success: true,
      purged: {
        course_registrations: delCoursesReg.count,
        memberships: delMemberships.count,
        complaints: delComplaints.count
      }
    });
  } catch (error: any) {
    console.error("Test clean error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
