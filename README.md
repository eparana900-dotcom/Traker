# TRAKER + Nox (Vercel + Groq)

Estrutura:
- `index.html`  → site (estático)
- `api/chat.js` → função que fala com a Groq usando a chave secreta

## Publicar
1. Suba esta pasta num repositório do GitHub e importe na Vercel (ou rode `npx vercel` na pasta).
2. Em **Settings → Environment Variables** crie `GROQ_API_KEY` com a sua chave (gsk_...) e faça **Redeploy**.
3. (Opcional) `GROQ_MODEL` para trocar o modelo (padrão: openai/gpt-oss-120b).

Nunca coloque a chave no `index.html`. Se a chave já foi exposta em algum chat/print, gere outra em console.groq.com.
