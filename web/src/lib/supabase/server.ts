import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseEnv } from './env';

// Server client for Server Components, Route Handlers and Server Actions.
// Create a new one per request; never share it between requests.
export async function createClient() {
    const cookieStore = await cookies();
    const { url, key } = supabaseEnv();
    return createServerClient(url, key, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                } catch {
                    // Called from a Server Component, where cookies are read-only. Safe to ignore:
                    // proxy.ts refreshes the session cookies on every request.
                }
            },
        },
    });
}
