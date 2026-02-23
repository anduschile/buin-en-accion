-- ============================================================
-- BUIN EN ACCIÓN — Migration: create_buin_report RPC
-- Security Definer function to allow anonymous report creation
-- and retrieval of code/private_token in a single call.
-- ============================================================

CREATE OR REPLACE FUNCTION create_buin_report(
  p_category_id   UUID,
  p_description   TEXT,
  p_lat           NUMERIC,
  p_lng           NUMERIC,
  p_address_text  TEXT DEFAULT NULL,
  p_contact_name  TEXT DEFAULT NULL,
  p_contact_phone TEXT DEFAULT NULL,
  p_contact_email TEXT DEFAULT NULL
)
RETURNS TABLE (
  id            UUID,
  code          TEXT,
  private_token TEXT,
  status        TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_report_id UUID;
BEGIN
  -- Insert the report
  -- Triggers will handle: code, private_token (enforce_buin_report_defaults)
  -- and status (enforce_buin_report_defaults sets it to 'pending')
  INSERT INTO buin_reports (
    category_id,
    description,
    lat,
    lng,
    address_text,
    contact_name,
    contact_phone,
    contact_email
  )
  VALUES (
    p_category_id,
    p_description,
    p_lat,
    p_lng,
    p_address_text,
    p_contact_name,
    p_contact_phone,
    p_contact_email
  )
  RETURNING buin_reports.id INTO v_report_id;

  -- Return the generated fields
  RETURN QUERY
  SELECT 
    r.id, 
    r.code, 
    r.private_token, 
    r.status
  FROM buin_reports r
  WHERE r.id = v_report_id;
END;
$$;

-- Grant execution to anon and authenticated roles
GRANT EXECUTE ON FUNCTION create_buin_report(UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_buin_report(UUID, TEXT, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT) TO authenticated;
