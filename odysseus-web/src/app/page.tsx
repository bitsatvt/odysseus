"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from "@/components/SearchBar"
import Footer from "@/components/Footer"
import { Flex, Stack, Box, Alert, Container, Button, Menu, ActionIcon } from '@mantine/core';
import { IconAlertCircle, IconUser, IconLogout } from '@tabler/icons-react';
import Link from 'next/link';

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check auth state on mount
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const name = localStorage.getItem('userName') || '';
    setIsLoggedIn(loggedIn);
    setUserName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUserName('');
  };

  return (
    <Flex direction={{ base: 'column', xs: 'column' }} style={{ height: '100%' }} align={'center'} className="pt-4" justify="space-between">
      {/* Auth Button - Top Right */}
      <Box style={{ position: 'absolute', top: 16, right: 16 }}>
        {isLoggedIn ? (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon
                size="lg"
                radius="xl"
                variant="filled"
                style={{ backgroundColor: '#971515' }}
              >
                <IconUser size={20} color="white" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Hi, {userName}!</Menu.Label>
              <Menu.Item
                leftSection={<IconUser size={14} />}
                onClick={() => router.push('/profile')}
              >
                Profile
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Link href="/auth">
            <Button
              variant="filled"
              style={{ backgroundColor: '#971515' }}
            >
              Sign Up
            </Button>
          </Link>
        )}
      </Box>

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
