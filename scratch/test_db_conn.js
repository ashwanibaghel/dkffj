const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres.tgszzjbvpcznndrfkkov:18DUiX0yhTcRaSW5@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require"
});

async function main() {
  try {
    await client.connect();
    console.log("SUCCESS");
    const res = await client.query('SELECT NOW()');
    console.log("Time:", res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("CONNECTION FAILED FULL ERROR:", err);
  }
}
main();
