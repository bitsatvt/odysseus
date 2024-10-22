"use client"
import SearchBar from "@/components/SearchBar"
import Footer from "@/components/Footer"
import { Flex, Text, Stack, Box, Center } from '@mantine/core';
import Image from 'next/image'

export default function Page() {
  return (
    <Flex direction={{ base: 'column', xs: 'column' }} style={{ height: '100%' }} align={'center'} className="pt-4" justify="space-between">
      <Stack style={{ width: '100%' }}>
        <Flex direction={{ base: 'column', xs: 'row' }} style={{ width: '100%' }} align={'left'} className="mb-2" >
          <Stack align="center" gap={0} p="1%">
            <Image src="/OfficialOdysseusLogo.png" width={80} height={80} alt="Odysseus Logo" />
            <Text style={{ fontFamily: "'Just Another Hand', cursive", fontSize: '30px' }}>Odysseus</Text>
          </Stack>
        </Flex>
        <Box style={{ width: '100%' }} align={'center'} >
          <Text style={{ fontFamily: "'Mynerve', cursive", fontSize: '50px' }} className="mb-4" ta='center'>
            Explore VT
          </Text>
          <SearchBar />
        </Box>
      </Stack>
      <Footer />
    </Flex >
  );
}