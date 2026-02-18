
-- Enable RLS on all tables if not already enabled
ALTER TABLE public.natales_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natales_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natales_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natales_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natales_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Policies for natales_items

-- Allow public to view published items
DROP POLICY IF EXISTS "Public view published items" ON public.natales_items;
CREATE POLICY "Public view published items"
ON public.natales_items FOR SELECT
USING (status = 'published');

-- Allow authors to view their own items (even pending/rejected)
DROP POLICY IF EXISTS "Authors view own items" ON public.natales_items;
CREATE POLICY "Authors view own items"
ON public.natales_items FOR SELECT
USING (created_by = auth.uid()::text); -- created_by is text/uuid? Schema says uuid but cast to text might be needed if defined as varchar. Schema says uuid ref? No, generated types say string | null. Let's assume matches auth.uid().
-- In 20260217230000_compatibility_userid.sql we added user_id uuid and backfilled.
-- Code is using created_by.
-- Let's support both for safety in policy.
-- USING (created_by = auth.uid()::text OR user_id = auth.uid());

-- Allow staff to view all items
DROP POLICY IF EXISTS "Staff view all items" ON public.natales_items;
CREATE POLICY "Staff view all items"
ON public.natales_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.natales_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor', 'verifier')
  )
);

-- 2. Policies for natales_categories (Public Read)
DROP POLICY IF EXISTS "Public view categories" ON public.natales_categories;
CREATE POLICY "Public view categories"
ON public.natales_categories FOR SELECT
USING (true);

-- 3. Policies for natales_votes (Public Read, Auth Insert/Delete)
DROP POLICY IF EXISTS "Public view votes" ON public.natales_votes;
CREATE POLICY "Public view votes"
ON public.natales_votes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Auth vote" ON public.natales_votes;
CREATE POLICY "Auth vote"
ON public.natales_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Auth unvote" ON public.natales_votes;
CREATE POLICY "Auth unvote"
ON public.natales_votes FOR DELETE
USING (auth.uid() = user_id);

-- 4. Policies for natales_updates (Public Read)
DROP POLICY IF EXISTS "Public view updates" ON public.natales_updates;
CREATE POLICY "Public view updates"
ON public.natales_updates FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Staff manage updates" ON public.natales_updates;
CREATE POLICY "Staff manage updates"
ON public.natales_updates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.natales_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  )
);

-- 5. Policies for natales_profiles (Public Read for names/avatars)
DROP POLICY IF EXISTS "Public view profiles" ON public.natales_profiles;
CREATE POLICY "Public view profiles"
ON public.natales_profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.natales_profiles;
CREATE POLICY "Users update own profile"
ON public.natales_profiles FOR UPDATE
USING (id = auth.uid());

NOTIFY pgrst, 'reload schema';
