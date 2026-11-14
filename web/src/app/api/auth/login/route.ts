import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveEmail, syncAppUser } from '@/lib/auth';

const INVALID = 'Invalid username or password.';

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}));
    const identifier = typeof body.identifier === 'string' ? body.identifier : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!identifier.trim() || !password) return NextResponse.json({ error: INVALID }, { status: 400 });

    // Username -> email lookup happens here, so emails never reach the browser.
    const email = await resolveEmail(identifier);
    if (!email) return NextResponse.json({ error: INVALID }, { status: 401 });

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        if (error.code === 'email_not_confirmed') {
            return NextResponse.json({ error: 'Confirm your email first, then sign in.' }, { status: 403 });
        }
        return NextResponse.json({ error: INVALID }, { status: 401 });
    }

    // Creates the Prisma row for users who signed up before it existed.
    const username = await syncAppUser(data.user.id, data.user.email, data.user.user_metadata?.username);
    return NextResponse.json({ username });
}
