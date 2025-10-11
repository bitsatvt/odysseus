"use client"
import SearchBar from "@/components/SearchBar"
import Footer from "@/components/Footer"
import { Flex, Text, Stack, Box, Alert, Container } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function Page() {
  return (
    <Flex direction={{ base: 'column', xs: 'column' }} style={{ height: '100%' }} align={'center'} className="pt-4" justify="space-between">
      <Stack style={{ width: '100%' }} align={'center'}>
        <Flex direction={{ base: 'column', xs: 'row' }} style={{ width: '100%' }} align={'left'} className="mb-2">
          <Stack align="center" gap={0} p="1%">
            <img src="/OfficialOdysseusLogo.svg" width={80} height={130} alt="Odysseus Logo" />
          </Stack>
        </Flex>
        <img src="/exploreVT.svg" width={250} height={70} alt="Explore VT" />
        <Box w={'100%'}>
          <SearchBar />
        </Box>
        <Container size="sm" pt="lg">
          <Alert
            icon={<IconAlertCircle size={32} />}
            title="The website is under development and may experience occasional issues."
            color="yellow"
            radius="md"
          />
        </Container>
      </Stack>

      <Footer />
    </Flex>
  );
}