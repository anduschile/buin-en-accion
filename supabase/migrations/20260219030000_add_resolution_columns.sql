-- Add resolution columns to natales_items if they don't exist
ALTER TABLE public.natales_items
ADD COLUMN IF NOT EXISTS resolved_at timestamptz NULL,
ADD COLUMN IF NOT EXISTS resolution_note text NULL;

-- Function to automatically set resolved_at when status changes to 'resolved'
CREATE OR REPLACE FUNCTION public.handle_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        NEW.resolved_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS set_resolved_at ON public.natales_items;
CREATE TRIGGER set_resolved_at
BEFORE UPDATE ON public.natales_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_resolved_at();
