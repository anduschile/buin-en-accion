-- ============================================================
-- BUIN EN ACCIÓN — Migration: Contact Editing via Token
-- Allows users to update contact info after submission.
-- ============================================================

-- 1. Enhance get_buin_report_by_token to include more contact fields
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
  contact_phone        TEXT,
  contact_email        TEXT,
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
    r.contact_name, r.contact_phone, r.contact_email,
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

-- 2. Create update_buin_report_contact_by_token RPC
CREATE OR REPLACE FUNCTION update_buin_report_contact_by_token(
  p_code TEXT,
  p_token TEXT,
  p_contact_name TEXT,
  p_contact_phone TEXT,
  p_contact_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE buin_reports
  SET 
    contact_name = p_contact_name,
    contact_phone = p_contact_phone,
    contact_email = p_contact_email,
    updated_at = NOW()
  WHERE code = p_code 
    AND private_token = p_token;

  RETURN FOUND;
END;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION update_buin_report_contact_by_token(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_buin_report_contact_by_token(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
