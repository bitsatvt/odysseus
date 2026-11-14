-- Temporary Supabase auth trial: remove the username -> email lookup.
-- It was SECURITY DEFINER and executable by anon, so anyone could read any user's email from
-- their username. Username login now goes through the `login` Edge Function (service role).

drop function if exists public.get_email_by_username(text);
