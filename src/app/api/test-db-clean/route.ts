import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    const deleted = await prisma.complaints.deleteMany({
      where: {
        email: {
          endsWith: "@test-load.com"
        }
      }
    });

    return NextResponse.json({ success: true, count: deleted.count });
  } catch (error: any) {
    console.error("Test clean error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
