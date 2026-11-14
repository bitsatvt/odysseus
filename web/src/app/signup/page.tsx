"use client"
// Email + username + password, then email confirmation link (handled by /auth/confirm).
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, Container, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function signUp() {
        setError(null);
        setLoading(true);
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Sign up failed.');
            if (data.confirmEmail) {
                setSent(true);
                return;
            }
            router.push('/');
            router.refresh();
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }

    if (sent) {
        return (
            <Container size={420} py="xl">
                <Stack>
                    <Title order={2}>Check your email</Title>
                    <Alert color="green">We sent a confirmation link to {email}. Click it to finish creating your account.</Alert>
                    <Text size="sm">Already confirmed? <Link href="/login">Log in</Link></Text>
                </Stack>
            </Container>
        );
    }

    return (
        <Container size={420} py="xl">
            <form onSubmit={(e) => { e.preventDefault(); signUp(); }}>
                <Stack>
                    <Title order={2}>Create an account</Title>
                    {error && <Alert color="red">{error}</Alert>}
                    <TextInput label="Email" type="email" required value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)} />
                    <TextInput label="Username" required value={username}
                        onChange={(e) => setUsername(e.currentTarget.value)} />
                    <PasswordInput label="Password" required value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)} />
                    <Button type="submit" loading={loading}>Sign up</Button>
                    <Text size="sm">Already have an account? <Link href="/login">Log in</Link></Text>
                </Stack>
            </form>
        </Container>
    );
}
