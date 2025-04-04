import React from 'react';
import { IconBrandGithub, IconBrandDiscordFilled } from '@tabler/icons-react';
import { ActionIcon, Flex, Group } from '@mantine/core';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{ width: '100%' }}>
            <Flex px={10}
                w="100%"
                h={60}
                bg="#971515"
                justify="space-between"
                c="gray"
                align="center"
            >
                <Group>
                    © {new Date().getFullYear()} Odysseus Developers
                </Group>
                <Group gap="xs" wrap="nowrap">
                    <Link href="https://discord.gg/vRjUxzrkEc">
                        <ActionIcon size="md" variant="default" radius="xl">
                            <IconBrandDiscordFilled size={18} stroke={1.5} />
                        </ActionIcon>
                    </Link>
                    <Link href="https://github.com/Odysseus-Academic">
                        <ActionIcon size="md" variant="default" radius="xl">
                            <IconBrandGithub size={18} stroke={1.5} />
                        </ActionIcon>
                    </Link>
                </Group >
            </Flex>
        </footer>
    );
};