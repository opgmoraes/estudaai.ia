// public/auth.js
// Client helpers to integrate Supabase Auth in your front-end.
(function() {
  if (!window.__ENV__) {
    console.error("env.js not loaded. Create public/env.js from env.example.js");
    return;
  }
  const supabase = window.supabase.createClient(window.__ENV__.SUPABASE_URL, window.__ENV__.SUPABASE_ANON_KEY);
  window.$supabase = supabase;

  async function requireActiveSubscription() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("not-authenticated");

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (error) throw error;
    if (!profile || profile.status !== "ativo") throw new Error("inactive-plan");
    return { user, profile };
  }

  async function fazerLogin(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
    const gate = await requireActiveSubscription().catch(e => { throw e; });
    return gate;
  }

  async function sair() { await supabase.auth.signOut(); }

  async function recuperarSenha(email, redirectTo = '/primeiro-acesso.html') {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
    return data;
  }

  window.Auth = { fazerLogin, sair, recuperarSenha, requireActiveSubscription };
})();