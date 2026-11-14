import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}));
    const identifier = typeof body.identifier === 'string' ? body.identifier : '';
    const email = identifier.trim() ? await resolveEmail(identifier) : null;

    if (email) {
        const supabase = await createClient();
        await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${request.nextUrl.origin}/auth/confirm?next=/reset-password`,
        });
    }
    // Same response either way so this can't be used to probe which accounts exist.
    return NextResponse.json({ ok: true });
}
