// /api/subscription-cron.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res){
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) return res.status(401).end();
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const now = new Date().toISOString();
  const { data, error } = await supabase.from('subscriptions')
    .update({ status: 'expired' })
    .lt('current_period_end', now)
    .neq('status', 'expired');
  return res.status(200).json({ ok: !error, updated: data?.length || 0 });
}
