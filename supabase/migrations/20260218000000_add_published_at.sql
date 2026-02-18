
-- Add published_at column to natales_items
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'natales_items' AND column_name = 'published_at') THEN
        ALTER TABLE public.natales_items ADD COLUMN published_at timestamptz DEFAULT NULL;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
