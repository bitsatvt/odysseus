"use client"
import SearchBar from "@/components/SearchBar"
import Footer from "@/components/Footer"
import { Flex, Text, Stack, Box, Space } from '@mantine/core';

export default function Page() {
  return (
    <Flex direction={{ base: 'column', xs: 'column' }} style={{ height: '100%' }} align={'center'} className="pt-4" justify="space-between">
      <Stack style={{ width: '100%' }} align={'center'}>
        <Flex direction={{ base: 'column', xs: 'row' }} style={{ width: '100%' }} align={'left'} className="mb-2" >
          <Stack align="center" gap={0} p="1%">
            <img src="/OfficialOdysseusLogo.svg" width={80} height={130} alt="Odysseus Logo" />
          </Stack>
        </Flex>
        <img src="/exploreVT.svg" width={250} height={70} alt="Explore VT" />
        <Box w={'100%'}>

          <SearchBar />
        </Box>
      </Stack>
      <Footer />
    </Flex >
  );
}