// Shared protection for the API proxies.
//
// Moving the keys to the server stops anyone from STEALING them. It does not
// by itself stop someone from CALLING these endpoints and spending the credits
// anyway, so each proxy applies the checks below. None of this is bulletproof
// — an attacker can forge an Origin header and rotate IPs — but it turns a
// permanently stolen key into a rate-limited endpoint you can switch off.

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

// Per-instance, so a serverless fleet enforces this per warm instance rather
// than globally. Good enough to stop a single hot caller; swap in Upstash or
// Vercel KV if this ever needs to be exact.
const hits = new Map();

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (Array.isArray(fwd) ? fwd[0] : fwd || '').split(',')[0].trim()
    || req.socket?.remoteAddress || 'unknown';
}

function rateLimited(req) {
  const ip = clientIp(req);
  const now = Date.now();
  const seen = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  seen.push(now);
  hits.set(ip, seen);
  if (hits.size > 5000) hits.clear(); // crude ceiling so this cannot grow forever
  return seen.length > MAX_PER_WINDOW;
}

function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // same-origin fetches often omit it
  try {
    const { hostname } = new URL(origin);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    const host = (req.headers.host || '').split(':')[0];
    return hostname === host || hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

// Returns true when it has already answered and the caller should stop.
function reject(req, res, { method = 'POST' } = {}) {
  if (req.method !== method) {
    res.status(405).json({ error: 'Method not allowed' });
    return true;
  }
  if (!originAllowed(req)) {
    res.status(403).json({ error: 'Forbidden' });
    return true;
  }
  if (rateLimited(req)) {
    res.setHeader('Retry-After', '60');
    res.status(429).json({ error: 'Too many requests, slow down' });
    return true;
  }
  return false;
}

module.exports = { reject, clientIp };
