
-- 1. Ensure 'kind' column exists in natales_items
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'natales_items' AND column_name = 'kind') THEN
        ALTER TABLE public.natales_items ADD COLUMN kind text NOT NULL DEFAULT 'problem';
    END IF;
END $$;

-- 2. Add CHECK constraint for 'kind' to restrict values
ALTER TABLE public.natales_items DROP CONSTRAINT IF EXISTS natales_items_kind_check;
ALTER TABLE public.natales_items ADD CONSTRAINT natales_items_kind_check CHECK (kind IN ('problem', 'good'));

-- 3. Ensure 'natales_evidence' bucket exists (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('natales_evidence', 'natales_evidence', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. Storage Policies for 'natales_evidence'
-- Drop generic or old policies to ensure clean state
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Select natales_evidence" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert natales_evidence" ON storage.objects;

-- Allow Public SELECT (Read) for this specific bucket
CREATE POLICY "Public Select natales_evidence"
ON storage.objects FOR SELECT
USING ( bucket_id = 'natales_evidence' );

-- Allow Authenticated INSERT (Upload) for this specific bucket
CREATE POLICY "Authenticated Insert natales_evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'natales_evidence' );

-- NOTE: No DELETE/UPDATE policies added as per "NO abrir permisos a otros buckets" and minimal scope.
