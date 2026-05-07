/**
 * ============================================================
 * GROWTHCRESTAI — Cloudflare Worker Proxy (OpenRouter Version)
 * ============================================================
 *
 * HOW TO DEPLOY:
 * 1. Go to https://workers.cloudflare.com → Create Worker
 * 2. Delete all default code
 * 3. Paste this entire file
 * 4. Click "Save and Deploy"
 *
 * ADD YOUR OPENROUTER API KEY:
 * Worker → Settings → Variables → Add Variable
 *   Name:  OPENROUTER_API_KEY
 *   Value: sk-or-v1-xxxxxxxxxxxxxxxx   ← your OpenRouter key
 *   Toggle "Encrypt" ON → Save
 *
 * GET KEY: https://openrouter.ai/keys
 * ============================================================
 */

export default {
  async fetch(request, env) {

    const ALLOWED_ORIGINS = [
      'https://growthcrestai.com',
      'https://www.growthcrestai.com',
      'http://growthcrestai.com',
      'http://www.growthcrestai.com',
      'http://localhost',
      'http://localhost:3000',
    ];

    const origin = request.headers.get('Origin') || '';
    const isAllowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o));

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': isAllowed ? origin : 'null',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    if (!isAllowed) {
      return new Response(JSON.stringify({ error: 'Forbidden origin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const body = await request.json();

      // OpenRouter API call
      const response = await fetch('https://growthcrestai-proxy.sagarrajput768.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://growthcrestai.com',
          'X-Title': 'GrowthCrestAI Assistant',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-sonnet-4-5',
          messages: body.messages,
          max_tokens: 800,
        }),
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': isAllowed ? origin : 'null',
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        }
      });
    }
  }
};
