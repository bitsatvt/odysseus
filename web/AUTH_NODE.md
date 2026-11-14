# Auth on a Node server (Supabase for auth only)

Branch: `kp-supabase-auth-node`

## Architecture

- The site runs as a normal Next.js server (`next start`). Static export (`output: "export"`) is removed.
- **Supabase holds only credentials** (`auth.users`): passwords, email confirmation, reset links, sessions.
- **All app user data lives in our Prisma Postgres** in a new `User` table (`id` = Supabase auth user id, `username`, `email`, `createdAt`).
- The browser talks only to our own `/api/auth/*` routes. Those routes call Supabase on the server and set
  HTTP cookies (`@supabase/ssr`). Username-to-email lookup happens on the server, so emails never reach the browser.
- `src/proxy.ts` (Next 16's renamed middleware) refreshes the session cookie on each request.
- `getCurrentUser()` (`src/lib/auth.ts`) verifies the JWT with `supabase.auth.getClaims()`; it never trusts `getSession()`.

| Route | Purpose |
|---|---|
| `POST /api/auth/signup` | Validate, check username in Prisma, `auth.signUp` (username in metadata), send confirmation email |
| `GET /auth/confirm` | Email link target: `verifyOtp`, create the Prisma `User`, redirect home (or to `/reset-password`) |
| `POST /api/auth/login` | Username or email + password; sets cookies; creates the Prisma `User` if it's missing (older accounts) |
| `POST /api/auth/logout` | Sign out, clear cookies |
| `GET /api/auth/me` | Current username (used by the header) |
| `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` | Password reset by email link |

Pages: `/signup`, `/login`, `/forgot-password`, `/reset-password`. The header shows the username and a Sign out button.

## What works

- Sign up, confirm by email, sign in with a username or an email, sign out, reset a password.
- Sign-in state is shown in the header on every page.
- `npm run build` and `npx tsc --noEmit` pass. Course and instructor pages are still pre-rendered at build time.

## Setup

1. **Env vars** (`web/.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`),
   `DATABASE_URL` (defaults to the local Docker DB).
2. **Database**: `docker compose up -d prisma-db` (repo root), then in `web/`: `npx prisma migrate deploy && npx prisma generate`.
   The migration is `prisma/migrations/20261113000000_add_user` (adds only the `User` table).
3. **Supabase dashboard** (Authentication settings):
   - **Site URL**: the deployed origin (e.g. `https://odyadvisor.com`); `http://localhost:3000` for local testing.
   - **Redirect URLs**: add `http://localhost:3000/**` and the production origin `/**`.
   - **Email templates**:
     - Confirm signup: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
     - Reset password: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
   - **Custom SMTP** (e.g. Resend, SES, Postmark). Supabase's built-in mailer allows only a few emails per hour and is for testing only.
4. **Cleanup later** (not done; the live project was left untouched): the `public.profiles` table and the
   `username_available` and `get_email_by_username` RPCs are no longer used and can be dropped.
   `get_email_by_username` exposes emails to anonymous callers, so drop it soon.

## Hosting

This needs a **Node host** (Vercel, Render, Fly, Railway, a VM or a container). Static hosting such as GitHub Pages or S3 alone will not work,
because the auth routes and proxy run on the server. The host also needs network access to the Postgres database.

## Tradeoffs

- **Pros**: emails stay private, sessions are in HTTP cookies, the server can check who the user is for future features
  (saved courses, reviews), and user data stays in our own database.
- **Cons**: needs a server and a hosted Postgres instead of free static hosting. The app's `User` row and Supabase's `auth.users`
  are two records kept in sync by our code. If a user is deleted in Supabase, their row in our database is not removed automatically.
- **Known gaps**: there's no rate limiting on our auth routes beyond Supabase's own limits. A user who signed up before this change
  must sign in with their **email** once; that creates their Prisma row, and after that their username works too.
  Usernames are checked case-insensitively, but the database's unique constraint is case-sensitive.
