-- ============================================================
-- Supabase Storage RLS Fix for Certificates Bucket Uploads
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Allow anyone (anon + authenticated) to UPLOAD to 'certificates' bucket
DROP POLICY IF EXISTS "certificates_upload_policy" ON storage.objects;
CREATE POLICY "certificates_upload_policy"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'certificates');

-- 2. Allow anyone (anon + authenticated) to OVERWRITE/UPDATE files in 'certificates' bucket
DROP POLICY IF EXISTS "certificates_update_policy" ON storage.objects;
CREATE POLICY "certificates_update_policy"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'certificates')
  WITH CHECK (bucket_id = 'certificates');

-- 3. Allow anyone to READ from 'certificates' bucket (public read access)
DROP POLICY IF EXISTS "certificates_read_policy" ON storage.objects;
CREATE POLICY "certificates_read_policy"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'certificates');

-- Verify policies were created
SELECT policyname, tablename, cmd, roles
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;
