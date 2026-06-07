-- Initialize Supabase Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('photos', 'photos', true, 2097152, ARRAY['image/jpeg', 'image/png']),
  ('aadhaar', 'aadhaar', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('signatures', 'signatures', false, 1048576, ARRAY['image/jpeg', 'image/png']),
  ('complaints', 'complaints', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('certificates', 'certificates', true, 3145728, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;
