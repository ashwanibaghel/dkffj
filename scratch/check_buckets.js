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
    console.log("Connected to database. Fetching storage.buckets details...");

    const res = await client.query(`
      SELECT id, name, allowed_mime_types, file_size_limit 
      FROM storage.buckets
    `);

    res.rows.forEach(r => {
      console.log(`Bucket ID: ${r.id}`);
      console.log(` - Name: ${r.name}`);
      console.log(` - Allowed MIME Types: ${r.allowed_mime_types}`);
      console.log(` - File Size Limit: ${r.file_size_limit} bytes`);
      console.log("----------------------------------------");
    });

    await client.end();
  } catch (err) {
    console.error("Error checking buckets:", err);
  }
}

main();
