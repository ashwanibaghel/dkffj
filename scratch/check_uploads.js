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
    console.log("Connected to database. Fetching files in storage.objects for photos bucket...");

    const res = await client.query(`
      SELECT name, bucket_id, created_at, (metadata->>'size')::int as size 
      FROM storage.objects 
      WHERE bucket_id = 'photos' AND (name LIKE 'certificates/%' OR name LIKE 'id_cards/%')
      ORDER BY created_at DESC
      LIMIT 20
    `);

    console.log(`Found ${res.rows.length} files:`);
    res.rows.forEach(r => {
      console.log(` - Path: ${r.name} | Created: ${r.created_at} | Size: ${r.size} bytes`);
    });

    await client.end();
  } catch (err) {
    console.error("Error checking uploads:", err);
  }
}

main();
