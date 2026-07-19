const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const searchToken = "MBR-1784132051433-25AW0";

    console.log("Searching for Payment record...");
    const payment = await prisma.payments.findFirst({
      where: { transaction_id: searchToken },
      include: {
        memberships: true
      }
    });

    if (payment) {
      console.log("Payment Record Found:", {
        id: payment.id,
        transaction_id: payment.transaction_id,
        status: payment.status,
        membership_id: payment.membership_id
      });

      if (payment.memberships) {
        console.log("Associated Membership:", {
          id: payment.memberships.id,
          ack_no: payment.memberships.ack_no,
          membership_no: payment.memberships.membership_no,
          full_name: payment.memberships.full_name,
          mobile: payment.memberships.mobile,
          email: payment.memberships.email,
          status: payment.memberships.status
        });
      }
    } else {
      console.log("No Payment record found matching that transaction_id.");
    }

    console.log("\nSearching memberships directly by ack_no or membership_no or id...");
    const membership = await prisma.memberships.findFirst({
      where: {
        OR: [
          { ack_no: searchToken },
          { membership_no: searchToken },
          { id: searchToken.includes("-") ? undefined : searchToken }
        ]
      }
    });

    if (membership) {
      console.log("Membership Record Found Directly:", {
        id: membership.id,
        ack_no: membership.ack_no,
        membership_no: membership.membership_no,
        full_name: membership.full_name,
        mobile: membership.mobile,
        email: membership.email,
        status: membership.status
      });
    } else {
      console.log("No membership record found directly with that number.");
    }

  } catch (error) {
    console.error("Error executing query:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
