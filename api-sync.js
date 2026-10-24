// Vercel serverless function: stores one JSON blob per secret sync code in Upstash Redis
// (Vercel Marketplace "Upstash Redis" / KV). The code is hashed, so the database never holds it.
import { createHash } from 'node:crypto';

const MAX_BYTES = 900000;

async function redis(cmd) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd)
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || 'Database error');
  return j.result;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return res.status(501).json({ error: 'Sync is not configured on this deployment.' });

  const code = String(req.headers['x-sync-code'] || '').trim();
  if (code.length < 16) return res.status(400).json({ error: 'Invalid sync code.' });
  const key = 'sculpt:' + createHash('sha256').update(code).digest('hex');

  try {
    if (req.method === 'GET') {
      const v = await redis(['GET', key]);
      return res.status(200).json({ data: v ? JSON.parse(v) : null });
    }
    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body || typeof body.data !== 'object' || body.data === null) {
        return res.status(400).json({ error: 'Missing data.' });
      }
      const json = JSON.stringify(body.data);
      if (json.length > MAX_BYTES) return res.status(413).json({ error: 'Data too large.' });
      await redis(['SET', key, json]);
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (e) {
    return res.status(500).json({ error: 'Sync service error.' });
  }
}
