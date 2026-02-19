-- RLS Fixes for Natales in Action

-- 1. Drop existing conflicting reading policies if any (to be safe/clean)
DROP POLICY IF EXISTS "Public view published items" ON public.natales_items;
-- (Add other potential names if they exist from previous migrations, though "Public view published items" is the main one we touched)

-- 2. Allow PUBLIC to read 'published' AND 'resolved' items
CREATE POLICY "natales_items_read_published_or_resolved"
ON public.natales_items FOR SELECT
USING (status IN ('published', 'resolved'));

-- 3. Allow STAFF (admin, editor, verifier) to read ALL items (including pending/rejected)
CREATE POLICY "natales_items_read_staff"
ON public.natales_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.natales_profiles p 
    WHERE p.id = auth.uid() 
    AND p.role IN ('admin', 'editor', 'verifier')
  )
);

-- 4. Allow AUTHORS to view their OWN items (even if pending/rejected)
CREATE POLICY "natales_items_read_own"
ON public.natales_items FOR SELECT
USING (created_by = auth.uid());
