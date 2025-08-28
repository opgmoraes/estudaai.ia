// /api/ai-proxy.js  (Proxy para esconder sua chave Mistral no backend)
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Método não permitido");
  try {
    const { prompt, maxTokens = 2000, temperature = 0.7, model = "mistral-7b-instruct" } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "prompt é obrigatório" });

    const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        temperature
      })
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data });
    }
    return res.status(200).json({ content: data.choices?.[0]?.message?.content || "" });
  } catch (e) {
    console.error("ai-proxy error:", e);
    return res.status(500).json({ error: e.message });
  }
};