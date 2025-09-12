import { createClient } from "@supabase/supabase-js";

function isPaid(statusRaw = "") {
  const s = String(statusRaw).toLowerCase();
  return ["paid", "approved", "succeeded", "active", "completed"].some(v => s.includes(v));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const secret = process.env.CAKTO_WEBHOOK_SECRET;
  const got = req.headers["x-webhook-secret"] || req.query.secret;
  if (secret && secret !== got) return res.status(401).send("Invalid secret");

  const body = req.body ?? {};
  const email =
    body?.data?.customer?.email ||
    body?.data?.buyer?.email ||
    body?.data?.email ||
    body?.customer_email ||
    body?.email;

  const plan = body?.data?.plan || "starter";
  const status = body?.data?.status || body?.status || "";
  const periodEnd = body?.data?.current_period_end || null;

  if (!email) return res.status(400).json({ error: "Email ausente no evento" });
  if (!isPaid(status)) return res.status(200).json({ ok: true, skipped: "Pagamento não aprovado ainda" });

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let userId = null;
  const { data: invited } = await supabase.auth.admin.inviteUserByEmail(email, { data: { plan } });
  if (invited?.user?.id) {
    userId = invited.user.id;
  }

  const payload = {
    user_id: userId,
    email,
    plan,
    status: "active",
    valid_until: periodEnd ? new Date(periodEnd).toISOString() : null,
  };

  await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
  return res.status(200).json({ ok: true, user_id: userId, email, plan });
}
