import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Ensure this API route is dynamically processed and bypasses Vercel static cache
export const dynamic = "force-dynamic";

export async function GET() {
  const prisma = new PrismaClient();

  try {
    console.log("Starting DB connection inside temporary API route...");
    const list = await prisma.courses.findMany();
    
    // Find or Create Test Course
    const testCourse = list.find(c => c.title === "Test Course (Real Payment Verify)");
    let result;

    if (!testCourse) {
      result = await prisma.courses.create({
        data: {
          title: "Test Course (Real Payment Verify)",
          description: "This is a temporary course created specifically for verifying live payment gateway transactions using real 1 INR currency.",
          duration: "1 Day",
          fees: 1.00,
          eligibility: "Anyone",
          is_active: true
        }
      });
      return NextResponse.json({
        success: true,
        message: "Test course created successfully with 1.00 INR fee.",
        data: result
      });
    } else {
      result = await prisma.courses.update({
        where: { id: testCourse.id },
        data: {
          fees: 1.00,
          is_active: true
        }
      });
      return NextResponse.json({
        success: true,
        message: "Existing test course updated successfully to 1.00 INR fee.",
        data: result
      });
    }
  } catch (err: any) {
    console.error("Prisma error inside temporary API route:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Unknown database error occurred."
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
