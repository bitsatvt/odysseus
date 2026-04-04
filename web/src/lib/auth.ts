import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/db";

const microsoftClientId = process.env.MICROSOFT_CLIENT_ID;
const microsoftClientSecret = process.env.MICROSOFT_CLIENT_SECRET;

if (!microsoftClientId || !microsoftClientSecret) {
  throw new Error(
    "Microsoft OAuth is required. Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET.",
  );
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // testMode: process.env.NODE_ENV === "test",
  socialProviders: {
    microsoft: {
      clientId: microsoftClientId,
      clientSecret: microsoftClientSecret,
    },
  },
});