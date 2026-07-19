const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CATEGORIES = [
  { key: "IT", name: "IT & Computer Science", match: "Information Technology" },
  { key: "Media", name: "Journalism & Media", match: "Journalism" },
  { key: "Design", name: "Design & Animation", match: "Design, Media" },
  { key: "Fashion", name: "Fashion & Textiles", match: "Fashion Designing" },
  { key: "Beauty", name: "Beauty & Wellness", match: "Beauty, Wellness" },
  { key: "Health", name: "Healthcare & Paramedical", match: "Healthcare" },
  { key: "Trades", name: "Technical & Engineering", match: "Engineering Trades" },
  { key: "Vocational", name: "Management & Vocational", match: "Management, Vocational" }
];

const getCourseCategoryKey = (course) => {
  const desc = course.description.toLowerCase();
  const title = course.title.toLowerCase();
  
  if (title.includes("rti") || title.includes("right to information")) {
    console.log("Matched title for rti -> return Media");
    return "Media";
  }
  if (title.includes("ngo") || title.includes("social work") || title.includes("human rights")) {
    console.log("Matched title for ngo/social/human -> return Vocational");
    return "Vocational";
  }

  for (const cat of CATEGORIES) {
    console.log(`Looping category: ${cat.key}, match = "${cat.match}"`);
    if (cat.match) {
      const matchLower = cat.match.toLowerCase();
      const hasMatch = desc.includes(matchLower);
      console.log(`Checking desc.includes("${matchLower}") -> ${hasMatch}`);
      if (hasMatch) {
        console.log(`MATCHED! Returning: ${cat.key}`);
        return cat.key;
      }
    }
  }
  console.log("No match in loop -> returning Vocational");
  return "Vocational";
};

async function main() {
  try {
    const course = await prisma.courses.findFirst({
      where: { title: "Certificate in Computer Applications (CCA)" }
    });
    
    if (!course) {
      console.log("CCA course not found!");
      return;
    }

    console.log("Result of getCourseCategoryKey:", getCourseCategoryKey(course));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
