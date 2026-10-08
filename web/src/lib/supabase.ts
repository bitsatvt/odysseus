import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
