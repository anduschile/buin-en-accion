
-- Add kind column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'natales_items' AND column_name = 'kind') THEN
        ALTER TABLE public.natales_items ADD COLUMN kind text NOT NULL DEFAULT 'problem';
    END IF;
END $$;

-- Add CHECK constraint for kind
ALTER TABLE public.natales_items DROP CONSTRAINT IF EXISTS natales_items_kind_check;
ALTER TABLE public.natales_items ADD CONSTRAINT natales_items_kind_check CHECK (kind IN ('problem', 'good'));

-- Ensure bucket exists (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('natales_evidence', 'natales_evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts/duplication
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Select natales_evidence" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert natales_evidence" ON storage.objects;

-- Create granular policies for natales_evidence bucket
CREATE POLICY "Public Select natales_evidence"
ON storage.objects FOR SELECT
USING ( bucket_id = 'natales_evidence' );

CREATE POLICY "Authenticated Insert natales_evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'natales_evidence' );
