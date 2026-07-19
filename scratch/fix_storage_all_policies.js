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
    console.log("Connected to Supabase database. Applying storage ALL policies...");

    const sql = `
      -- 1. Photos Bucket Policies
      DROP POLICY IF EXISTS "membership_photo_upload" ON storage.objects;
      DROP POLICY IF EXISTS "membership_photo_read" ON storage.objects;
      DROP POLICY IF EXISTS "membership_photos_all" ON storage.objects;
      
      CREATE POLICY "membership_photos_all"
        ON storage.objects FOR ALL TO anon, authenticated
        USING (bucket_id = 'photos')
        WITH CHECK (bucket_id = 'photos');

      -- 2. Aadhaar Bucket Policies
      DROP POLICY IF EXISTS "membership_aadhaar_upload" ON storage.objects;
      DROP POLICY IF EXISTS "membership_aadhaar_read" ON storage.objects;
      DROP POLICY IF EXISTS "membership_aadhaar_all" ON storage.objects;

      CREATE POLICY "membership_aadhaar_all"
        ON storage.objects FOR ALL TO anon, authenticated
        USING (bucket_id = 'aadhaar')
        WITH CHECK (bucket_id = 'aadhaar');

      -- 3. Signatures Bucket Policies
      DROP POLICY IF EXISTS "membership_signature_upload" ON storage.objects;
      DROP POLICY IF EXISTS "membership_signature_read" ON storage.objects;
      DROP POLICY IF EXISTS "membership_signatures_all" ON storage.objects;

      CREATE POLICY "membership_signatures_all"
        ON storage.objects FOR ALL TO anon, authenticated
        USING (bucket_id = 'signatures')
        WITH CHECK (bucket_id = 'signatures');
    `;

    await client.query(sql);
    console.log("Successfully created storage ALL RLS policies (including UPDATE/DELETE)!");
    await client.end();
  } catch (err) {
    console.error("Failed to apply ALL storage policies:", err);
  }
}
main();
