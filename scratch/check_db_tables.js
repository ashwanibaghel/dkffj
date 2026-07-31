const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  console.log("=== CHECKING PRISMA DATABASE TABLES ===");

  const certs = await prisma.certificates.findMany();
  console.log(`Certificates: ${certs.length}`);
  if (certs.length > 0) console.log("Certificates sample:", certs[0]);

  const reg = await prisma.course_registrations.findMany();
  console.log(`Course Registrations: ${reg.length}`);
  if (reg.length > 0) console.log("Course Reg sample:", reg[0]);

  const pay = await prisma.payments.findMany();
  console.log(`Payments: ${pay.length}`);
  if (pay.length > 0) console.log("Payments sample:", pay[0]);

  const don = await prisma.donations.findMany();
  console.log(`Donations: ${don.length}`);
  if (don.length > 0) console.log("Donations sample:", don[0]);

  const comp = await prisma.complaints.findMany();
  console.log(`Complaints: ${comp.length}`);
  if (comp.length > 0) console.log("Complaints sample:", comp[0]);

  const app = await prisma.appreciation_applications.findMany();
  console.log(`Appreciations: ${app.length}`);
  if (app.length > 0) console.log("Appreciations sample:", app[0]);

  const mem = await prisma.memberships.findMany();
  console.log(`Memberships: ${mem.length}`);

  await prisma.$disconnect();
}

checkTables();
