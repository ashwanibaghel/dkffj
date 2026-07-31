import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const leaders = await prisma.teamMember.findMany();
  let restoredRejected = 0;
  let restoredApproved = 0;

  for (const l of leaders) {
    const ackNo = `DKE-EXEC-${l.id}`;
    const targetStatus = l.status === 1 ? "APPROVED" : "REJECTED";

    const res = await prisma.memberships.updateMany({
      where: {
        OR: [
          { ack_no: ackNo },
          { membership_no: `DKFFJ/M/EXEC/${l.id}` }
        ]
      },
      data: {
        status: targetStatus
      }
    });

    if (l.status !== 1) restoredRejected += res.count;
    else restoredApproved += res.count;
  }

  const out = `Restoration complete!\nOriginal REJECTED members restored: ${restoredRejected}\nOriginal APPROVED members kept: ${restoredApproved}`;
  fs.writeFileSync(path.join(process.cwd(), "scratch", "rest_out.txt"), out);
  console.log(out);
}

main().catch(console.error).finally(() => prisma.$disconnect());
