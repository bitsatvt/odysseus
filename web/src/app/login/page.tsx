"use client"
// Temporary Supabase auth trial: username or email + password, via the `login` Edge Function.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, Container, Group, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { signInWithIdentifier } from '@/lib/supabase';

export default function LoginPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Read the query string client-side; useSearchParams would force a Suspense boundary in static export.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('created')) setNotice('Account created. Sign in with your new password.');
        if (params.has('reset')) setNotice('Password updated. Sign in with your new password.');
    }, []);

    async function signIn() {
        setError(null);
        setLoading(true);
        try {
            await signInWithIdentifier(identifier.trim(), password);
            router.push('/');
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
                    <Group justify="space-between">
                        <Text size="sm">No account? <Link href="/signup">Sign up</Link></Text>
                        <Text size="sm"><Link href="/forgot-password">Forgot password?</Link></Text>
                    </Group>
                </Stack>
            </form>
        </Container>
    );
}
