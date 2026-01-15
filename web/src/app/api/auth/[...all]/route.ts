import { toNodeHandler } from "better-auth/node";
import { createAuth } from "@/lib/auth";

export const runtime = "nodejs";

const auth = createAuth();

const handler = toNodeHandler(auth.handler);

export const GET = handler;
export const POST = handler;