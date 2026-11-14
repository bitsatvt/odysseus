// Temporary Supabase auth trial: username-or-email + password login.
// Resolves a username to an email with the service role (never returned to the caller), signs in
// server-side, and returns only the session tokens, which the browser installs with auth.setSession().
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const INVALID = "Invalid username or password.";
const USERNAME_RE = /^[A-Za-z0-9_]{3,24}$/;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  let identifier: unknown, password: unknown;
  try {
    ({ identifier, password } = await req.json());
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }
  if (typeof identifier !== "string" || typeof password !== "string" || !identifier.trim() || !password) {
    return json({ error: INVALID }, 400);
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const noSession = { auth: { persistSession: false, autoRefreshToken: false } };

  let email = identifier.trim();
  if (!email.includes("@")) {
    if (!USERNAME_RE.test(email)) return json({ error: INVALID }, 400);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, noSession);
    // Case-insensitive exact match; escape "_" so it is not a LIKE wildcard.
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .ilike("username", email.replace(/_/g, "\\_"))
      .maybeSingle();
    if (!profile) return json({ error: INVALID }, 400);
    const { data, error } = await admin.auth.admin.getUserById(profile.id);
    if (error || !data.user?.email) return json({ error: INVALID }, 400);
    email = data.user.email;
  }

  // Separate anon client so the service-role client never holds a user session.
  const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, noSession);
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    // Only an unconfirmed email is worth telling the user about; everything else is generic.
    const message = error?.code === "email_not_confirmed" ? "Confirm your email before signing in." : INVALID;
    return json({ error: message }, 400);
  }

  return json({
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  });
});
