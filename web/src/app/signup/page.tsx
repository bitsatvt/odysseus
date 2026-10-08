"use client"
// Temporary Supabase auth trial: email code -> username + password.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, Container, PasswordInput, PinInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { getSupabase } from '@/lib/supabase';

type Step = 'email' | 'code' | 'profile';

const USERNAME_RE = /^[A-Za-z0-9_]{3,24}$/;

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function run(fn: () => Promise<void>) {
        setError(null);
        setLoading(true);
        try {
            await fn();
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }

    const sendCode = () => run(async () => {
        const { error } = await getSupabase().auth.signInWithOtp({
            email: email.trim(),
            options: { shouldCreateUser: true },
        });
        if (error) throw error;
        setStep('code');
    });

    const verifyCode = () => run(async () => {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: 'email' });
        if (error) throw error;
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user!.id).maybeSingle();
        if (profile) {
            await supabase.auth.signOut();
            throw new Error('This email already has an account. Sign in instead.');
        }
        setStep('profile');
    });

    const finish = () => run(async () => {
        if (!USERNAME_RE.test(username)) throw new Error('Username must be 3-24 letters, numbers, or underscores.');
        if (password.length < 8) throw new Error('Password must be at least 8 characters.');
        const supabase = getSupabase();
        const { data: taken, error: rpcError } = await supabase.rpc('get_email_by_username', { p_username: username });
        if (rpcError) throw rpcError;
        if (taken) throw new Error('That username is taken.');

        const { data, error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        const { error: insertError } = await supabase.from('profiles').insert({ id: data.user.id, username });
        if (insertError) {
            throw new Error(insertError.code === '23505' ? 'That username is taken.' : insertError.message);
        }
        await supabase.auth.signOut();
        router.push('/login?created=1');
    });

    return (
        <Container size={420} py="xl">
            <Stack>
                <Title order={2}>Create an account</Title>
                {error && <Alert color="red">{error}</Alert>}

                {step === 'email' && (
                    <form onSubmit={(e) => { e.preventDefault(); sendCode(); }}>
                        <Stack>
                            <TextInput label="Email" type="email" required value={email}
                                onChange={(e) => setEmail(e.currentTarget.value)} />
                            <Button type="submit" loading={loading}>Send code</Button>
                        </Stack>
                    </form>
                )}

                {step === 'code' && (
                    <form onSubmit={(e) => { e.preventDefault(); verifyCode(); }}>
                        <Stack>
                            <Text size="sm">Enter the 6-digit code sent to {email}.</Text>
                            <PinInput length={6} type="number" oneTimeCode value={code} onChange={setCode} />
                            <Button type="submit" loading={loading} disabled={code.length !== 6}>Verify</Button>
                            <Button variant="subtle" onClick={() => { setCode(''); setStep('email'); }}>Use a different email</Button>
                        </Stack>
                    </form>
                )}

                {step === 'profile' && (
                    <form onSubmit={(e) => { e.preventDefault(); finish(); }}>
                        <Stack>
                            <TextInput label="Username" required value={username}
                                onChange={(e) => setUsername(e.currentTarget.value)} />
                            <PasswordInput label="Password" required value={password}
                                onChange={(e) => setPassword(e.currentTarget.value)} />
                            <Button type="submit" loading={loading}>Create account</Button>
                        </Stack>
                    </form>
                )}

                <Text size="sm">Already have an account? <Link href="/login">Sign in</Link></Text>
            </Stack>
        </Container>
    );
}
