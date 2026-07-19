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
    console.log("Connected to Supabase database. Applying storage policies...");

    // Create policies on storage.objects to allow insert/select by anon & authenticated
    const sql = `
      -- Photos bucket
      DROP POLICY IF EXISTS "membership_photo_upload" ON storage.objects;
      CREATE POLICY "membership_photo_upload"
        ON storage.objects FOR INSERT TO anon, authenticated
        WITH CHECK (bucket_id = 'photos');

      DROP POLICY IF EXISTS "membership_photo_read" ON storage.objects;
      CREATE POLICY "membership_photo_read"
        ON storage.objects FOR SELECT TO anon, authenticated
        USING (bucket_id = 'photos');

      -- Aadhaar bucket
      DROP POLICY IF EXISTS "membership_aadhaar_upload" ON storage.objects;
      CREATE POLICY "membership_aadhaar_upload"
        ON storage.objects FOR INSERT TO anon, authenticated
        WITH CHECK (bucket_id = 'aadhaar');

      DROP POLICY IF EXISTS "membership_aadhaar_read" ON storage.objects;
      CREATE POLICY "membership_aadhaar_read"
        ON storage.objects FOR SELECT TO anon, authenticated
        USING (bucket_id = 'aadhaar');

      -- Signatures bucket
      DROP POLICY IF EXISTS "membership_signature_upload" ON storage.objects;
      CREATE POLICY "membership_signature_upload"
        ON storage.objects FOR INSERT TO anon, authenticated
        WITH CHECK (bucket_id = 'signatures');

      DROP POLICY IF EXISTS "membership_signature_read" ON storage.objects;
      CREATE POLICY "membership_signature_read"
        ON storage.objects FOR SELECT TO anon, authenticated
        USING (bucket_id = 'signatures');
    `;

    await client.query(sql);
    console.log("Successfully created storage RLS upload policies!");
    await client.end();
  } catch (err) {
    console.error("Failed to apply policies:", err);
  }
}
main();
