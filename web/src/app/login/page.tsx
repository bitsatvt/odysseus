"use client"
// Username or email + password. The server resolves usernames to emails; emails never reach the browser.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, Container, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';

export default function LoginPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Read the query string client-side to avoid a Suspense boundary for useSearchParams.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('error') === 'link') setError('That link is invalid or has expired.');
        if (params.has('reset')) setNotice('Password updated. Sign in with your new password.');
    }, []);

    async function signIn() {
        setError(null);
        setNotice(null);
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Sign in failed.');
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
            <form onSubmit={(e) => { e.preventDefault(); signIn(); }}>
                <Stack>
                    <Title order={2}>Sign in</Title>
                    {notice && !error && <Alert color="green">{notice}</Alert>}
                    {error && <Alert color="red">{error}</Alert>}
                    <TextInput label="Username or email" required value={identifier}
                        onChange={(e) => setIdentifier(e.currentTarget.value)} />
                    <PasswordInput label="Password" required value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)} />
                    <Button type="submit" loading={loading}>Sign in</Button>
                    <Text size="sm"><Link href="/forgot-password">Forgot password?</Link></Text>
                    <Text size="sm">No account? <Link href="/signup">Sign up</Link></Text>
                </Stack>
            </form>
        </Container>
    );
}
