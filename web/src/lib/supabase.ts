import { createClient, FunctionsHttpError, SupabaseClient, User } from '@supabase/supabase-js';

// Temporary Supabase auth trial. Client-only: the site is a static export, so sessions live in the
// browser and user data (profiles) lives in Supabase, not in the Prisma database.
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!client) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) {
            throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
        }
        client = createClient(url, key);
    }
    return client;
}

// Absolute URL on this site, used for links in Supabase emails (must be in the project's redirect allow list).
export function siteUrl(path: string): string {
    return `${window.location.origin}${path}`;
}

// Supabase reports email-link errors (e.g. an expired link) in the URL fragment or query string.
// Show fixed text only: error_description comes from the URL, so anyone could craft a link with their own message.
export function linkError(): string | null {
    const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
    if (!params.has('error') && !params.has('error_code')) return null;
    return params.get('error_code') === 'otp_expired'
        ? 'This link has expired. Request a new one.'
        : 'This link is invalid or has already been used.';
}

// The profiles row is created by a database trigger at signup (supabase/migrations), so this only reads it.
export async function getUsername(user: User): Promise<string | null> {
    const { data } = await getSupabase().from('profiles').select('username').eq('id', user.id).maybeSingle();
    return data?.username ?? null;
}

// Username-or-email login via the `login` Edge Function, which looks up the email server-side
// so it is never exposed to the browser. The returned tokens become the browser session.
export async function signInWithIdentifier(identifier: string, password: string): Promise<void> {
    const supabase = getSupabase();
    const { data, error } = await supabase.functions.invoke('login', { body: { identifier, password } });
    if (error) {
        let message = 'Sign in failed. Please try again.';
        if (error instanceof FunctionsHttpError) {
            const body = await error.context.json().catch(() => null);
            if (typeof body?.error === 'string') message = body.error;
        }
        throw new Error(message);
    }
    const { error: sessionError } = await supabase.auth.setSession(data.session);
    if (sessionError) throw sessionError;
}
