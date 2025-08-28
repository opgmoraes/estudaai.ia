// /api/webhook-cakto.js  (Vercel Serverless Function - CommonJS)
const { createClient } = require('@supabase/supabase-js');

// Single client reused by the function runtime
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Optional: simple shared-secret check (configure the same secret in Cakto header "x-webhook-secret")
function verifySecret(req) {
  const configured = process.env.WEBHOOK_SECRET;
  if (!configured) return true; // not enforced
  const got = req.headers['x-webhook-secret'] || req.headers['X-Webhook-Secret'];
  return got && got === configured;
}

// Normalize fields from Cakto (adjust if they send different keys)
function parseCaktoEvent(evt) {
  const email =
    (evt.customer && evt.customer.email) ||
    evt.email ||
    (evt.payer && evt.payer.email) ||
    null;

  // plano may come as code or name; normalize to 'mensal' | 'trimestral' | 'anual'
  const rawPlan =
    (evt.plan && (evt.plan.code || evt.plan.name)) ||
    evt.plan ||
    (evt.subscription && evt.subscription.plan) ||
    "";
  const planNorm = /tri|3m/i.test(rawPlan)
    ? "trimestral"
    : /anu|12m|year/i.test(rawPlan)
    ? "anual"
    : "mensal";

  // status normalize to 'pago' | 'cancelado' | 'expirado'
  const rawStatus = (evt.status || evt.subscription_status || evt.event || "").toLowerCase();
  const statusNorm = /(paid|approved|active|success)/i.test(rawStatus)
    ? "pago"
    : /(cancel|canceled|cancelled)/i.test(rawStatus)
    ? "cancelado"
    : /(expire|expired)/i.test(rawStatus)
    ? "expirado"
    : rawStatus || "pago";

  return { email, plano: planNorm, status: statusNorm };
}

function validadeDias(plano) {
  if (plano === "trimestral") return 90;
  if (plano === "anual") return 365;
  return 30;
}

function randomToken(len = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let t = "";
  for (let i = 0; i < len; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Método não permitido");
  try {
    if (!verifySecret(req)) return res.status(401).json({ error: "Invalid webhook secret" });
    const evento = req.body || {};
    const { email, plano, status } = parseCaktoEvent(evento);

    if (!email) return res.status(400).json({ error: "Email ausente no payload" });

    // When paid/approved -> activate
    if (status === "pago") {
      const vDias = validadeDias(plano);
      const agora = new Date();
      const fim = new Date(Date.now() + vDias * 24 * 60 * 60 * 1000);

      // 1) Try to create user (if already exists, invite or ignore error)
      let createdUserId = null;
      const tempPass = Math.random().toString(36).slice(-10);

      const create = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        password: tempPass,
      });

      if (create?.data?.user?.id) {
        createdUserId = create.data.user.id;
      } else {
        // If already exists, try to send invite (reset) email
        await supabase.auth.admin.inviteUserByEmail(email).catch(() => {});
      }

      // 2) Upsert profile by email (auth_user_id if we have it)
      await supabase.from("profiles").upsert({
        email,
        auth_user_id: createdUserId,
        plano,
        status: "ativo",
        data_inicio: agora.toISOString(),
        data_fim: fim.toISOString(),
      }, { onConflict: "email" });

      // 3) Insert first-access token (valid for 24h)
      const token = randomToken(12);
      await supabase.from("access_tokens").insert({
        token,
        expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        usado: false,
        // set user_id by joining to profile via email (PostgREST upsert can't return id & use it directly, so do in a second query)
      });

      // Tie token to profile via RPC (or do a select to fetch profile.id)
      const { data: profile } = await supabase.from("profiles").select("id").eq("email", email).single();
      if (profile?.id) {
        await supabase.from("access_tokens").update({ user_id: profile.id }).is("user_id", null).eq("token", token);
      }

      // Optionally: send email yourself with token or rely on Supabase invite email
      console.log("✅ Pagamento confirmado:", { email, plano });
    }

    // When canceled or expired -> inactivate
    if (status === "cancelado" || status === "expirado") {
      await supabase.from("profiles").update({ status: "inativo" }).eq("email", email);
      console.log("⚠️ Assinatura desativada:", email);
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Erro no webhook:", e);
    return res.status(500).json({ error: e.message });
  }
};