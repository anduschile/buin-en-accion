-- Update RLS policy to allow public to view 'resolved' items as well
DROP POLICY IF EXISTS "Public view published items" ON public.natales_items;
CREATE POLICY "Public view published items"
ON public.natales_items FOR SELECT
USING (status IN ('published', 'resolved'));
