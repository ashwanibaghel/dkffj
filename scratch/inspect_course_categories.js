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
  
  if (/\brti\b/.test(title) || title.includes("right to information")) return "Media";
  if (/\bngo\b/.test(title) || title.includes("social work") || title.includes("human rights")) return "Vocational";

  for (const cat of CATEGORIES) {
    if (cat.match && desc.includes(cat.match.toLowerCase())) {
      return cat.key;
    }
  }
  return "Vocational";
};

async function main() {
  try {
    const courses = await prisma.courses.findMany();
    console.log(`Loaded ${courses.length} courses from DB.`);

    const keyCounts = {};
    const sampleByCat = {};

    courses.forEach(c => {
      const key = getCourseCategoryKey(c);
      keyCounts[key] = (keyCounts[key] || 0) + 1;

      if (!sampleByCat[key]) sampleByCat[key] = [];
      if (sampleByCat[key].length < 3) {
        sampleByCat[key].push({ title: c.title, descSnippet: c.description.substring(0, 100) });
      }
    });

    console.log("Calculated category mapping counts in DB (Optimized):", keyCounts);
    console.log("Samples by category mapping:", JSON.stringify(sampleByCat, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
