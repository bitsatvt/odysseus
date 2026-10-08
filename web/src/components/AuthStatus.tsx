"use client"
// Temporary Supabase auth trial: header sign-in state.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Group, Text } from '@mantine/core';
import { getSupabase } from '@/lib/supabase';

export default function AuthStatus() {
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let supabase;
        try {
            supabase = getSupabase();
        } catch {
            setReady(true);
            return;
        }

        async function load(userId: string | undefined) {
            if (!userId) {
                setUsername(null);
            } else {
                const { data } = await supabase!.from('profiles').select('username').eq('id', userId).maybeSingle();
                setUsername(data?.username ?? null);
            }
            setReady(true);
        }

        // Defer the query out of the callback; awaiting Supabase calls inside it can deadlock.
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            setTimeout(() => load(session?.user.id), 0);
        });
        return () => sub.subscription.unsubscribe();
    }, []);

    if (!ready) return null;

    if (!username) {
        return <Link href="/login"><Text c="black" fw={500}>Sign in</Text></Link>;
    }

    return (
        <Group gap="sm" wrap="nowrap">
            <Text fw={500}>{username}</Text>
            <Button size="xs" variant="default" onClick={async () => {
                await getSupabase().auth.signOut();
                router.push('/login');
            }}>Sign out</Button>
        </Group>
    );
}
