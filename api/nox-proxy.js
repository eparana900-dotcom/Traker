// Proxy gratuito (Cloudflare Workers) para esconder a chave da Groq.
// 1) Crie um Worker, cole este código.  2) Settings > Variables > Secret: GROQ_API_KEY
// 3) (opcional) ALLOWED_ORIGIN = https://seusite.com   4) Coloque a URL do Worker em NOX_CONFIG.proxyUrl.
export default {
  async fetch(req, env) {
    const origin = env.ALLOWED_ORIGIN || '*';
    const cors = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return new Response('Método não permitido', { status: 405, headers: cors });
    let body;
    try { body = await req.json(); } catch { return new Response('JSON inválido', { status: 400, headers: cors }); }
    // limita o que o cliente pode pedir
    const safe = {
      model: 'llama-3.3-70b-versatile',
      stream: true,
      temperature: Math.min(Number(body.temperature) || 0.5, 1),
      max_tokens: Math.min(Number(body.max_tokens) || 500, 600),
      messages: Array.isArray(body.messages) ? body.messages.slice(-14) : []
    };
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.GROQ_API_KEY },
      body: JSON.stringify(safe)
    });
    return new Response(r.body, { status: r.status, headers: { ...cors, 'Content-Type': r.headers.get('Content-Type') || 'text/event-stream' } });
  }
};
