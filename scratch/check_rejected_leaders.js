import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const ids = ["1049", "1026", "1067", "1005", "1096"];
  const leaders = await prisma.teamMember.findMany({ where: { id: { in: ids } } });
  const out = leaders.map(l => `ID: ${l.id} | Name: ${l.name} | teamMember status: ${l.status}`).join("\n");
  fs.writeFileSync(path.join(process.cwd(), "scratch", "rej_out.txt"), out);
}

main().catch(console.error).finally(() => prisma.$disconnect());
