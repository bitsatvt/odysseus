import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/db";

export function createAuth() {
    const secret = process.env.BETTER_AUTH_SECRET;
  if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is missing");
  }

  return betterAuth({
    

     database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    cookies: {
      encryption: {
        secret, //🔑 THIS FIXES THE ERROR
      },
    },
    
    socialProviders: {
      microsoft: {
        issuer: "https://login.microsoftonline.com/common/v2.0",
        clientId: process.env.MICROSOFT_CLIENT_ID!,
        authorization: {
          params: { scope: "openid profile email" },
        },
        checks: ["pkce", "state"],
        profile(profile: any) {
          return {
            id: profile.sub,
            email: profile.email ?? profile.preferred_username,
            name: profile.name,
          };
        },
      },
    },
  });
}