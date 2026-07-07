import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Create table if not exists using Raw SQL (completely safe)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "appreciation_applications" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "application_no" VARCHAR(100) NOT NULL,
        "user_id" UUID NOT NULL,
        "full_name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) NOT NULL,
        "mobile" VARCHAR(20) NOT NULL,
        "address" TEXT NOT NULL,
        "country" VARCHAR(100) NOT NULL,
        "state" VARCHAR(100) NOT NULL,
        "district" VARCHAR(100) NOT NULL,
        "pincode" VARCHAR(20) NOT NULL,
        "social_work_field" VARCHAR(255) NOT NULL,
        "description" TEXT NOT NULL,
        "photo_url" TEXT NOT NULL,
        "id_proof_url" TEXT NOT NULL,
        "achievement_proof_url" TEXT,
        "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        "approved_by" UUID,
        "approved_at" TIMESTAMPTZ(6),
        "remarks" TEXT,
        "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
        "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),

        CONSTRAINT "appreciation_applications_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create indexes if they don't exist
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "appreciation_applications_application_no_key" ON "appreciation_applications"("application_no");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "idx_appreciation_no" ON "appreciation_applications"("application_no");
    `);

    // 2. Add columns to existing payments/status_logs tables if not exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "appreciation_id" UUID;
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "status_logs" ADD COLUMN IF NOT EXISTS "appreciation_id" UUID;
    `);

    // 3. Add FK constraints (we wrap in try-catch in case they exist already)
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "payments" ADD CONSTRAINT "payments_appreciation_id_fkey" FOREIGN KEY ("appreciation_id") REFERENCES "appreciation_applications"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      `);
    } catch (e) {
      // Ignored if constraint already exists
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "status_logs" ADD CONSTRAINT "status_logs_appreciation_id_fkey" FOREIGN KEY ("appreciation_id") REFERENCES "appreciation_applications"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      `);
    } catch (e) {
      // Ignored if constraint already exists
    }

    // 4. Add country column to memberships and complaints tables
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "memberships" ADD COLUMN IF NOT EXISTS "country" VARCHAR(100) NOT NULL DEFAULT 'India';
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "complaints" ADD COLUMN IF NOT EXISTS "country" VARCHAR(100) NOT NULL DEFAULT 'India';
    `);

    return NextResponse.json({ success: true, message: "Database schema tables and country columns initialized successfully on target PostgreSQL instance." });
  } catch (err: any) {
    console.error("Migration executor error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
