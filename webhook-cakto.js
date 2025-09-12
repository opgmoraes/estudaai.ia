import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email não informado" });

  try {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: "https://SEUSITE.vercel.app/primeiro-acesso.html"
    });
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
