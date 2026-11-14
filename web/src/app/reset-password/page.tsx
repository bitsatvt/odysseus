"use client"
// Temporary Supabase auth trial: set a new password from the reset email link.
// supabase-js turns the link's URL fragment into a short-lived recovery session on load.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, Container, Loader, PasswordInput, Stack, Text, Title } from '@mantine/core';
import { getSupabase, linkError } from '@/lib/supabase';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const urlError = linkError();
        getSupabase().auth.getSession().then(({ data }) => {
            setHasSession(!!data.session);
            if (!data.session) setError(urlError ?? 'This reset link is invalid or has expired.');
            else window.history.replaceState(null, '', window.location.pathname);
            setReady(true);
        });
    }, []);

    async function updatePassword() {
        setError(null);
        setLoading(true);
        try {
            if (password.length < 8) throw new Error('Password must be at least 8 characters.');
            if (password !== confirm) throw new Error('Passwords do not match.');
            const supabase = getSupabase();
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            await supabase.auth.signOut();
            router.push('/login?reset');
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container size={420} py="xl">
            <form onSubmit={(e) => { e.preventDefault(); updatePassword(); }}>
                <Stack>
                    <Title order={2}>Choose a new password</Title>
                    {!ready && <Loader />}
                    {error && <Alert color="red">{error}</Alert>}
                    {ready && hasSession && (
                        <>
                            <PasswordInput label="New password" required value={password}
                                onChange={(e) => setPassword(e.currentTarget.value)} />
                            <PasswordInput label="Confirm new password" required value={confirm}
                                onChange={(e) => setConfirm(e.currentTarget.value)} />
                            <Button type="submit" loading={loading}>Update password</Button>
                        </>
                    )}
                    {ready && !hasSession && (
                        <Text size="sm"><Link href="/forgot-password">Request a new reset link</Link></Text>
                    )}
                </Stack>
            </form>
        </Container>
    );
}
