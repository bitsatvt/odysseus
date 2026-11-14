"use client"
// Header sign-in state. Asks the server (/api/auth/me), which verifies the session cookie
// and reads the username from Prisma.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Group, Text } from '@mantine/core';

export default function AuthStatus() {
    const router = useRouter();
    const pathname = usePathname();
    const [username, setUsername] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    // Re-check on navigation so the header updates right after login/logout.
    useEffect(() => {
        let cancelled = false;
        fetch('/api/auth/me', { cache: 'no-store' })
            .then((res) => res.json())
            .then((data) => { if (!cancelled) setUsername(data.user?.username ?? null); })
            .catch(() => { if (!cancelled) setUsername(null); })
            .finally(() => { if (!cancelled) setReady(true); });
        return () => { cancelled = true; };
    }, [pathname]);

    if (!ready) return null;

    if (!username) {
        return (
            <Group gap="sm" wrap="nowrap">
                <Button component={Link} href="/login" size="xs" variant="default">Log in</Button>
                <Button component={Link} href="/signup" size="xs">Sign up</Button>
            </Group>
        );
    }

    return (
        <Group gap="sm" wrap="nowrap">
            <Text fw={500}>{username}</Text>
            <Button size="xs" variant="default" onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                setUsername(null);
                router.push('/login');
                router.refresh();
            }}>Sign out</Button>
        </Group>
    );
}
