// supabaseClient.js
// Substitua as variáveis Vercel em produção (NEXT_PUBLIC_*). Em dev, pode setar diretamente.
const SUPABASE_URL = window.__ENV__?.NEXT_PUBLIC_SUPABASE_URL || "https://SEU-PROJETO.supabase.co";
const SUPABASE_ANON_KEY = window.__ENV__?.NEXT_PUBLIC_SUPABASE_ANON_KEY || "SEU_ANON_KEY";

const { createClient } = window.supabase;
window.sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
