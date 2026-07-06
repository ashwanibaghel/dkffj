import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    PHONEPE_MODE: process.env.PHONEPE_MODE || "NOT_SET",
    PHONEPE_CLIENT_ID: process.env.PHONEPE_CLIENT_ID || "NOT_SET",
    PHONEPE_MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID || "NOT_SET",
    PHONEPE_API_KEY_EXISTS: !!process.env.PHONEPE_API_KEY,
    NODE_ENV: process.env.NODE_ENV || "NOT_SET"
  });
}
