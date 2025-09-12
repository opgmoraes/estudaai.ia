// /api/payment-webhook.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).end();
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  try{
    const evt = req.body; // adapte ao seu provedor de checkout
    // Espera: { event: 'subscription_active', email, name, plan, current_period_end }
    const { email, name, plan, current_period_end } = evt;

    if (!email) return res.status(400).json({ error: 'email ausente' });

    // 1) Garante usuário
    let { data: userData } = await supabase.auth.admin.listUsers({ email });
    let user = userData?.users?.[0];

    if (!user){
      const invite = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { nome: name || '' },
        redirectTo: `${process.env.PUBLIC_SITE_URL}/primeiro-acesso.html?email=${encodeURIComponent(email)}`
      });
      if (invite.error) throw invite.error;
      user = invite.data?.user;
    }

    // 2) Marca/Atualiza assinatura
    const { error: upsertErr } = await supabase
      .from('subscriptions')
      .upsert({ user_id: user.id, plan, status: 'active', current_period_end })
      .eq('user_id', user.id);

    if (upsertErr) throw upsertErr;

    return res.status(200).json({ ok: true });
  }catch(e){
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
