"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import { IconBrandWindows } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";

export default function MicrosoftSignInButton() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      await authClient.signIn.social({
        provider: "microsoft",
        callbackURL: window.location.href,
      });
    } catch (error) {
      console.error("Microsoft sign-in failed", error);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      loading={loading}
      radius="md"
      variant="filled"
      color="blue"
      leftSection={<IconBrandWindows size={16} />}
      size="sm"
    >
      Sign in
    </Button>
  );
}
