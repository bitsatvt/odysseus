-- Temporary Supabase auth trial: create the profiles row server-side when an auth user is created,
-- from the username passed in signUp({ options: { data: { username } } }).
-- Replaces the old client-side ensureProfile() insert, so clients no longer need INSERT on profiles.
-- A taken/invalid username aborts the auth.users insert, so signup fails atomically
-- (supabase-js surfaces this as "Database error saving new user").

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_username text := new.raw_user_meta_data ->> 'username';
begin
    if v_username is null or v_username !~ '^[A-Za-z0-9_]{3,24}$' then
        raise exception 'invalid username';
    end if;
    insert into public.profiles (id, username) values (new.id, v_username);
    return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Backfill users who signed up under the old flow but never signed in (so ensureProfile never ran).
insert into public.profiles (id, username)
select distinct on (lower(u.raw_user_meta_data ->> 'username')) u.id, u.raw_user_meta_data ->> 'username'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
  and (u.raw_user_meta_data ->> 'username') ~ '^[A-Za-z0-9_]{3,24}$'
  and not exists (
      select 1 from public.profiles p
      where lower(p.username) = lower(u.raw_user_meta_data ->> 'username')
  )
order by lower(u.raw_user_meta_data ->> 'username'), u.created_at;

-- Profiles are now only created by the trigger.
drop policy if exists profiles_insert_own on public.profiles;
