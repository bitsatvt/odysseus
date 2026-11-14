import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseEnv } from '@/lib/supabase/env';

// Refreshes the Supabase session cookies on each request so Server Components see a valid token.
// Next 16 renamed middleware.ts to proxy.ts.
export async function proxy(request: NextRequest) {
    let response = NextResponse.next({ request });
    const { url, key } = supabaseEnv();

    const supabase = createServerClient(url, key, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet, headers) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
                Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
            },
        },
    });

    // Do not put code between createServerClient and getClaims: getClaims triggers the token refresh.
    await supabase.auth.getClaims();

    return response;
}

export const config = {
    matcher: [
        // Skip static assets and images.
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
