import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const leaders = await prisma.teamMember.findMany({ orderBy: { id: "asc" } });

  let withPhoto = 0;
  let missingPhoto = 0;
  let photoExistsOnDisk = 0;
  const list = [];

  for (const l of leaders) {
    let exists = false;
    if (l.photo && l.photo.trim() !== "") {
      withPhoto++;
      const localPath = path.join(process.cwd(), "public", l.photo.replace(/^\//, ""));
      exists = fs.existsSync(localPath);
      if (exists) photoExistsOnDisk++;
    } else {
      missingPhoto++;
    }

    list.push({
      id: l.id,
      name: l.name,
      role: l.role,
      education: l.education,
      location: l.location,
      mobile: l.mobile,
      photo: l.photo || "EMPTY",
      photoExistsOnDisk: exists
    });
  }

  const out = `Total Executive Council Leaders: ${leaders.length}\nLeaders with Photo set: ${withPhoto}\nLeaders with Photo existing on disk: ${photoExistsOnDisk}\nLeaders missing photo: ${missingPhoto}\n\nList:\n${JSON.stringify(list, null, 2)}`;
  fs.writeFileSync(path.join(process.cwd(), "scratch", "leaders_summary.txt"), out);
  console.log(`Summary written. Total: ${leaders.length}, With Photo: ${withPhoto}, On Disk: ${photoExistsOnDisk}, Missing: ${missingPhoto}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
