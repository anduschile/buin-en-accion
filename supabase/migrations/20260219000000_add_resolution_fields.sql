-- Add resolution fields to natales_items
alter table public.natales_items
  add column if not exists resolved_at timestamptz,
  add column if not exists resolution_note text;

-- Ensure status check constraint includes 'resolved' if not already present
-- (This depends on how the table was created, but usually safe to just ensure the column can hold it if it's text)
-- If there is a check constraint, we might need to drop and recreate it, but standard text columns are fine.
-- Assuming status is just text or an enum. If it's a check constraint:
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'natales_items_status_check') then
    alter table public.natales_items add constraint natales_items_status_check check (status in ('pending', 'published', 'rejected', 'resolved'));
  else
    -- Update constraint if it exists and doesn't have resolved (simplified approach: drop and re-add)
    alter table public.natales_items drop constraint natales_items_status_check;
    alter table public.natales_items add constraint natales_items_status_check check (status in ('pending', 'published', 'rejected', 'resolved'));
  end if;
end $$;
