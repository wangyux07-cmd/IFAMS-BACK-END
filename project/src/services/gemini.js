const { URL } = require('url');

async function generateText(message) {
  const customUrl = process.env.GEMINI_API_URL;
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!customUrl && !apiKey) throw new Error('Gemini API not configured (GEMINI_API_URL or GEMINI_API_KEY missing)');

  // Use global fetch (Node 18+) if available
  const fetchFn = typeof fetch !== 'undefined' ? fetch : (await import('node-fetch')).default;

  // If a custom URL is provided, call it with Bearer auth
  if (customUrl) {
    const body = { message };
    if (model) body.model = model;
    const res = await fetchFn(customUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini API error: ${res.status} ${text}`);
    }
    const json = await res.json();
    const text = json?.output?.[0]?.content || json?.text || json?.data?.[0]?.content || json?.result || JSON.stringify(json);
    return text;
  }

  // Otherwise default to Google Generative Language REST API using API key
  // Support two Google calling styles:
  // - x-goog-api-key header + generateContent endpoint with contents.parts[].text body
  // - legacy generateText endpoint with key query param
  const googleApiKey = process.env.GEMINI_GOOGLE_API_KEY || apiKey;
  if (googleApiKey) {
    const googleUrl = customUrl || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const body = {
      contents: [
        { parts: [ { text: message } ] }
      ]
    };
    const res = await fetchFn(googleUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': googleApiKey },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini API error: ${res.status} ${text}`);
    }
    const json = await res.json();
    // Parse candidate text from common shapes
    const candidate = json?.candidates?.[0] || json?.outputs?.[0] || json?.output?.[0];
    const text = candidate?.content?.[0]?.text || candidate?.content?.[0]?.summary || candidate?.text || json?.candidates?.[0]?.content?.[0]?.text || JSON.stringify(json);
    return text;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta2/models/${model}:generateText?key=${apiKey}`;
  const body = { prompt: { text: message } };
  const res = await fetchFn(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${text}`);
  }
  const json = await res.json();

  // Parse common Google Generative Language shapes
  const candidate = json?.candidates?.[0] || json?.output?.[0];
  const text = candidate?.content || candidate?.output?.content || candidate?.text || json?.candidates?.[0]?.output || json?.outputs?.[0]?.content || json?.text || JSON.stringify(json);
  return text;
}

module.exports = { generateText };
