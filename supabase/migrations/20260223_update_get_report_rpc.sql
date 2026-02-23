-- ============================================================
-- BUIN EN ACCIÓN — Migration: Update get_buin_report_by_token
-- Enhances the RPC to return category metadata for vouchers.
-- ============================================================

CREATE OR REPLACE FUNCTION get_buin_report_by_token(p_code TEXT, p_token TEXT)
RETURNS TABLE (
  id                   UUID,
  code                 TEXT,
  private_token        TEXT,
  category_id          UUID,
  description          TEXT,
  lat                  NUMERIC,
  lng                  NUMERIC,
  address_text         TEXT,
  evidence_urls        JSONB,
  contact_name         TEXT,
  status               TEXT,
  created_at           TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ,
  category_name        TEXT,
  category_slug        TEXT,
  category_route_hint  TEXT
)
LANGUAGE sql SECURITY DEFINER
STABLE
AS $$
  SELECT
    r.id, r.code, r.private_token, r.category_id, r.description,
    r.lat, r.lng, r.address_text, r.evidence_urls,
    r.contact_name,
    r.status, r.created_at, r.updated_at,
    c.name as category_name,
    c.slug as category_slug,
    c.route_hint as category_route_hint
  FROM buin_reports r
  LEFT JOIN buin_categories c ON r.category_id = c.id
  WHERE r.code = p_code
    AND r.private_token = p_token
  LIMIT 1;
$$;
