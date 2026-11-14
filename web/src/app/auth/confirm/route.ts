import { NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { syncAppUser } from '@/lib/auth';

const ALLOWED_NEXT = new Set(['/', '/reset-password']);

// Target of the Supabase email links. Templates must point here:
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const nextParam = searchParams.get('next');
    // Allowlist redirect targets: prefix checks miss tricks like '/\\evil.com', which browsers treat as '//evil.com'.
    const next = nextParam && ALLOWED_NEXT.has(nextParam) ? nextParam : '/';

    if (tokenHash && type) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (!error && data.user) {
            await syncAppUser(data.user.id, data.user.email, data.user.user_metadata?.username);
            const dest = type === 'recovery' ? '/reset-password' : next;
            return NextResponse.redirect(new URL(dest, request.url));
        }
    }

    const fail = new URL('/login', request.url);
    fail.searchParams.set('error', 'link');
    return NextResponse.redirect(fail);
}
