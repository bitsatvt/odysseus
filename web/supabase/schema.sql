-- TEMPORARY TRIAL: Supabase email-code auth prototype (branch supabase-auth-trial).
-- Long-term auth is being built with Better Auth. Do not build on this.
-- Paste this whole file into the Supabase dashboard SQL editor and run it once.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_]{3,24}$'),
  created_at timestamptz not null default now()
);

-- Usernames are unique case-insensitively.
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Resolves a username to its email so /login can call signInWithPassword.
-- Runs as the table owner to read auth.users; returns null when not found.
create or replace function public.get_email_by_username(p_username text)
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select u.email::text
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(p.username) = lower(p_username)
  limit 1;
$$;

revoke all on function public.get_email_by_username(text) from public;
grant execute on function public.get_email_by_username(text) to anon, authenticated;
