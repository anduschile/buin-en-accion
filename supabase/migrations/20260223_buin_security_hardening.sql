-- ============================================================
-- BUIN EN ACCIÓN — Migration: Security Hardening
-- Adds private_token for private tracking of pending/rejected reports
-- Run this in Supabase SQL Editor AFTER 20260222_buin_reports.sql
-- ============================================================

-- Requires pgcrypto for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. private_token column on buin_reports
-- ============================================================

ALTER TABLE buin_reports
  ADD COLUMN IF NOT EXISTS private_token TEXT UNIQUE;

-- Generator function: 48-char lowercase hex (24 random bytes)
CREATE OR REPLACE FUNCTION generate_buin_private_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(24), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fill any existing rows that are missing a token
UPDATE buin_reports
SET private_token = generate_buin_private_token()
WHERE private_token IS NULL;

-- Set column as NOT NULL and give it a default
ALTER TABLE buin_reports
  ALTER COLUMN private_token SET NOT NULL,
  ALTER COLUMN private_token SET DEFAULT generate_buin_private_token();

-- Index for fast lookup by token
CREATE INDEX IF NOT EXISTS idx_buin_reports_private_token
  ON buin_reports(private_token);

-- ============================================================
-- 2. Trigger: always set token on INSERT (even if client sends null)
-- ============================================================

CREATE OR REPLACE FUNCTION set_buin_private_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Always regenerate to prevent guessing
  NEW.private_token := generate_buin_private_token();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS buin_reports_set_private_token ON buin_reports;
CREATE TRIGGER buin_reports_set_private_token
  BEFORE INSERT ON buin_reports
  FOR EACH ROW EXECUTE PROCEDURE set_buin_private_token();

-- ============================================================
-- 3. SECURITY DEFINER RPC: fetch report by code + token
--    Bypasses RLS — only returns row if BOTH code AND token match.
--    This is the ONLY way to read pending/rejected without admin role.
-- ============================================================

CREATE OR REPLACE FUNCTION get_buin_report_by_token(p_code TEXT, p_token TEXT)
RETURNS TABLE (
  id UUID,
  code TEXT,
  private_token TEXT,
  category_id UUID,
  description TEXT,
  lat NUMERIC,
  lng NUMERIC,
  address_text TEXT,
  evidence_urls JSONB,
  contact_name TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql SECURITY DEFINER
STABLE
AS $$
  SELECT
    id, code, private_token, category_id, description,
    lat, lng, address_text, evidence_urls,
    contact_name, -- safe to return to owner
    status, created_at, updated_at
  FROM buin_reports
  WHERE code = p_code
    AND private_token = p_token
  LIMIT 1;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION get_buin_report_by_token(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_buin_report_by_token(TEXT, TEXT) TO authenticated;

-- ============================================================
-- 4. Ensure existing enforce_pending trigger also runs FIRST
--    (ordering: set_private_token runs first, then enforce_pending)
--    Both are BEFORE INSERT triggers - Postgres runs them alphabetically
--    buin_reports_force_pending > buin_reports_set_private_token
--    Rename to control order if needed (or merge):
-- ============================================================

-- Merge into single trigger function that sets BOTH token and status
CREATE OR REPLACE FUNCTION enforce_buin_report_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Force pending status (security: prevents status injection)
  NEW.status := 'pending';
  -- Always generate a fresh private token
  NEW.private_token := generate_buin_private_token();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace the two separate triggers with one
DROP TRIGGER IF EXISTS buin_reports_force_pending ON buin_reports;
DROP TRIGGER IF EXISTS buin_reports_set_private_token ON buin_reports;

CREATE TRIGGER buin_reports_enforce_defaults
  BEFORE INSERT ON buin_reports
  FOR EACH ROW EXECUTE PROCEDURE enforce_buin_report_defaults();

-- ============================================================
-- 5. Storage: buin_evidence bucket should be PRIVATE
-- ============================================================
-- Recommended: In Supabase Dashboard → Storage → buin_evidence → Settings → Uncheck "Public bucket"
-- Then: Remove the "Anon can upload evidence" policy (added in previous walkthrough).
-- Evidence is uploaded via Server Action (authenticated supabase client with service role).
-- For viewing evidence in public reports, the Server Action generates signed URLs.
-- For private reports (pending), evidence is visible only when token is presented.
--
-- Storage policies to set (in Dashboard or via CLI):
--   REMOVE: "Allow anyone to upload" INSERT policy
--   DO NOT add any anon policies.
--   The service role (used by Server Actions) bypasses RLS by nature.
