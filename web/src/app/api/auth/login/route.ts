import prisma from "@/db";
import { normalizeEmail, verifyPassword } from "@/server/utils/auth";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body?.password === "string" ? body.password : "";

    const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // TODO: no session is created yet; that comes after OTP verification
    return Response.json({ ok: true, email: user.email, username: user.username });
}
