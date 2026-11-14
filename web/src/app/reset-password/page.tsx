"use client"
// Reached from the reset email via /auth/confirm, which sets a recovery session.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Container, PasswordInput, Stack, Title } from '@mantine/core';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function submit() {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Could not update password.');
            router.push('/');
            router.refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container size={420} py="xl">
            <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <Stack>
                    <Title order={2}>Choose a new password</Title>
                    {error && <Alert color="red">{error}</Alert>}
                    <PasswordInput label="New password" required value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)} />
                    <Button type="submit" loading={loading}>Update password</Button>
                </Stack>
            </form>
        </Container>
    );
}
