"use client"
// Temporary Supabase auth trial: landing page for the signup confirmation email link.
// supabase-js reads the session tokens from the URL fragment on load (detectSessionInUrl), so there
// is no server-side code exchange; this page only reports the outcome.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Container, Loader, Stack, Title } from '@mantine/core';
import { getSupabase, linkError } from '@/lib/supabase';

type Status = 'loading' | 'confirmed' | 'failed';

export default function ConfirmPage() {
    const [status, setStatus] = useState<Status>('loading');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const urlError = linkError();
        getSupabase().auth.getSession().then(({ data, error }) => {
            if (data.session) {
                setStatus('confirmed');
                window.history.replaceState(null, '', window.location.pathname);
            } else {
                setError(urlError ?? error?.message ?? 'This confirmation link is invalid or has expired.');
                setStatus('failed');
            }
        });
    }, []);

    return (
        <Container size={420} py="xl">
            <Stack>
                <Title order={2}>Email confirmation</Title>
                {status === 'loading' && <Loader />}
                {status === 'confirmed' && (
                    <>
                        <Alert color="green">Your email is confirmed and you are signed in.</Alert>
                        <Button component={Link} href="/">Go to Odysseus</Button>
                    </>
                )}
                {status === 'failed' && (
                    <>
                        <Alert color="red">{error}</Alert>
                        <Button component={Link} href="/login" variant="default">Go to sign in</Button>
                    </>
                )}
            </Stack>
        </Container>
    );
}
