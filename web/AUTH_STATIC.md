# Supabase Auth on the Static Site (trial)

Temporary Supabase auth trial, branch `kp-supabase-auth-static`. One of two candidate approaches; the
other runs Next.js as a Node server. This one keeps `output: "export"`, so the site still deploys as
plain static files.

## Architecture

```
Browser (static Next.js pages)
  ├─ supabase-js ── Supabase Auth      signup, email confirm, reset password, session refresh
  ├─ supabase-js ── Supabase Postgres  public.profiles (username), protected by RLS
  └─ fetch ──────── Edge Function `login`  username -> email lookup with service role, then sign-in
Prisma Postgres   course/instructor data only, read at build time. Holds no user data.
```

- Sessions live in the browser (localStorage, managed by supabase-js). There is no app server.
- A trigger on `auth.users` creates the `profiles` row from the username given at signup, and
  rejects the signup if the username is taken. Clients cannot insert profiles themselves.
- Username login goes through the `login` Edge Function. The browser never sees anyone's email.
  The old `get_email_by_username` RPC, which let anyone read any user's email, is dropped.

## What works

| Page | Flow |
|---|---|
| `/signup` | Email, username, password. Checks the username, sends a confirmation email |
| `/auth/confirm` | Landing page for the confirmation link. Signs the user in |
| `/login` | Username **or** email plus password, through the Edge Function |
| `/forgot-password` | Sends a reset email (email only, so usernames are not revealed) |
| `/reset-password` | Landing page for the reset link. Sets a new password |
| Header | Shows the username and a Sign out button, or Log in / Sign up |

## Setup

1. **Env** (`web/.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. **Migrations**: `supabase link --project-ref <ref>`, then `supabase db push`. The files in
   `supabase/migrations/` are the baseline profiles table, the signup trigger, and the drop of
   `get_email_by_username`.
3. **Edge Function**: `supabase functions deploy login`. `supabase/config.toml` sets
   `verify_jwt = false`, because callers have no session yet. `SUPABASE_URL`, `SUPABASE_ANON_KEY`
   and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.
4. **Dashboard, Authentication → URL Configuration**: set the Site URL to the production origin.
   Add `<origin>/auth/confirm` and `<origin>/reset-password` to Redirect URLs, plus the
   `http://localhost:3000/...` equivalents for development.
5. **Dashboard, Authentication → Emails → SMTP**: configure custom SMTP (for example Resend,
   SES or Postmark). The built-in sender is limited to a few emails per hour and only delivers to
   team members, so it is not usable in production.
6. Turn on "Confirm email" (Auth → Providers → Email). Optionally turn on leaked-password protection.

## Tradeoffs and limitations

- **User data lives in Supabase, not Prisma.** With no server, the browser cannot safely write to
  our Postgres. Any per-user feature (saved courses, plans) must be a Supabase table with RLS,
  or it needs a server or Edge Function. This is the main cost of staying static.
- **No server-side auth checks.** Every page is pre-rendered and public. Protection works only
  through RLS on Supabase data. We cannot gate pages or render per-user HTML.
- **Tokens in localStorage.** This is the standard approach for a single-page app, but XSS could
  read them. httpOnly cookies would need a server.
- Login error text is uniform, but response timing is not. Signup's `username_available` also
  tells anyone whether a username exists, though never who owns it. This is by design.
- The Edge Function has no rate limiting of its own. Supabase Auth rate limits still apply to
  the sign-in it performs.
- The confirmation and reset links use supabase-js's default implicit flow, which puts tokens in
  the URL fragment. The fragment never reaches a server, and the pages clear it after reading it.
- The Edge Function has not been type-checked or run locally, because Deno is not installed here.
  Deploy it and smoke-test it before the demo.
- Users who signed up before the trigger existed but never signed in have no profile row yet. The
  trigger migration backfills those rows from their signup metadata.
- Supabase is a second vendor and a second database to operate alongside the course-data Postgres.
