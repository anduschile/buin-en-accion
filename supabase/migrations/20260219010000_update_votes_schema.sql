-- Rename user_id to created_by in natales_votes
do $$
begin
  if exists(select 1 from information_schema.columns where table_name='natales_votes' and column_name='user_id') then
    alter table natales_votes rename column user_id to created_by;
  elsif not exists(select 1 from information_schema.columns where table_name='natales_votes' and column_name='created_by') then
    -- if neither exists, create created_by
    alter table natales_votes add column created_by uuid references auth.users(id);
  end if;
end $$;

-- Drop trigger if repeats? No, just rename column is enough generally.
-- But if there are RLS policies using user_id, they need update.
-- Let's drop and recreate policies to be safe.

drop policy if exists "Enable insert for authenticated users" on natales_votes;
drop policy if exists "Enable read for all" on natales_votes;
drop policy if exists "Enable delete for users" on natales_votes;

create policy "Enable read for all" on natales_votes for select using (true);

create policy "Enable insert for authenticated users" on natales_votes for insert with check (auth.uid() = created_by);

create policy "Enable delete for users" on natales_votes for delete using (auth.uid() = created_by);
