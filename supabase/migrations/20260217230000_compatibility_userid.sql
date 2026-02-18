
-- 1. Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'natales_items' AND column_name = 'user_id') THEN
        ALTER TABLE public.natales_items ADD COLUMN user_id uuid REFERENCES public.natales_profiles(id);
    END IF;
END $$;

-- 2. Backfill user_id from created_by
-- Using safe cast or ensuring created_by is valid uuid text
UPDATE public.natales_items
SET user_id = created_by::uuid
WHERE user_id IS NULL AND created_by IS NOT NULL;

-- 3. Update RLS Policy to allow insert if EITHER column matches auth.uid()
-- First drop existing policy if we can identify it, or just create a new inclusive one?
-- Better to replace the main INSERT policy. Assuming it's named "Enable insert for authenticated users only" or similar.
-- Let's create a specific one for natales_items to be safe.

DROP POLICY IF EXISTS "Insert custom natales_items" ON public.natales_items;

CREATE POLICY "Insert custom natales_items"
ON public.natales_items
FOR INSERT
TO authenticated
WITH CHECK (
  (created_by = auth.uid()::text) OR (user_id = auth.uid())
);

-- 4. Reload Schema Cache to avoid PGRST errors
NOTIFY pgrst, 'reload schema';
