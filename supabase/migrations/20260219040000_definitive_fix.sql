-- Definitive Migration: Ensure resolution columns exist and are consistent
-- This repeats the logic to guarantee the schema is correct even if previous migrations failed or were skipped.

-- 1. Add columns if they don't exist
ALTER TABLE public.natales_items
ADD COLUMN IF NOT EXISTS resolved_at timestamptz NULL,
ADD COLUMN IF NOT EXISTS resolution_note text NULL;

-- 2. Ensure they are writable by service role and potentially update RLS (though existing RLS should cover standard update if policy allows)

-- 3. Re-create the trigger to auto-set resolved_at
CREATE OR REPLACE FUNCTION public.handle_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        NEW.resolved_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_resolved_at ON public.natales_items;
CREATE TRIGGER set_resolved_at
BEFORE UPDATE ON public.natales_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_resolved_at();

-- 4. Grant generic permissions just in case owner/schema issues
GRANT ALL ON TABLE public.natales_items TO postgres;
GRANT ALL ON TABLE public.natales_items TO service_role;
