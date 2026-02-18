
-- Migration: Seed Categories
-- Description: Populates the categories table with default values.
-- Includes RLS policy to ensure public read access.

-- 1. Enable RLS and Create Policy
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'categories' 
        AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON public.categories
        FOR SELECT
        USING (true);
    END IF;
END
$$;

-- 2. Insert Categories (Idempotent)
INSERT INTO public.categories (name, slug, icon)
VALUES 
    ('Basura y limpieza', 'basura-limpieza', 'trash-2'),
    ('Áreas verdes', 'areas-verdes', 'trees'),
    ('Alumbrado público', 'alumbrado-publico', 'lightbulb'),
    ('Calles y baches', 'calles-baches', 'car'),
    ('Veredas y accesibilidad', 'veredas-accesibilidad', 'footprints'),
    ('Señalética y tránsito', 'senaletica-transito', 'signpost'),
    ('Seguridad', 'seguridad', 'shield'),
    ('Animales', 'animales', 'paw-print'),
    ('Infraestructura pública', 'infraestructura-publica', 'building'),
    ('Otros', 'otros', 'circle')
ON CONFLICT (slug) DO NOTHING;
