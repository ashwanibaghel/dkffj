const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres.tgszzjbvpcznndrfkkov:18DUiX0yhTcRaSW5@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require",
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  try {
    await client.connect();
    console.log("Connected to database. Checking approved memberships...");

    const res = await client.query(`
      SELECT id, ack_no, full_name, email, status, membership_no, approved_at, remarks
      FROM memberships
      WHERE status = 'APPROVED'
      ORDER BY approved_at DESC NULLS LAST, created_at DESC
      LIMIT 10
    `);

    console.log(`Found ${res.rows.length} approved memberships:`);
    res.rows.forEach(r => {
      console.log(` - ACK: ${r.ack_no} | Name: ${r.full_name} | Email: ${r.email} | Status: ${r.status} | MemberNo: ${r.membership_no} | Approved At: ${r.approved_at}`);
    });

    await client.end();
  } catch (err) {
    console.error("Error checking memberships:", err);
  }
}

main();
