-- 1. Custom Enums
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');
CREATE TYPE membership_status AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
CREATE TYPE complaint_status AS ENUM ('SUBMITTED', 'UNDER_INVESTIGATION', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE enrollment_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');
CREATE TYPE certificate_status AS ENUM ('VALID', 'REVOKED');
CREATE TYPE notification_type AS ENUM ('EMAIL', 'SMS', 'WHATSAPP');

-- 2. Public Users profile (Synced with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role DEFAULT 'USER'::user_role NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to sync auth.users with public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    new.id,
    new.email,
    'USER'::user_role,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. NGO Memberships Table
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_no VARCHAR(100) UNIQUE,
  ack_no VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  father_name VARCHAR(255) NOT NULL,
  gender VARCHAR(50) NOT NULL,
  dob DATE NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  whatsapp VARCHAR(15) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  district VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  education VARCHAR(255) NOT NULL,
  profession VARCHAR(255) NOT NULL,
  working_area VARCHAR(255) NOT NULL,
  designation VARCHAR(255) NOT NULL,
  photo_url TEXT NOT NULL,
  aadhaar_url TEXT NOT NULL,
  signature_url TEXT NOT NULL,
  status membership_status DEFAULT 'PENDING'::membership_status NOT NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Public Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_no VARCHAR(100) UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  father_name VARCHAR(255) NOT NULL,
  gender VARCHAR(50) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  police_station VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  status complaint_status DEFAULT 'SUBMITTED'::complaint_status NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Complaint Attachments Table
CREATE TABLE IF NOT EXISTS public.complaint_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  duration VARCHAR(50) NOT NULL,
  fees DECIMAL(10, 2) NOT NULL,
  eligibility VARCHAR(255) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Course Registrations Table
CREATE TABLE IF NOT EXISTS public.course_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_no VARCHAR(100) UNIQUE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE RESTRICT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  email VARCHAR(255) NOT NULL,
  status enrollment_status DEFAULT 'PENDING'::enrollment_status NOT NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Payments Tracking Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10, 2) NOT NULL,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  gateway VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  membership_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
  registration_id UUID REFERENCES public.course_registrations(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. OTP System Requests Table
CREATE TABLE IF NOT EXISTS public.otp_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile VARCHAR(15) NOT NULL,
  email VARCHAR(255),
  otp_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Certificates Table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_no VARCHAR(100) UNIQUE NOT NULL,
  registration_id UUID REFERENCES public.course_registrations(id) ON DELETE CASCADE NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status certificate_status DEFAULT 'VALID'::certificate_status NOT NULL,
  pdf_url TEXT NOT NULL,
  qr_code_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Reusable Status Timeline / Logs Table
CREATE TABLE IF NOT EXISTS public.status_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE,
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES public.course_registrations(id) ON DELETE CASCADE,
  from_status VARCHAR(50) NOT NULL,
  to_status VARCHAR(50) NOT NULL,
  remarks TEXT,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Reusable Notification Logs Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  type notification_type NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  success BOOLEAN DEFAULT TRUE NOT NULL
);

-- 13. Document Downloads Vault Table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_size VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. News / Blogs Table
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category VARCHAR(100),
  is_published BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Homepage CMS / Content Settings Table
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  content JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Notification Email Templates Table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Prefix Counter Table for sequence generation
CREATE TABLE IF NOT EXISTS public.prefixes_counter (
  key VARCHAR(50) PRIMARY KEY,
  year INT NOT NULL,
  last_value INT NOT NULL DEFAULT 0
);

-- Stored procedure to atomically get the next registration number (concurrency safe)
CREATE OR REPLACE FUNCTION public.generate_next_number(p_key VARCHAR(50), p_prefix VARCHAR(50))
RETURNS VARCHAR(100) AS $$
DECLARE
  v_year INT;
  v_next_val INT;
  v_formatted VARCHAR(100);
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
  
  -- Acquire exclusive row lock to block concurrent requests
  INSERT INTO public.prefixes_counter (key, year, last_value)
  VALUES (p_key, v_year, 1)
  ON CONFLICT (key) DO UPDATE
  SET last_value = CASE WHEN prefixes_counter.year = v_year THEN prefixes_counter.last_value + 1 ELSE 1 END,
      year = v_year
  RETURNING last_value INTO v_next_val;

  -- Formats as PREFIX-YYYY-0000X (zero-padded to 5 digits)
  v_formatted := p_prefix || '-' || v_year || '-' || LPAD(v_next_val::TEXT, 5, '0');
  RETURN v_formatted;
END;
$$ LANGUAGE plpgsql;

-- Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_memberships_no ON public.memberships(membership_no);
CREATE INDEX IF NOT EXISTS idx_memberships_ack ON public.memberships(ack_no);
CREATE INDEX IF NOT EXISTS idx_complaints_no ON public.complaints(complaint_no);
CREATE INDEX IF NOT EXISTS idx_registrations_no ON public.course_registrations(enrollment_no);
CREATE INDEX IF NOT EXISTS idx_certificates_no ON public.certificates(certificate_no);
