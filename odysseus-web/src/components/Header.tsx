import SearchBar from './SearchBar';
import Link from 'next/link';
import { Flex, Text, Stack, Box } from '@mantine/core';
import Image from 'next/image'

export default function Header() {
    return (
        <header>
            <Flex direction={{ base: 'column', xs: 'row' }} align={'center'} p={20}>
                <Stack align="center" gap={0}>
                    <Image src="/OfficialOdysseusLogo.png" width={80} height={80} alt="Odysseus Logo" />
                    <Text style={{ fontFamily: "'Just Another Hand', cursive", fontSize: '30px' }}>Odysseus</Text>
                </Stack>
                <Link href={"/vt"}>
                    <Text fz={32} ml={20}>
                        <span>Virginia</span> <span>Tech</span>
                    </Text>
                </Link>
                <Box style={{
                    marginLeft: 'auto'
                }}>
                    <SearchBar />
                </Box>
            </Flex>
        </header >
    );
}

