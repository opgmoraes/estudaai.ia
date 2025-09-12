// /api/check-subscription.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res){
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  // Recupera sessão do cookie (opcional: enviar supabase auth via header)
  const authHeader = req.headers.authorization || '';
  const userId = req.cookies['sb-user'] || null; // adapte se usar middleware
  // Simplificação: receba o email via query se necessário
  const email = req.query.email;

  try{
    let user = null;
    if (email){
      const u = await supabase.auth.admin.listUsers({ email });
      user = u.data?.users?.[0] || null;
    }
    if (!user) return res.status(401).json({ active:false });

    const { data, error } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single();
    if (error || !data) return res.status(200).json({ active:false });

    const active = data.status === 'active' && new Date(data.current_period_end) > new Date();
    res.status(200).json({ active, plan: data.plan, current_period_end: data.current_period_end });
  }catch(e){
    res.status(500).json({ active:false, error: e.message });
  }
}
