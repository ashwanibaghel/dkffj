import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const res = await prisma.memberships.updateMany({
    where: {
      ack_no: { startsWith: "DKE-EXEC-" }
    },
    data: {
      status: "APPROVED"
    }
  });
  const out = `Successfully updated ${res.count} migrated Executive Council members to APPROVED status.`;
  fs.writeFileSync(path.join(process.cwd(), "scratch", "appr_out.txt"), out);
  console.log(out);
}

main().catch(console.error).finally(() => prisma.$disconnect());
