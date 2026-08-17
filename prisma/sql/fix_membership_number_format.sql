-- Run once in the production Supabase SQL editor before deployment.
-- It fixes existing malformed member IDs and updates the atomic generator.

BEGIN;

ALTER TABLE public.course_registrations
  ADD COLUMN IF NOT EXISTS draft_enrollment_no VARCHAR(100);

UPDATE storage.buckets
SET file_size_limit = 5242880
WHERE id = 'photos';

CREATE UNIQUE INDEX IF NOT EXISTS idx_course_registrations_draft_no
  ON public.course_registrations (draft_enrollment_no)
  WHERE draft_enrollment_no IS NOT NULL;

UPDATE public.course_registrations
SET draft_enrollment_no = enrollment_no
WHERE draft_enrollment_no IS NULL
  AND enrollment_no ~ '^DKFFJ/C/DRAFT/';

UPDATE public.memberships
SET membership_no = regexp_replace(
  membership_no,
  '^DKFFJ/M/([0-9]{4})/-?[0-9]{4}-([0-9]+)$',
  E'DKFFJ/M/\\1/\\2'
)
WHERE membership_no ~ '^DKFFJ/M/[0-9]{4}/-?[0-9]{4}-[0-9]+$';

UPDATE public.course_registrations
SET enrollment_no = regexp_replace(
  enrollment_no,
  '^DKFFJ/C/([0-9]{4})/-?[0-9]{4}-([0-9]+)$',
  E'DKFFJ/C/\\1/\\2'
)
WHERE enrollment_no ~ '^DKFFJ/C/[0-9]{4}/-?[0-9]{4}-[0-9]+$';

UPDATE public.certificates
SET certificate_no = regexp_replace(
  certificate_no,
  '^DKFFJ/C/([0-9]{4})/-?[0-9]{4}-([0-9]+)$',
  E'DKFFJ/C/\\1/\\2'
)
WHERE certificate_no ~ '^DKFFJ/C/[0-9]{4}/-?[0-9]{4}-[0-9]+$';

CREATE OR REPLACE FUNCTION public.generate_next_number(p_key VARCHAR(50), p_prefix VARCHAR(50))
RETURNS VARCHAR(100) AS $$
DECLARE
  v_year INT;
  v_next_val INT;
  v_formatted VARCHAR(100);
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::INT;

  INSERT INTO public.prefixes_counter (key, year, last_value)
  VALUES (p_key, v_year, 1)
  ON CONFLICT (key) DO UPDATE
  SET last_value = CASE WHEN prefixes_counter.year = v_year THEN prefixes_counter.last_value + 1 ELSE 1 END,
      year = v_year
  RETURNING last_value INTO v_next_val;

  IF p_prefix ~ '^DKFFJ/(M|C)/[0-9]{4}/$' OR p_prefix ~ '^DKFFJ/C/DRAFT/[0-9]{4}/$' THEN
    v_formatted := p_prefix || LPAD(v_next_val::TEXT, 5, '0');
  ELSE
    v_formatted := p_prefix || '-' || v_year || '-' || LPAD(v_next_val::TEXT, 5, '0');
  END IF;

  RETURN v_formatted;
END;
$$ LANGUAGE plpgsql;

COMMIT;
