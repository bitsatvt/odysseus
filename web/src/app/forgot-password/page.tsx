"use client"
// Temporary Supabase auth trial: request a password reset email.
// Email only (not username), so this page never reveals whether a username exists or whose it is.
import { useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Container, Stack, Text, TextInput, Title } from '@mantine/core';
import { getSupabase, siteUrl } from '@/lib/supabase';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function sendReset() {
        setError(null);
        setLoading(true);
        try {
            const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
                redirectTo: siteUrl('/reset-password'),
            });
            if (error) throw error;
            setSent(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container size={420} py="xl">
            <form onSubmit={(e) => { e.preventDefault(); sendReset(); }}>
                <Stack>
                    <Title order={2}>Reset your password</Title>
                    {sent ? (
                        <Alert color="green">If an account exists for {email}, we sent a link to reset its password.</Alert>
                    ) : (
                        <>
                            {error && <Alert color="red">{error}</Alert>}
                            <TextInput label="Email" type="email" required value={email}
                                onChange={(e) => setEmail(e.currentTarget.value)} />
                            <Button type="submit" loading={loading}>Send reset link</Button>
                        </>
                    )}
                    <Text size="sm">Remembered it? <Link href="/login">Log in</Link></Text>
                </Stack>
            </form>
        </Container>
    );
}
