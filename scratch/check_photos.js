import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const leaders = await prisma.teamMember.findMany();
  let withPhoto = 0;
  let withoutPhoto = 0;
  const noPhotoList = [];

  for (const l of leaders) {
    if (l.photo && l.photo.trim() !== "") {
      withPhoto++;
    } else {
      withoutPhoto++;
      noPhotoList.push({ id: l.id, name: l.name, mobile: l.mobile });
    }
  }

  const res = `With Photo: ${withPhoto} / ${leaders.length}\nWithout Photo: ${withoutPhoto} / ${leaders.length}\nNo Photo Members:\n${JSON.stringify(noPhotoList, null, 2)}`;
  fs.writeFileSync(path.join(process.cwd(), "scratch", "check_out.txt"), res);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
