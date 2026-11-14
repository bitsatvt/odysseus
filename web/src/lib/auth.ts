import prisma from '@/db';
import { createClient } from '@/lib/supabase/server';

export const USERNAME_RE = /^[A-Za-z0-9_]{3,24}$/;

// Usernames are stored lowercase so the @unique index is effectively case-insensitive
// and login lookups are exact matches.
export function normalizeUsername(username: string): string {
    return username.trim().toLowerCase();
}

export type CurrentUser = { id: string; email: string | null; username: string | null };

// The verified Supabase user for this request, joined with the app profile in Prisma.
// getClaims verifies the JWT; never trust getSession() on the server.
export async function getCurrentUser(): Promise<CurrentUser | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims?.sub) return null;
    const claims = data.claims;
    const email = typeof claims.email === 'string' ? claims.email : null;
    const username = await syncAppUser(claims.sub, email, claims.user_metadata?.username);
    return { id: claims.sub, email, username };
}

// Ensures a Prisma User row exists for a Supabase auth user, creating it from the username
// stored in user_metadata at signup. Returns the username, or null if it can't be created
// (no username in metadata, or the username/email was taken in the meantime).
export async function syncAppUser(id: string, email: string | null | undefined, metadataUsername: unknown): Promise<string | null> {
    const existing = await prisma.user.findUnique({ where: { id }, select: { username: true } });
    if (existing) return existing.username;
    if (!email || typeof metadataUsername !== 'string' || !USERNAME_RE.test(metadataUsername)) return null;
    try {
        const created = await prisma.user.create({ data: { id, email: email.toLowerCase(), username: normalizeUsername(metadataUsername) } });
        return created.username;
    } catch {
        return null;
    }
}

// Resolves a username-or-email to an email, server-side only.
export async function resolveEmail(identifier: string): Promise<string | null> {
    const value = identifier.trim();
    if (value.includes('@')) return value.toLowerCase();
    const user = await prisma.user.findUnique({ where: { username: normalizeUsername(value) }, select: { email: true } });
    return user?.email ?? null;
}
