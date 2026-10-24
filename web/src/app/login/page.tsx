"use client"
import { useState } from "react";
import { Alert, Button, Center, Paper, PasswordInput, Stack, Tabs, Text, TextInput, Title } from "@mantine/core";

type Mode = "login" | "signup";

async function post(url: string, body: object) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
}

export default function LoginPage() {
    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [otpMessage, setOtpMessage] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (mode === "signup" && !email.trim().toLowerCase().endsWith("@vt.edu")) {
            setError("Please use your @vt.edu email");
            return;
        }

        setLoading(true);
        try {
            if (mode === "signup") {
                await post("/api/auth/signup", { email, username, password });
            } else {
                await post("/api/auth/login", { email, password });
            }
            // Credentials are good: hand off to the (not yet built) OTP step
            const otp = await post("/api/auth/otp", { email });
            setOtpMessage(otp.message);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    if (otpMessage) {
        return (
            <Center mt="xl">
                <Paper withBorder p="lg" w={380}>
                    <Stack>
                        <Title order={3}>Verify your email</Title>
                        <Text size="sm">
                            A verification code would be sent to <b>{email}</b>.
                        </Text>
                        <Alert color="blue">Server responded: {otpMessage}</Alert>
                        <Button variant="default" onClick={() => setOtpMessage(null)}>Back</Button>
                    </Stack>
                </Paper>
            </Center>
        );
    }

    return (
        <Center mt="xl">
            <Paper withBorder p="lg" w={380}>
                <Tabs value={mode} onChange={(value) => { setMode(value as Mode); setError(null); }}>
                    <Tabs.List grow mb="md">
                        <Tabs.Tab value="login">Log in</Tabs.Tab>
                        <Tabs.Tab value="signup">Sign up</Tabs.Tab>
                    </Tabs.List>
                </Tabs>
                <form onSubmit={handleSubmit}>
                    <Stack>
                        <TextInput
                            label="Email"
                            placeholder="pid@vt.edu"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.currentTarget.value)}
                        />
                        {mode === "signup" && (
                            <TextInput
                                label="Username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.currentTarget.value)}
                            />
                        )}
                        <PasswordInput
                            label="Password"
                            required
                            minLength={mode === "signup" ? 8 : undefined}
                            value={password}
                            onChange={(e) => setPassword(e.currentTarget.value)}
                        />
                        {error && <Alert color="red">{error}</Alert>}
                        <Button type="submit" loading={loading}>
                            {mode === "signup" ? "Create account" : "Log in"}
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </Center>
    );
}
