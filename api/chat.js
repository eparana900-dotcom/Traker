// Vercel Serverless Function — proxy seguro para a Groq.
// Configure GROQ_API_KEY em Vercel > Project > Settings > Environment Variables.
export const config = { runtime: 'edge' };

const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const MAX_CHARS = 1500;      // por mensagem
const MAX_MESSAGES = 14;

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Método não permitido', { status: 405 });
  if (!process.env.GROQ_API_KEY) return new Response('GROQ_API_KEY não configurada', { status: 500 });

  let body;
  try { body = await req.json(); } catch { return new Response('JSON inválido', { status: 400 }); }

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter(m => m && ['system', 'user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, m.role === 'system' ? 6000 : MAX_CHARS) }))
    .slice(-MAX_MESSAGES);
  if (!messages.length) return new Response('Sem mensagens', { status: 400 });

  const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.GROQ_API_KEY },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      temperature: Math.min(Number(body.temperature) || 0.5, 1),
      max_tokens: Math.min(Number(body.max_tokens) || 1000, 1200),
      reasoning_effort: 'low',      // gpt-oss raciocina antes de responder; 'low' = rápido e barato
      include_reasoning: false,     // não envia o raciocínio ao navegador
      messages
    })
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('Content-Type') || 'text/event-stream', 'Cache-Control': 'no-store' }
  });
}
