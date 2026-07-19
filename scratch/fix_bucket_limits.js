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
    console.log("Connected to Supabase database. Setting bucket limits...");

    // Update file size limits for storage buckets:
    // aadhaar -> 50MB (52428800 bytes)
    // photos -> 15MB (15728640 bytes)
    // signatures -> 5MB (5242880 bytes)
    const sql = `
      UPDATE storage.buckets SET file_size_limit = 52428800 WHERE id = 'aadhaar';
      UPDATE storage.buckets SET file_size_limit = 15728640 WHERE id = 'photos';
      UPDATE storage.buckets SET file_size_limit = 5242880 WHERE id = 'signatures';
    `;

    await client.query(sql);
    console.log("Successfully set storage limits: Aadhaar = 50MB, Photos = 15MB, Signatures = 5MB");
    
    // Read again to verify
    const verifyRes = await client.query('SELECT id, name, file_size_limit FROM storage.buckets');
    console.log("Updated Buckets:", verifyRes.rows);

    await client.end();
  } catch (err) {
    console.error("Error setting limits:", err);
  }
}
main();
