const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Locating membership with ACK: ACK-2026-00006...");
    
    // Find the record
    const record = await prisma.memberships.findFirst({
      where: {
        ack_no: "ACK-2026-00006"
      }
    });

    if (!record) {
      console.error("No record found with ACK-2026-00006!");
      return;
    }

    console.log(`Found candidate: ${record.full_name} (Current Status: ${record.status})`);

    // Reset status to PENDING
    const updated = await prisma.memberships.update({
      where: { id: record.id },
      data: {
        status: "PENDING",
        membership_no: null,
        approved_at: null,
        approved_by: null
      }
    });

    console.log(`Success! Updated status back to: ${updated.status}. membership_no cleared.`);
  } catch (err) {
    console.error("Error executing reset script:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
