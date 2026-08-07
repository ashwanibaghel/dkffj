-- ==============================================================================
-- STAGED MIGRATION — DO NOT EXECUTE ON PRODUCTION UNTIL LOCAL TESTING IS APPROVED
-- ==============================================================================

-- 1. Extend payments table for affiliation & refund support
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS affiliation_id UUID REFERENCES affiliations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS receipt_no TEXT,
  ADD COLUMN IF NOT EXISTS refund_id TEXT,
  ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS failure_reason TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refund_initiated_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Extend affiliations table for renewal, draft, certificate versioning
ALTER TABLE affiliations
  ADD COLUMN IF NOT EXISTS draft_no TEXT,
  ADD COLUMN IF NOT EXISTS certificate_version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS renewal_due_on TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS renewal_notice_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS expired_at TIMESTAMPTZ;

-- 3. Create table for Webhook Replay Protection
CREATE TABLE IF NOT EXISTS processed_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create table for Email Attempt Audit Logging
CREATE TABLE IF NOT EXISTS email_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliation_id UUID REFERENCES affiliations(id) ON DELETE CASCADE,
  attempt_no INTEGER NOT NULL,
  email_type TEXT NOT NULL, -- "RECEIPT" | "APPROVAL" | "REJECTION" | "REFUND"
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  error TEXT
);
