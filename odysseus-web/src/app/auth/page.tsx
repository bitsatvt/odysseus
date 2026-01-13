"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Flex,
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Paper,
  Anchor,
  Divider,
  Group,
} from '@mantine/core';
import { IconBrandGoogle, IconBrandWindows } from '@tabler/icons-react';
import Footer from '@/components/Footer';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', name || email.split('@')[0]);
    router.push('/');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <Flex
      direction="column"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f4f4 25%, #f5efef 50%, #f0e8e8 75%, #ebe3e3 100%)',
      }}
      justify="space-between"
    >
      <Flex direction="column" align="center" pt={40} px={16} style={{ flex: 1 }}>
        {/* Logo */}
        <Link href="/">
          <Stack align="center" gap={0} mb={24}>
            <img src="/OfficialOdysseusLogo.svg" width={80} height={130} alt="Odysseus Logo" />
          </Stack>
        </Link>

        {/* Auth Card */}
        <Paper
          shadow="lg"
          p={32}
          radius="md"
          style={{
            width: '100%',
            maxWidth: 400,
            border: '1px solid rgba(151, 21, 21, 0.08)',
          }}
        >
          <Text
            size="xl"
            fw={600}
            ta="center"
            mb={8}
            style={{ fontFamily: 'Cambria' }}
          >
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text ta="center" size="sm" c="dimmed" mb={20}>
            {isLogin ? 'Sign in to continue' : 'Join Odysseus today'}
          </Text>

          {/* Social Login Buttons */}
          <Group grow mb="lg">
            <Button
              variant="outline"
              leftSection={<IconBrandGoogle size={18} />}
              style={{ borderColor: '#ddd', color: '#444' }}
            >
              Google
            </Button>
            <Button
              variant="outline"
              leftSection={<IconBrandWindows size={18} />}
              style={{ borderColor: '#ddd', color: '#444' }}
            >
              Microsoft
            </Button>
          </Group>

          <Divider my="lg" label="or continue with email" labelPosition="center" />

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              {!isLogin && (
                <TextInput
                  label="Name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                />
              )}

              <TextInput
                label="Email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {!isLogin && (
                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
              )}

              <Button
                type="submit"
                fullWidth
                mt="md"
                style={{ backgroundColor: '#971515' }}
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </Stack>
          </form>

          <Text ta="center" size="sm" mt="lg">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Anchor
              component="button"
              type="button"
              onClick={toggleMode}
              style={{ color: '#971515' }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Anchor>
          </Text>
        </Paper>
      </Flex>

      <Footer />
    </Flex>
  );
}
