import prisma from "@/db";
import { hashPassword, isVtEmail, normalizeEmail } from "@/server/utils/auth";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!isVtEmail(email)) {
        return Response.json({ error: "Email must end with @vt.edu" }, { status: 400 });
    }
    if (!username) {
        return Response.json({ error: "Username is required" }, { status: 400 });
    }
    if (password.length < 8) {
        return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    try {
        await prisma.user.create({
            data: { email, username, passwordHash: await hashPassword(password) },
        });
    } catch (error) {
        // P2002: unique constraint failed (email or username already taken)
        if ((error as { code?: string }).code === "P2002") {
            return Response.json({ error: "Email or username already in use" }, { status: 409 });
        }
        throw error;
    }

    return Response.json({ ok: true, email });
}
