-- Fix RLS: add WITH CHECK for INSERT so anon key can create own profile row
-- The original "for all using" only covers SELECT/UPDATE/DELETE, not INSERT.

drop policy if exists "own profile" on public.profiles;
create policy "own profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
