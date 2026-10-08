"use client"
// Temporary Supabase auth trial: username or email + password.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, Container, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { getSupabase } from '@/lib/supabase';

export default function LoginPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [created, setCreated] = useState(false);
    const [loading, setLoading] = useState(false);

    // Read the query string client-side; useSearchParams would force a Suspense boundary in static export.
    useEffect(() => {
        setCreated(new URLSearchParams(window.location.search).has('created'));
    }, []);

    async function signIn() {
        setError(null);
        setLoading(true);
        try {
            const supabase = getSupabase();
            let email = identifier.trim();
            if (!email.includes('@')) {
                const { data, error } = await supabase.rpc('get_email_by_username', { p_username: email });
                if (error) throw error;
                if (!data) throw new Error('Invalid username or password.');
                email = data;
            }
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw new Error('Invalid username or password.');
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
                    {created && !error && <Alert color="green">Account created. Sign in with your new password.</Alert>}
                    {error && <Alert color="red">{error}</Alert>}
                    <TextInput label="Username or email" required value={identifier}
                        onChange={(e) => setIdentifier(e.currentTarget.value)} />
                    <PasswordInput label="Password" required value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)} />
                    <Button type="submit" loading={loading}>Sign in</Button>
                    <Text size="sm">No account? <Link href="/signup">Sign up</Link></Text>
                </Stack>
            </form>
        </Container>
    );
}
