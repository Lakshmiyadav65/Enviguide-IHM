// api/contact.js — Vercel Serverless Function (CommonJS)
// Emails "Book a demo" form submissions to our inbox via Resend (https://resend.com).
// Environment variables (Vercel Settings → Environment Variables):
//   RESEND_API_KEY     — API key from the Resend dashboard (required)
//   CONTACT_TO_EMAIL   — optional override of the inbox that receives submissions (comma-separate for several)
//   CONTACT_FROM_EMAIL — optional override of the sender; its domain must be verified in Resend

// [key, label, max length, required]
const FIELDS = [
  ['firstName', 'First name', 100, true],
  ['lastName', 'Last name', 100, true],
  ['email', 'Email', 200, true],
  ['phone', 'Phone', 50, true],
  ['company', 'Company', 200, true],
  ['fleetSize', 'Fleet size', 50, true],
  ['role', 'Role', 100, true],
  ['flag', 'Flag state', 100, false],
  ['notes', 'Wants to see', 1000, false]
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }
  body = body || {};

  // Honeypot: the "website" field is hidden from people, so only bots fill it in. Pretend it worked.
  if (body.website) return res.status(200).json({ ok: true });

  const data = {};
  for (const [key, , max, required] of FIELDS) {
    const value = typeof body[key] === 'string' ? body[key].replace(/\s+/g, ' ').trim() : '';
    if (required && !value) return res.status(400).json({ error: `Missing field: ${key}` });
    if (value.length > max) return res.status(400).json({ error: `Field too long: ${key}` });
    data[key] = value;
  }
  if (!EMAIL_RE.test(data.email)) return res.status(400).json({ error: 'Invalid email address' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not set in Vercel environment variables');
    return res.status(500).json({ error: 'Email service is not configured' });
  }
  const to = process.env.CONTACT_TO_EMAIL || 'oceanledgerofficial@gmail.com';
  // Resend's test sender until maricomx.com is verified in Resend; then switch to 'OceanLedger IHMM <noreply@maricomx.com>'.
  const from = process.env.CONTACT_FROM_EMAIL || 'OceanLedger IHMM <onboarding@resend.dev>';

  const rows = FIELDS.filter(([key]) => data[key]).map(([key, label]) => [label, data[key]]);
  const cell = 'padding:8px 12px;border-bottom:1px solid #e2e8f0;';
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#0f172a">
<h2 style="color:#071c37;margin:0 0 16px">New demo request</h2>
<table style="border-collapse:collapse">
${rows.map(([label, value]) => `<tr><td style="${cell}color:#64748b">${label}</td><td style="${cell}">${escapeHtml(value)}</td></tr>`).join('\n')}
</table>
<p style="color:#64748b;font-size:13px;margin-top:16px">Reply to this email to respond to ${escapeHtml(data.firstName)} directly.</p>
</div>`;
  const text = `New demo request\n\n${rows.map(([label, value]) => `${label}: ${value}`).join('\n')}`;

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: to.split(',').map((s) => s.trim()).filter(Boolean),
        reply_to: data.email,
        subject: `Demo request: ${data.firstName} ${data.lastName} (${data.company})`,
        html,
        text
      })
    });

    if (!resendRes.ok) {
      console.error(`Resend error (${resendRes.status}):`, await resendRes.text());
      return res.status(502).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend request failed:', err.message);
    return res.status(502).json({ error: 'Failed to send email' });
  }
};
