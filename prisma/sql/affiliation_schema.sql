-- Development SQL Artifact: Institute Affiliation Management System
-- Database Target: Localhost / Development Database ONLY
-- DO NOT execute against Production Supabase

-- Enums
CREATE TYPE affiliation_status AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'INSPECTION_PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
  'EXPIRED'
);

CREATE TYPE affiliation_document_type AS ENUM (
  'PASSPORT_PHOTO',
  'REGISTRATION_CERTIFICATE',
  'PAN',
  'ID_PROOF',
  'BUILDING_INSIDE',
  'BUILDING_OUTSIDE',
  'LAB',
  'OTHER'
);

CREATE TYPE affiliation_domain_type AS ENUM (
  'COMPUTER_IT',
  'SKILL',
  'NGO',
  'CRAFT',
  'SOCIAL_WORK',
  'OTHER'
);

CREATE TYPE affiliation_infra_type AS ENUM (
  'CLASSROOM',
  'LAB',
  'PROJECTOR',
  'FACULTY',
  'INTERNET'
);

-- Core Affiliations Table (Institute Lifecycle)
CREATE TABLE IF NOT EXISTS public.affiliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_no VARCHAR(100) UNIQUE NOT NULL, -- AFF-2026-000001
  affiliation_no VARCHAR(100) UNIQUE,          -- DKFFJ/F/2026/0001 (Approved only)
  verification_token VARCHAR(100) UNIQUE NOT NULL, -- Base62 URL-safe QR token (dkffj_aff_...)
  slug VARCHAR(255) UNIQUE,                    -- Future-proof public profile slug (abc-computer-academy-fatehpur)
  owner_user_id UUID REFERENCES public.users(id),
  organization_name VARCHAR(255) NOT NULL,
  organization_type VARCHAR(100) NOT NULL,
  organization_type_other VARCHAR(255),
  registration_number VARCHAR(100),
  pan_number VARCHAR(20),
  establishment_year VARCHAR(10) NOT NULL,
  address TEXT NOT NULL,
  state VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  website VARCHAR(255),
  student_capacity INTEGER,
  current_status affiliation_status DEFAULT 'SUBMITTED',
  has_duplicate_warning BOOLEAN DEFAULT FALSE,
  warning_details TEXT,
  inspection_required BOOLEAN DEFAULT FALSE,
  inspection_date TIMESTAMPTZ,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  internal_remarks TEXT, -- Admin only
  public_remarks TEXT,   -- Visible on tracking & emails
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Applicant / Representative Table
CREATE TABLE IF NOT EXISTS public.affiliation_applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliation_id UUID NOT NULL REFERENCES public.affiliations(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  whatsapp VARCHAR(15),
  email VARCHAR(255) NOT NULL,
  id_proof_type VARCHAR(50) NOT NULL,   -- Aadhaar | PAN | Voter ID | Passport
  id_proof_last_four VARCHAR(4) NOT NULL, -- Generic last 4 digits (e.g. "1234")
  authorized_signatory_name VARCHAR(255) NOT NULL, -- Typed full name
  declaration_accepted BOOLEAN DEFAULT TRUE,
  declaration_accepted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  declaration_ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Uploaded Private Documents Table
CREATE TABLE IF NOT EXISTS public.affiliation_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliation_id UUID NOT NULL REFERENCES public.affiliations(id) ON DELETE CASCADE,
  document_type affiliation_document_type NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_path VARCHAR(512) NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Training Domains Table
CREATE TABLE IF NOT EXISTS public.affiliation_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliation_id UUID NOT NULL REFERENCES public.affiliations(id) ON DELETE CASCADE,
  domain_type affiliation_domain_type NOT NULL,
  domain_other VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Infrastructure Capabilities Table
CREATE TABLE IF NOT EXISTS public.affiliation_infrastructure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliation_id UUID NOT NULL REFERENCES public.affiliations(id) ON DELETE CASCADE,
  infra_type affiliation_infra_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Indexes for performant lookup
CREATE INDEX IF NOT EXISTS idx_affiliations_app_no ON public.affiliations(application_no);
CREATE INDEX IF NOT EXISTS idx_affiliations_no ON public.affiliations(affiliation_no);
CREATE INDEX IF NOT EXISTS idx_affiliations_token ON public.affiliations(verification_token);
CREATE INDEX IF NOT EXISTS idx_affiliations_reg_no ON public.affiliations(registration_number);
CREATE INDEX IF NOT EXISTS idx_affiliations_pan ON public.affiliations(pan_number);
CREATE INDEX IF NOT EXISTS idx_affiliations_slug ON public.affiliations(slug);
CREATE INDEX IF NOT EXISTS idx_affiliations_org_dist ON public.affiliations(organization_name, district);
