"use client"
// Sends a password reset link; the link lands on /auth/confirm, then /reset-password.
import { useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Container, Stack, Text, TextInput, Title } from '@mantine/core';

export default function ForgotPasswordPage() {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function submit() {
        setLoading(true);
        try {
            await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier }),
            });
            setSent(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container size={420} py="xl">
            <form onSubmit={(e) => { e.preventDefault(); submit(); }}>
                <Stack>
                    <Title order={2}>Reset your password</Title>
                    {sent ? (
                        <Alert color="green">If an account matches, we sent a reset link to its email.</Alert>
                    ) : (
                        <>
                            <TextInput label="Username or email" required value={identifier}
                                onChange={(e) => setIdentifier(e.currentTarget.value)} />
                            <Button type="submit" loading={loading}>Send reset link</Button>
                        </>
                    )}
                    <Text size="sm"><Link href="/login">Back to sign in</Link></Text>
                </Stack>
            </form>
        </Container>
    );
}
