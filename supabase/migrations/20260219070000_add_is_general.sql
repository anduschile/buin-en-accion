-- Add is_general column to natales_items table
alter table natales_items 
add column if not exists is_general boolean not null default false;

-- Add index for performance on filtering general/map items
create index if not exists idx_natales_items_is_general on natales_items(is_general);
