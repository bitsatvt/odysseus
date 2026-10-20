"use client"
// Temporary Supabase auth trial: email + username + password, then email confirmation link.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, Container, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { ensureProfile, getSupabase } from '@/lib/supabase';

const USERNAME_RE = /^[A-Za-z0-9_]{3,24}$/;

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
            if (!USERNAME_RE.test(username)) throw new Error('Username must be 3-24 letters, numbers, or underscores.');
            if (password.length < 8) throw new Error('Password must be at least 8 characters.');
            const supabase = getSupabase();
            const { data: available, error: rpcError } = await supabase.rpc('username_available', { p_username: username });
            if (rpcError) throw rpcError;
            if (!available) throw new Error('That username is taken.');

            // The username rides in user_metadata; ensureProfile creates the profiles row once a session exists.
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: { data: { username }, emailRedirectTo: window.location.origin },
            });
            if (error) throw error;
            if (!data.session) {
                setSent(true);
                return;
            }
            if (!(await ensureProfile(data.user!))) {
                await supabase.auth.signOut();
                throw new Error('That username is taken.');
            }
            router.push('/');
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
