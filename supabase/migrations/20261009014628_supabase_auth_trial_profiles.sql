-- Temporary Supabase auth trial: baseline profiles table (usernames) for the static-export approach.
-- This version is already applied on the live trial project; the file exists so a fresh project can be
-- rebuilt from the repo. Written to be idempotent.

create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    username text not null check (username ~ '^[A-Za-z0-9_]{3,24}$'),
    created_at timestamptz not null default now()
);

-- Usernames are unique case-insensitively.
create unique index if not exists profiles_username_lower_key on public.profiles (lower(username));

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
    for select to authenticated using ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
    for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Signup pre-check. Only reveals whether a username exists, never who owns it.
create or replace function public.username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select not exists (select 1 from public.profiles where lower(username) = lower(p_username));
$$;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;
