import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Temporary Supabase auth trial. Client-only: the site is a static export.
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

// Returns the user's username, creating the profiles row on first sign-in from the
// username stored in user_metadata at signup (no session exists until the email is confirmed).
export async function ensureProfile(user: User): Promise<string | null> {
    const supabase = getSupabase();
    const { data } = await supabase.from('profiles').select('username').eq('id', user.id).maybeSingle();
    if (data) return data.username;
    const username = user.user_metadata?.username;
    if (typeof username !== 'string') return null;
    const { error } = await supabase.from('profiles').insert({ id: user.id, username });
    return error ? null : username;
}
