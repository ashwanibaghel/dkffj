import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const leaders = await prisma.teamMember.findMany();
  let withPhoto = 0;
  let withoutPhoto = 0;

  for (const l of leaders) {
    if (l.photo && l.photo.trim() !== "") {
      withPhoto++;
    } else {
      withoutPhoto++;
    }
  }

  const res = `Total Leaders: ${leaders.length}\nLeaders WITH Photo: ${withPhoto}\nLeaders WITHOUT Photo: ${withoutPhoto}`;
  fs.writeFileSync(path.join(process.cwd(), "scratch", "final_photos.txt"), res);
  console.log(res);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
