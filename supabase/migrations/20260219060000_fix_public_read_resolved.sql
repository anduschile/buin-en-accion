-- Drop existing policy if it exists to avoid conflicts
drop policy if exists "natales_items_read_published" on public.natales_items;

-- Create new policy allowing public access to published and resolved items
create policy "natales_items_read_public_visible"
on public.natales_items
for select
to anon, authenticated
using (status in ('published', 'resolved'));
