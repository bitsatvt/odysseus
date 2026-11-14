import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Requires the recovery session set by /auth/confirm?type=recovery.
export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}));
    const password = typeof body.password === 'string' ? body.password : '';
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (!data?.claims?.sub) {
        return NextResponse.json({ error: 'Your reset link expired. Request a new one.' }, { status: 401 });
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
}
