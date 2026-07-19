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
    console.log("Connected to database. Modifying photos bucket allowed_mime_types...");

    const sql = `
      -- Set allowed_mime_types to NULL for photos bucket to remove file type restrictions
      UPDATE storage.buckets 
      SET allowed_mime_types = NULL 
      WHERE id = 'photos';
    `;

    const res = await client.query(sql);
    console.log("Successfully removed MIME type restrictions from photos bucket!");
    await client.end();
  } catch (err) {
    console.error("Failed to remove MIME type restrictions:", err);
  }
}
main();
