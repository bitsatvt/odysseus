// Placeholder for OTP verification. The login page pings this once the
// email/password check passes; real code generation, sending and checking
// will go here later.
export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email : "unknown";

    console.log(`[otp] verification requested for ${email} (not implemented yet)`);

    return Response.json({ ok: true, message: "OTP verification not implemented yet" });
}
