/**
 * ============================================================
 * GROWTHCRESTAI — Cloudflare Worker (OpenRouter Version)
 * ============================================================
 *
 * SETUP:
 * 1. Deploy this Worker on Cloudflare
 * 2. Add secret:
 *    wrangler secret put OPENROUTER_API_KEY
 * 3. Use your Worker URL in WordPress chatbot
 * ============================================================
 */

export default {
  async fetch(request, env) {

    // اجازت فقط اپنے ڈومین سے
    const ALLOWED_ORIGINS = [
      'https://growthcrestai.com',
      'https://www.growthcrestai.com',
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

    // Only POST allowed
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Block unknown origins
    if (!isAllowed) {
      return new Response('Forbidden', { status: 403 });
    }

    try {
      const body = await request.json();

      // Call OpenRouter API
      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://growthcrestai.com',
          'X-Title': 'GrowthCrest AI Chatbot'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini', // change anytime
          messages: body.messages || [
            { role: "user", content: body.message || "Hello" }
          ],
          max_tokens: 800,
          temperature: 0.7
        })
      });

      const data = await aiResponse.json();

      // Extract reply safely
      const reply =
        data?.choices?.[0]?.message?.content ||
        "Sorry, I couldn't generate a response.";

      return new Response(JSON.stringify({ reply }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({
        error: err.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin,
        }
      });
    }
  }
};
