// /api/redeem-token.js  (Vercel Serverless Function - CommonJS)
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Método não permitido");
  try {
    const { email, token, new_password } = req.body || {};
    if (!email || !token || !new_password) {
      return res.status(400).json({ error: "Campos obrigatórios: email, token, new_password" });
    }

    // Find profile
    const { data: profile, error: perr } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();
    if (perr || !profile) return res.status(404).json({ error: "Perfil não encontrado" });

    // Validate token
    const { data: tok, error: terr } = await supabase
      .from("access_tokens")
      .select("*")
      .eq("user_id", profile.id)
      .eq("token", token)
      .is("usado", false)
      .gt("expira_em", new Date().toISOString())
      .single();
    if (terr || !tok) return res.status(400).json({ error: "Token inválido ou expirado" });

    // If user does not exist in auth yet, create; else update password
    if (!profile.auth_user_id) {
      const create = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        password: new_password,
      });
      if (create?.data?.user?.id) {
        await supabase.from("profiles").update({ auth_user_id: create.data.user.id }).eq("id", profile.id);
      } else {
        return res.status(500).json({ error: "Falha ao criar usuário de autenticação" });
      }
    } else {
      await supabase.auth.admin.updateUserById(profile.auth_user_id, { password: new_password });
    }

    // Mark token as used
    await supabase.from("access_tokens").update({ usado: true }).eq("id", tok.id);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("redeem-token error:", e);
    return res.status(500).json({ error: e.message });
  }
};