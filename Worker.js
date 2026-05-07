const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://growthcrestai.com', // your site
    'X-Title': 'GrowthCrest AI Chatbot'
  },
  body: JSON.stringify({
    model: 'openai/gpt-4o-mini', // or claude, mistral, etc.
    messages: body.messages || [
      { role: "user", content: "Hello" }
    ],
    max_tokens: 800
  })
});

const data = await response.json();

const reply = data?.choices?.[0]?.message?.content || "No response";

return new Response(JSON.stringify({ reply }), {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
  }
});
