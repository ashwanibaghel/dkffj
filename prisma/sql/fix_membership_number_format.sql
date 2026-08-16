-- Run once in the production Supabase SQL editor before deployment.
-- It fixes existing malformed member IDs and updates the atomic generator.

BEGIN;

UPDATE public.memberships
SET membership_no = regexp_replace(
  membership_no,
  '^DKFFJ/M/([0-9]{4})/-?[0-9]{4}-([0-9]+)$',
  E'DKFFJ/M/\\1/\\2'
)
WHERE membership_no ~ '^DKFFJ/M/[0-9]{4}/-?[0-9]{4}-[0-9]+$';

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

  IF p_prefix ~ '^DKFFJ/M/[0-9]{4}/$' THEN
    v_formatted := p_prefix || LPAD(v_next_val::TEXT, 5, '0');
  ELSE
    v_formatted := p_prefix || '-' || v_year || '-' || LPAD(v_next_val::TEXT, 5, '0');
  END IF;

  RETURN v_formatted;
END;
$$ LANGUAGE plpgsql;

COMMIT;
