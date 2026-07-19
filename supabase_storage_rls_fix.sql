-- ============================================================
-- Supabase Storage RLS Fix for Membership Document Uploads
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Allow anyone (anon + authenticated) to UPLOAD to 'photos' bucket
-- (photos are public — profile pics etc)
DROP POLICY IF EXISTS "membership_photo_upload" ON storage.objects;
CREATE POLICY "membership_photo_upload"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'photos');

-- Allow anyone to READ from photos bucket (public bucket)
DROP POLICY IF EXISTS "membership_photo_read" ON storage.objects;
CREATE POLICY "membership_photo_read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'photos');

-- 2. Allow anyone to UPLOAD to 'aadhaar' bucket (private, only path stored)
DROP POLICY IF EXISTS "membership_aadhaar_upload" ON storage.objects;
CREATE POLICY "membership_aadhaar_upload"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'aadhaar');

-- 3. Allow anyone to UPLOAD to 'signatures' bucket
DROP POLICY IF EXISTS "membership_signature_upload" ON storage.objects;
CREATE POLICY "membership_signature_upload"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'signatures');

-- Verify policies were created
SELECT policyname, tablename, cmd, roles
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;
