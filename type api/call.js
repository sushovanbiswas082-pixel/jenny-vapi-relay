// api/call.js
// A tiny relay so Jenny's app can trigger Vapi calls from the browser
// without ever exposing your Vapi API key client-side.
//
// Deploy this on Vercel (free tier is fine). Set VAPI_API_KEY as an
// environment variable in your Vercel project settings — never put it
// in this file or commit it anywhere.

export default async function handler(req, res) {
  // Allow the browser (Jenny's app) to call this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Use POST' });
  }

  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'VAPI_API_KEY is not set on the server' });
  }

  const { assistantId, phoneNumberId, customer } = req.body || {};

  if (!assistantId || !phoneNumberId || !customer || !customer.number) {
    return res.status(400).json({
      message: 'assistantId, phoneNumberId, and customer.number are all required'
    });
  }

  try {
    const vapiRes = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ assistantId, phoneNumberId, customer })
    });

    const data = await vapiRes.json();
    return res.status(vapiRes.status).json(data);
  } catch (err) {
    return res.status(502).json({ message: 'Could not reach Vapi', error: String(err) });
  }
}
