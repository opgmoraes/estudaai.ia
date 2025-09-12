// === Supabase Config ===
const SUPABASE_URL = "https://SEU_PROJECT_URL.supabase.co"; 
const SUPABASE_ANON_KEY = "SUA_ANON_PUBLIC_KEY";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === Funções de autenticação (alteradas) ===
function mostrarTela(tela) {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("cadastro-form").classList.add("hidden");
  document.getElementById("recuperar-form").classList.add("hidden");

  if (tela === "cadastro") document.getElementById("cadastro-form").classList.remove("hidden");
  else if (tela === "recuperar") document.getElementById("recuperar-form").classList.remove("hidden");
  else document.getElementById("login-form").classList.remove("hidden");
}

async function fazerLogin() {
  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-senha").value;

  const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
  if (error) return alert("Erro: " + error.message);

  const uid = data.user.id;
  const { data: prof, error: pErr } = await sb
    .from("profiles")
    .select("status, plan, valid_until")
    .eq("user_id", uid)
    .single();

  if (pErr || !prof) {
    await sb.auth.signOut();
    return alert("Conta criada, mas sem assinatura ativa.");
  }
  if (prof.status !== "active") {
    await sb.auth.signOut();
    return alert("Sua assinatura não está ativa.");
  }

  document.getElementById("login-area").classList.add("hidden");
  document.getElementById("home-area").classList.remove("hidden");
}

function cadastrarUsuario() {
  alert("O cadastro é feito automaticamente após o pagamento. Use o botão Assinar.");
}

async function recuperarSenha() {
  const email = document.getElementById("recuperar-email").value;
  const redirectTo = window.location.origin;
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return alert("Erro: " + error.message);
  alert("Email de redefinição enviado!");
}

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    document.getElementById("login-area").classList.add("hidden");
    document.getElementById("home-area").classList.remove("hidden");
  }
});
