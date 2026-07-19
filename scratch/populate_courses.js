const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SECTOR_IMAGES = {
  "Information Technology (IT) & Computer Science Sector": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
  "Journalism, Media & Mass Communication Sector": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800",
  "Design, Media & Animation Sector": "https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&q=80&w=800",
  "Fashion Designing & Textile Sector": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800",
  "Beauty, Wellness & Cosmetics Sector": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
  "Healthcare & Allied Paramedical Sector": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800",
  "Engineering Trades, Technical & Technicians Sector": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
  "Management, Vocational & Banking Skills Sector": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800"
};

const courseRawData = [
  // 💻 1. Information Technology (IT) & Computer Science Sector
  { num: 1, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Computer Applications (DCA)", training: "Certificate in Computer Applications (CCA)" },
  { num: 2, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Advanced Diploma in Computer Applications (ADCA)", training: "Advanced Certificate in Computer Applications (ACCA)" },
  { num: 3, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Information Technology (DIT)", training: "Certificate in Information Technology (CIT)" },
  { num: 4, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Software Engineering", training: "Certificate in Software Engineering" },
  { num: 5, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Web Designing & Development", training: "Certificate in Web Designing & Development" },
  { num: 6, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Digital Marketing & Social Media Strategy", training: "Certificate in Digital Marketing & Social Media Strategy" },
  { num: 7, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Computer Hardware & Networking (CHN)", training: "Certificate in Computer Hardware & Networking (CHN)" },
  { num: 8, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Cyber Security & Ethical Hacking", training: "Certificate in Cyber Security & Ethical Hacking" },
  { num: 9, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Data Analytics & Data Science", training: "Certificate in Data Analytics & Data Science" },
  { num: 10, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Cloud Computing & DevOps", training: "Certificate in Cloud Computing & DevOps" },
  { num: 11, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Full Stack Web Development", training: "Certificate in Full Stack Web Development" },
  { num: 12, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Artificial Intelligence & Machine Learning", training: "Certificate in Artificial Intelligence & Machine Learning" },
  { num: 13, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in UI/UX Designing", training: "Certificate in UI/UX Designing" },
  { num: 14, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Mobile Application Development (Android/iOS)", training: "Certificate in Mobile Application Development (Android/iOS)" },
  { num: 15, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in IT Infrastructure Management", training: "Certificate in IT Infrastructure Management" },
  { num: 16, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Network Administration", training: "Certificate in Network Administration" },
  { num: 17, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Software Testing & Quality Assurance", training: "Certificate in Software Testing & Quality Assurance" },
  { num: 18, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Blockchain Technology & Applications", training: "Certificate in Blockchain Technology & Applications" },
  { num: 19, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Linux & Open Source Administration", training: "Certificate in Linux & Open Source Administration" },
  { num: 20, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in E-Commerce & Web Store Management", training: "Certificate in E-Commerce & Web Store Management" },
  { num: 21, sector: "Information Technology (IT) & Computer Science Sector", diploma: "Diploma in Office Automation & Publishing (DOAP)", training: "Certificate in Office Automation & Publishing (COAP)" },

  // 📰 2. Journalism, Media & Mass Communication Sector
  { num: 22, sector: "Journalism, Media & Mass Communication Sector", diploma: "Diploma in Journalism & Mass Communication", training: "Certificate in Journalism & Mass Communication" },
  { num: 23, sector: "Journalism, Media & Mass Communication Sector", diploma: "Diploma in Investigative Journalism & RTI Act", training: "Certificate in Investigative Journalism & RTI Act" },
  { num: 24, sector: "Journalism, Media & Mass Communication Sector", diploma: "Diploma in Digital Media & Cyber Journalism", training: "Certificate in Digital Media & Cyber Journalism" },
  { num: 25, sector: "Journalism, Media & Mass Communication Sector", diploma: "Diploma in Photojournalism & Visual Media", training: "Certificate in Photojournalism & Visual Media" },
  { num: 26, sector: "Journalism, Media & Mass Communication Sector", diploma: "Diploma in Broadcast Journalism (Radio & TV)", training: "Certificate in Broadcast Journalism (Radio & TV)" },
  { num: 27, sector: "Journalism, Media & Mass Communication Sector", diploma: "Diploma in Public Relations & Corporate Communication", training: "Certificate in Public Relations & Corporate Communication" },
  { num: 28, sector: "Journalism, Media & Mass Communication Sector", diploma: "Diploma in Media Laws, Ethics & Human Rights", training: "Certificate in Media Laws, Ethics & Human Rights" },
  { num: 29, sector: "Journalism, Media & Mass Communication Sector", diploma: "Diploma in Community Radio & Podcasting", training: "Certificate in Community Radio & Podcasting" },
  { num: 30, sector: "Journalism, Media & Mass Communication Sector", diploma: "Diploma in News Reporting, Editing & Anchoring", training: "Certificate in News Reporting, Editing & Anchoring" },
  { num: 31, sector: "Journalism, Media & Mass Communication Sector", diploma: "Diploma in Development Journalism & Social Change", training: "Certificate in Development Journalism & Social Change" },

  // 🎨 3. Design, Media & Animation Sector
  { num: 32, sector: "Design, Media & Animation Sector", diploma: "Diploma in Graphic Designing", training: "Certificate in Graphic Designing" },
  { num: 33, sector: "Design, Media & Animation Sector", diploma: "Diploma in 2D & 3D Animation", training: "Certificate in 2D & 3D Animation" },
  { num: 34, sector: "Design, Media & Animation Sector", diploma: "Diploma in Video Editing & Post-Production", training: "Certificate in Video Editing & Post-Production" },
  { num: 35, sector: "Design, Media & Animation Sector", diploma: "Diploma in Visual Effects (VFX)", training: "Certificate in Visual Effects (VFX)" },
  { num: 36, sector: "Design, Media & Animation Sector", diploma: "Diploma in Digital Photography & Videography", training: "Certificate in Digital Photography & Videography" },
  { num: 37, sector: "Design, Media & Animation Sector", diploma: "Diploma in Interior Designing", training: "Certificate in Interior Designing" },
  { num: 38, sector: "Design, Media & Animation Sector", diploma: "Diploma in Product Designing", training: "Certificate in Product Designing" },
  { num: 39, sector: "Design, Media & Animation Sector", diploma: "Diploma in Multimedia & Animation", training: "Certificate in Multimedia & Animation" },
  { num: 40, sector: "Design, Media & Animation Sector", diploma: "Diploma in Game Designing & Asset Creation", training: "Certificate in Game Designing & Asset Creation" },
  { num: 41, sector: "Design, Media & Animation Sector", diploma: "Diploma in Sound Engineering & Audio Production", training: "Certificate in Sound Engineering & Audio Production" },
  { num: 42, sector: "Design, Media & Animation Sector", diploma: "Diploma in Motion Graphics & Title Design", training: "Certificate in Motion Graphics & Title Design" },

  // ✂️ 4. Fashion Designing & Textile Sector
  { num: 43, sector: "Fashion Designing & Textile Sector", diploma: "Diploma in Fashion Designing", training: "Certificate in Fashion Designing" },
  { num: 44, sector: "Fashion Designing & Textile Sector", diploma: "Advanced Diploma in Fashion & Apparel Design", training: "Advanced Certificate in Fashion & Apparel Design" },
  { num: 45, sector: "Fashion Designing & Textile Sector", diploma: "Diploma in Textile Designing", training: "Certificate in Textile Designing" },
  { num: 46, sector: "Fashion Designing & Textile Sector", diploma: "Diploma in Garment Manufacturing Technology", training: "Certificate in Garment Manufacturing Technology" },
  { num: 47, sector: "Fashion Designing & Textile Sector", diploma: "Diploma in Fashion Merchandising & Marketing", training: "Certificate in Fashion Merchandising & Marketing" },
  { num: 48, sector: "Fashion Designing & Textile Sector", diploma: "Diploma in Jewelry Designing", training: "Certificate in Jewelry Designing" },
  { num: 49, sector: "Fashion Designing & Textile Sector", diploma: "Diploma in Apparel Pattern Making & CAD", training: "Certificate in Apparel Pattern Making & CAD" },
  { num: 50, sector: "Fashion Designing & Textile Sector", diploma: "Diploma in Boutique Management & Entrepreneurship", training: "Certificate in Boutique Management & Entrepreneurship" },
  { num: 51, sector: "Fashion Designing & Textile Sector", diploma: "Diploma in Knitwear Design & Technology", training: "Certificate in Knitwear Design & Technology" },
  { num: 52, sector: "Fashion Designing & Textile Sector", diploma: "Diploma in Leather Goods & Footwear Design", training: "Certificate in Leather Goods & Footwear Design" },
  { num: 53, sector: "Fashion Designing & Textile Sector", diploma: "Diploma in Visual Merchandising for Fashion Retail", training: "Certificate in Visual Merchandising for Fashion Retail" },
  { num: 54, sector: "Fashion Designing & Textile Sector", diploma: "Diploma in Sustainable Fashion & Eco-Textiles", training: "Certificate in Sustainable Fashion & Eco-Textiles" },
  { num: 55, sector: "Fashion Designing & Textile Sector", diploma: "Diploma in Traditional Indian Textiles & Embroidery", training: "Certificate in Traditional Indian Textiles & Embroidery" },
  { num: 56, sector: "Fashion Designing & Textile Sector", diploma: "Diploma in Garment Making & Tailoring", training: "Certificate in Garment Making & Tailoring" },

  // 💅 5. Beauty, Wellness & Cosmetics Sector
  { num: 57, sector: "Beauty, Wellness & Cosmetics Sector", diploma: "Diploma in Cosmetology & Beauty Therapy", training: "Certificate in Cosmetology & Beauty Therapy" },
  { num: 58, sector: "Beauty, Wellness & Cosmetics Sector", diploma: "Diploma in Professional Makeup Artistry", training: "Certificate in Professional Makeup Artistry" },
  { num: 59, sector: "Beauty, Wellness & Cosmetics Sector", diploma: "Diploma in Advanced Hair Styling & Hair Dressing", training: "Certificate in Advanced Hair Styling & Hair Dressing" },
  { num: 60, sector: "Beauty, Wellness & Cosmetics Sector", diploma: "Diploma in Skin Care & Aesthetics", training: "Certificate in Skin Care & Aesthetics" },
  { num: 61, sector: "Beauty, Wellness & Cosmetics Sector", diploma: "Diploma in Spa Therapy & Wellness Management", training: "Certificate in Spa Therapy & Wellness Management" },
  { num: 62, sector: "Beauty, Wellness & Cosmetics Sector", diploma: "Diploma in Nail Art & Extension Technology", training: "Certificate in Nail Art & Extension Technology" },
  { num: 63, sector: "Beauty, Wellness & Cosmetics Sector", diploma: "Diploma in Laser & Advanced Aesthetic Treatments", training: "Certificate in Laser & Advanced Aesthetic Treatments" },

  // 🏥 6. Healthcare & Allied Paramedical Sector
  { num: 64, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Medical Laboratory Technology (DMLT)", training: "Certificate in Medical Laboratory Technology (CMLT)" },
  { num: 65, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in X-Ray & Medical Imaging Technology", training: "Certificate in X-Ray & Medical Imaging Technology" },
  { num: 66, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Operation Theatre Technology (DOTT)", training: "Certificate in Operation Theatre Technology (COTT)" },
  { num: 67, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Health & Sanitary Inspection", training: "Certificate in Health & Sanitary Inspection" },
  { num: 68, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Physiotherapy (DPT)", training: "Certificate in Physiotherapy (CPT)" },
  { num: 69, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in General Duty Assistant (GDA / Nursing Assistant)", training: "Certificate in General Duty Assistant (GDA)" },
  { num: 70, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Emergency Medical Technician (EMT)", training: "Certificate in Emergency Medical Technician (EMT)" },
  { num: 71, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Yoga & Naturopathy Sciences", training: "Certificate in Yoga & Naturopathy Sciences" },
  { num: 72, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Nutrition, Dietetics & Fitness Management", training: "Certificate in Nutrition, Dietetics & Fitness Management" },
  { num: 73, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Pharmacy Assistant", training: "Certificate in Pharmacy Assistant" },
  { num: 74, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Dental Lab Technician", training: "Certificate in Dental Lab Technician" },
  { num: 75, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Optometry & Ophthalmic Assistant", training: "Certificate in Optometry & Ophthalmic Assistant" },
  { num: 76, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Dialysis Technician", training: "Certificate in Dialysis Technician" },
  { num: 77, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Hospital Front Office & Care Management", training: "Certificate in Hospital Front Office & Care Management" },
  { num: 78, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Ayurveda Nursing & Therapy", training: "Certificate in Ayurveda Nursing & Therapy" },
  { num: 79, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Patient Care Management", training: "Certificate in Patient Care Management" },
  { num: 80, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Medical Record Technology & Billing", training: "Certificate in Medical Record Technology & Billing" },
  { num: 81, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in Community Health Worker", training: "Certificate in Community Health Worker" },
  { num: 82, sector: "Healthcare & Allied Paramedical Sector", diploma: "Diploma in First Aid & Emergency Care", training: "Certificate in First Aid & Emergency Care" },

  // 🛠️ 7. Engineering Trades, Technical & Technicians Sector
  { num: 83, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Electrical Technician & Industrial Wiring", training: "Certificate in Electrical Technician & Industrial Wiring" },
  { num: 84, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Mobile Phone Repairing & Smart Device Diagnostics", training: "Certificate in Mobile Phone Repairing & Smart Device Diagnostics" },
  { num: 85, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Laptop & Computer Hardware Engineering", training: "Certificate in Laptop & Computer Hardware Engineering" },
  { num: 86, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Refrigeration & Air Conditioning (RAC) Mechanic", training: "Certificate in Refrigeration & Air Conditioning (RAC) Mechanic" },
  { num: 87, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in CCTV Installation & Security Systems Engineering", training: "Certificate in CCTV Installation & Security Systems Engineering" },
  { num: 88, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Solar Panel Installation, Operation & Maintenance", training: "Certificate in Solar Panel Installation, Operation & Maintenance" },
  { num: 89, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Automobile Engineering Technology (Two/Four Wheeler)", training: "Certificate in Automobile Engineering Technology" },
  { num: 90, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in CNC Machine Operation & Programming", training: "Certificate in CNC Machine Operation & Programming" },
  { num: 91, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Welding & Fabrication Technology (Arc/Gas/TIG/MIG)", training: "Certificate in Welding & Fabrication Technology" },
  { num: 92, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Plumbing & Sanitary Systems", training: "Certificate in Plumbing & Sanitary Systems" },
  { num: 93, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Electric Vehicle (EV) Powertrain & Repair Technology", training: "Certificate in Electric Vehicle (EV) Powertrain & Repair Technology" },
  { num: 94, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in PLC, SCADA & Industrial Automation", training: "Certificate in PLC, SCADA & Industrial Automation" },
  { num: 95, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Fire Safety & Disaster Management Engineering", training: "Certificate in Fire Safety & Disaster Management Engineering" },
  { num: 96, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Lift & Escalator Maintenance Mechanic", training: "Certificate in Lift & Escalator Maintenance Mechanic" },
  { num: 97, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Home Appliances Repair & Maintenance Technician", training: "Certificate in Home Appliances Repair & Maintenance Technician" },
  { num: 98, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Drone Pilot Training & Maintenance Engineering", training: "Certificate in Drone Pilot Training & Maintenance Engineering" },
  { num: 99, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Mechatronics & Robotics Technician", training: "Certificate in Mechatronics & Robotics Technician" },
  { num: 100, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in 3D Printing & Additive Manufacturing", training: "Certificate in 3D Printing & Additive Manufacturing" },
  { num: 101, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Heating, Ventilation, and Air Conditioning (HVAC) Systems", training: "Certificate in Heating, Ventilation, and Air Conditioning (HVAC) Systems" },
  { num: 102, sector: "Engineering Trades, Technical & Technicians Sector", diploma: "Diploma in Diesel Mechanic & Generator Maintenance", training: "Certificate in Diesel Mechanic & Generator Maintenance" },

  // 📊 8. Management, Vocational & Banking Skills Sector
  { num: 103, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Office Management & Secretarial Practice", training: "Certificate in Office Management & Secretarial Practice" },
  { num: 104, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Financial Accounting (Tally Prime, GST & E-Filing)", training: "Certificate in Financial Accounting (Tally Prime, GST & E-Filing)" },
  { num: 105, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Retail Management & Store Operations", training: "Certificate in Retail Management & Store Operations" },
  { num: 106, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Banking, Financial Services & Insurance (BFSI)", training: "Certificate in Banking, Financial Services & Insurance (BFSI)" },
  { num: 107, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Logistics & Supply Chain Management", training: "Certificate in Logistics & Supply Chain Management" },
  { num: 108, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Human Resource Management (HRM) Assistant", training: "Certificate in Human Resource Management (HRM) Assistant" },
  { num: 109, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Business Communication & Corporate Grooming", training: "Certificate in Business Communication & Corporate Grooming" },
  { num: 110, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Entrepreneurship & Small Business Development", training: "Certificate in Entrepreneurship & Small Business Development" },
  { num: 111, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Tourism & Hospitality Management", training: "Certificate in Tourism & Hospitality Management" },
  { num: 112, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Customer Relationship Management (CRM) & BPO Operations", training: "Certificate in Customer Relationship Management (CRM) & BPO Operations" },
  { num: 113, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Digital Literacy & E-Governance Services", training: "Certificate in Digital Literacy & E-Governance Services" },
  { num: 114, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Event Management & Public Relations", training: "Certificate in Event Management & Public Relations" },
  { num: 115, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Digital Banking & Fintech Operations", training: "Certificate in Digital Banking & Fintech Operations" },
  { num: 116, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Import-Export Documentation & Management", training: "Certificate in Import-Export Documentation & Management" },
  { num: 117, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Real Estate & Property Management", training: "Certificate in Real Estate & Property Management" },
  { num: 118, sector: "Management, Vocational & Banking Skills Sector", diploma: "Diploma in Warehouse Management & Inventory Control", training: "Certificate in Warehouse Management & Inventory Control" }
];

async function main() {
  try {
    console.log("Checking active registrations to avoid breaking FK constraints...");
    const activeRegs = await prisma.course_registrations.findMany({
      select: { course_id: true }
    });
    const regCourseIds = activeRegs.map(r => r.course_id);
    console.log(`Found ${regCourseIds.length} course registrations in database.`);

    console.log("Fetching existing course titles to bypass loop querying...");
    const existingCourses = await prisma.courses.findMany({
      select: { title: true }
    });
    const existingTitles = new Set(existingCourses.map(c => c.title));

    const coursesToInsert = [];

    for (const item of courseRawData) {
      // 1. Diploma Track (Track A)
      if (!existingTitles.has(item.diploma)) {
        coursesToInsert.push({
          title: item.diploma,
          description: `Comprehensive 1-year professional diploma program covering advanced concepts in ${item.sector.replace(" Sector", "")}. Specially designed under NSDC guidelines to equip students with industry-relevant skills, practical expertise, and career-oriented project assignments.`,
          duration: "1 Year",
          fees: 999.00,
          eligibility: "12th Pass or Equivalent",
          image_url: SECTOR_IMAGES[item.sector] || null,
          is_active: true
        });
      }

      // 2. Training Certificate Track (Track B)
      if (!existingTitles.has(item.training)) {
        coursesToInsert.push({
          title: item.training,
          description: `Professional 6-month short-term certificate training program focused on core practical skills and essential knowledge in ${item.sector.replace(" Sector", "")}. Highly suitable for quick career readiness and industry skill development.`,
          duration: "6 Months",
          fees: 699.00,
          eligibility: "10th Pass or Equivalent",
          image_url: SECTOR_IMAGES[item.sector] || null,
          is_active: true
        });
      }
    }

    console.log(`Prepared ${coursesToInsert.length} courses to insert...`);

    if (coursesToInsert.length > 0) {
      // Insert in a single fast transaction!
      const createRes = await prisma.courses.createMany({
        data: coursesToInsert,
        skipDuplicates: true
      });
      console.log(`Successfully batch inserted ${createRes.count} new courses into the database!`);
    } else {
      console.log("No new courses to insert.");
    }
  } catch (err) {
    console.error("Batch population failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
