-- ============================================================
-- BUIN EN ACCIÓN — Migration: buin_reports + report_updates
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. Update buin_categories with route_hint + new required slugs
-- ============================================================

-- Add route_hint column if not exists
ALTER TABLE buin_categories
  ADD COLUMN IF NOT EXISTS route_hint TEXT,
  ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 99;

-- Upsert the 5 required categories for the new flow
INSERT INTO buin_categories (name, slug, icon, route_hint, display_order) VALUES
  ('Basura',              'basura',     '🗑️', 'Contactar Departamento de Aseo y Ornato Municipal. Fono: (2) 2814-0000.', 1),
  ('Alumbrado público',   'alumbrado',  '💡', 'Contactar Dirección de Operaciones (Alumbrado). Puede reportarse también en SEC.gob.cl.', 2),
  ('Limpieza / pasto',    'limpieza',   '🌿', 'Contactar Departamento de Aseo y Ornato para limpieza de bandejones y corte de pasto municipal.', 3),
  ('Veredas / calles',    'veredas',    '🛣️', 'Contactar SECPLAN o DIDECO para pavimentos y veredas. Para baches en vía pública: SERVIU Región Metropolitana.', 4),
  ('Seguridad',           'seguridad',  '🔒', '⚠️ Emergencias: llama al 133 (Carabineros), 131 (Ambulancia/SAMU) o 132 (Bomberos). Para situaciones no urgentes: Juzgado de Policía Local o unidad policial más cercana.', 5)
ON CONFLICT (slug) DO UPDATE SET
  route_hint = EXCLUDED.route_hint,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon,
  name = EXCLUDED.name;

-- ============================================================
-- 2. Code generator function (BUIN-2026-XXXXXX)
-- ============================================================

CREATE OR REPLACE FUNCTION generate_buin_code()
RETURNS TEXT AS $$
DECLARE
  ts_part TEXT;
  rand_part TEXT;
BEGIN
  ts_part := to_char(now(), 'YYMMDD');
  rand_part := upper(substring(md5(random()::text || clock_timestamp()::text) for 6));
  RETURN 'BUIN-' || ts_part || '-' || rand_part;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. buin_reports table
-- ============================================================

CREATE TABLE IF NOT EXISTS buin_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT UNIQUE NOT NULL DEFAULT generate_buin_code(),
  category_id     UUID REFERENCES buin_categories(id) ON DELETE SET NULL,
  title           TEXT,
  description     TEXT NOT NULL,
  lat             NUMERIC,
  lng             NUMERIC,
  address_text    TEXT,
  evidence_urls   JSONB DEFAULT '[]'::jsonb,
  contact_name    TEXT,
  contact_phone   TEXT,
  contact_email   TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','published','routed','in_progress','resolved','rejected')),
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_buin_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS buin_reports_updated_at ON buin_reports;
CREATE TRIGGER buin_reports_updated_at
  BEFORE UPDATE ON buin_reports
  FOR EACH ROW EXECUTE PROCEDURE update_buin_reports_updated_at();

-- Force status = 'pending' on insert (security)
CREATE OR REPLACE FUNCTION enforce_buin_report_pending()
RETURNS TRIGGER AS $$
BEGIN
  NEW.status := 'pending';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS buin_reports_force_pending ON buin_reports;
CREATE TRIGGER buin_reports_force_pending
  BEFORE INSERT ON buin_reports
  FOR EACH ROW EXECUTE PROCEDURE enforce_buin_report_pending();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_buin_reports_status ON buin_reports(status);
CREATE INDEX IF NOT EXISTS idx_buin_reports_code ON buin_reports(code);

-- ============================================================
-- 4. buin_report_updates table (status history)
-- ============================================================

CREATE TABLE IF NOT EXISTS buin_report_updates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id   UUID NOT NULL REFERENCES buin_reports(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status   TEXT NOT NULL,
  note        TEXT,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_buin_report_updates_report ON buin_report_updates(report_id);

-- ============================================================
-- 5. RLS — buin_reports
-- ============================================================

ALTER TABLE buin_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent re-run)
DROP POLICY IF EXISTS "Public can view published reports"    ON buin_reports;
DROP POLICY IF EXISTS "Anyone can insert a report"          ON buin_reports;
DROP POLICY IF EXISTS "Admin can view all reports"          ON buin_reports;
DROP POLICY IF EXISTS "Admin can update reports"            ON buin_reports;
DROP POLICY IF EXISTS "User can see own pending report"     ON buin_reports;

-- Public SELECT: only non-pending, non-rejected
CREATE POLICY "Public can view published reports"
  ON buin_reports FOR SELECT
  USING (status NOT IN ('pending', 'rejected'));

-- Users can see their own reports (even pending) if authenticated
CREATE POLICY "User can see own pending report"
  ON buin_reports FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Anyone (anon or auth) can insert — trigger forces status='pending'
CREATE POLICY "Anyone can insert a report"
  ON buin_reports FOR INSERT
  WITH CHECK (true);

-- Admin can read all
CREATE POLICY "Admin can view all reports"
  ON buin_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM buin_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'editor', 'verifier')
    )
  );

-- Admin can update
CREATE POLICY "Admin can update reports"
  ON buin_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM buin_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'editor', 'verifier')
    )
  );

-- ============================================================
-- 6. RLS — buin_report_updates
-- ============================================================

ALTER TABLE buin_report_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view report updates"  ON buin_report_updates;
DROP POLICY IF EXISTS "Admin can insert report updates" ON buin_report_updates;

-- Public can see updates of published reports
CREATE POLICY "Public can view report updates"
  ON buin_report_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM buin_reports r
      WHERE r.id = report_id
        AND r.status NOT IN ('pending', 'rejected')
    )
  );

-- Only admin/editor can insert updates
CREATE POLICY "Admin can insert report updates"
  ON buin_report_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM buin_profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'editor')
    )
  );

-- ============================================================
-- 7. Storage bucket (run separately in Supabase dashboard
--    OR via Supabase CLI if storage API is available)
-- ============================================================
-- NOTE: Storage bucket creation can't be done via SQL.
-- Create bucket named "buin_evidence" in the Supabase dashboard:
--   Storage → New Bucket → Name: buin_evidence → Public: true (or false for signed URLs)
-- Then add this storage policy in the dashboard:
--   Allow INSERT for all (anon + auth) with path starting with report_id/
