import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export const GET = auth.handler;
export const POST = auth.handler;
