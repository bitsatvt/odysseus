import { createBrowserClient } from '@supabase/ssr';
import { supabaseEnv } from './env';

// Browser client (cookie-backed session shared with the server). Auth flows go through
// /api/auth/* route handlers; this exists for client-side features that need it later.
export function createClient() {
    const { url, key } = supabaseEnv();
    return createBrowserClient(url, key);
}
