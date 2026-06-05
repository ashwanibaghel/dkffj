import re
import os

input_path = r"E:\dkffj\dkffj-next\src\lib\teamData.ts"
output_path = r"E:\dkffj\dkffj-next\prisma\seed.js"

# Read teamData.ts
with open(input_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Locate teamMembers array
start_idx = content.find("export const teamMembers: TeamMember[] = [")
if start_idx == -1:
    print("Array not found!")
    exit(1)

array_content = content[start_idx:]
lines = array_content.split('\n')

items = []
current_item = {}
for line in lines:
    line = line.strip()
    if line.startswith("id:"):
        current_item["id"] = re.search(r'"([^"]+)"', line).group(1)
    elif line.startswith("name:"):
        current_item["name"] = re.search(r'"([^"]+)"', line).group(1)
    elif line.startswith("role:"):
        current_item["role"] = re.search(r'"([^"]+)"', line).group(1)
    elif line.startswith("education:"):
        current_item["education"] = re.search(r'"([^"]+)"', line).group(1)
    elif line.startswith("location:"):
        current_item["location"] = re.search(r'"([^"]+)"', line).group(1)
    elif line.startswith("mobile:"):
        # Mobile could be empty or have special chars, match quotes safely
        match = re.search(r'"([^"]*)"', line)
        current_item["mobile"] = match.group(1) if match else ""
    elif line.startswith("photo:"):
        current_item["photo"] = re.search(r'"([^"]*)"', line).group(1)
    elif line.startswith("status:"):
        current_item["status"] = int(re.search(r'\d+', line).group(0))
    elif line.startswith("show_home:"):
        current_item["showHome"] = int(re.search(r'\d+', line).group(0))
        # End of item
        items.append(current_item)
        current_item = {}

# Write seed.js
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, 'w', encoding='utf-8') as out:
    out.write("const { PrismaClient } = require('@prisma/client');\n")
    out.write("const prisma = new PrismaClient();\n\n")
    out.write("const teamMembers = [\n")
    for item in items:
        out.write("  {\n")
        out.write(f"    id: \"{item['id']}\",\n")
        out.write(f"    name: \"{item['name']}\",\n")
        out.write(f"    role: \"{item['role']}\",\n")
        out.write(f"    education: \"{item['education']}\",\n")
        out.write(f"    location: \"{item['location']}\",\n")
        out.write(f"    mobile: \"{item['mobile']}\",\n")
        out.write(f"    photo: \"{item['photo']}\",\n")
        out.write(f"    status: {item['status']},\n")
        out.write(f"    showHome: {item['showHome']}\n")
        out.write("  },\n")
    out.write("];\n\n")
    
    out.write("""async function main() {
  console.log("Seeding database...");
  for (const m of teamMembers) {
    await prisma.teamMember.upsert({
      where: { id: m.id },
      update: m,
      create: m
    });
  }
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
""")

print("Successfully generated prisma/seed.js!")
