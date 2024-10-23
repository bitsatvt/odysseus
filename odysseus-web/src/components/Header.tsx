import SearchBar from './SearchBar';
import Link from 'next/link';
import { Flex, Text, Stack, Box } from '@mantine/core';

export default function Header() {
    return (
        <header>
            <Flex direction={{ base: 'column', xs: 'row' }} align={'center'} p={'1%'}>
                <Link href="/vt">
                    <Stack align="center" gap={0}>
                        <img src="/OfficialOdysseusLogo.png" width={80} height={80} alt="Odysseus Logo" />
                        <Text style={{ fontFamily: "'Just Another Hand', cursive", fontSize: '30px' }} c="black">Odysseus</Text>
                    </Stack>
                </Link>
                <Link href="/vt">
                    <Text style={{ fontFamily: 'Alata' }} fz={32} ml={20} c="black" fw={550}>
                        <span>Virginia Tech</span>
                    </Text>
                </Link>
                <Box size={"xs"} hiddenFrom='xs'><SearchBar /></Box>
                <Box size={'lg'} visibleFrom='xs' ml={'auto'}><SearchBar width={500} /></Box>
            </Flex>
        </header >
    );
}

