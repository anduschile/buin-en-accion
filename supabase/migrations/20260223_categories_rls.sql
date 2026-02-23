-- ============================================================
-- Migration: Ensure public access to categories
-- ============================================================

ALTER TABLE buin_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view categories" ON buin_categories;

CREATE POLICY "Public can view categories"
  ON buin_categories FOR SELECT
  USING (true);
