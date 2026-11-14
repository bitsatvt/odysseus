import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/db';
import { createClient } from '@/lib/supabase/server';
import { USERNAME_RE, normalizeUsername, syncAppUser } from '@/lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Enter a valid email.' }, { status: 400 });
    if (!USERNAME_RE.test(username)) {
        return NextResponse.json({ error: 'Username must be 3-24 letters, numbers, or underscores.' }, { status: 400 });
    }
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });

    const taken = await prisma.user.findUnique({ where: { username: normalizeUsername(username) }, select: { id: true } });
    if (taken) return NextResponse.json({ error: 'That username is taken.' }, { status: 409 });

    // The username rides in user_metadata until the email is confirmed; /auth/confirm then creates the Prisma row.
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username }, emailRedirectTo: `${request.nextUrl.origin}/auth/confirm` },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // If email confirmation is disabled in Supabase, a session exists already.
    if (data.session && data.user) {
        await syncAppUser(data.user.id, data.user.email, username);
        return NextResponse.json({ confirmEmail: false });
    }
    return NextResponse.json({ confirmEmail: true });
}
