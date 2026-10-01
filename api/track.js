// Vercel Serverless Function: /api/track
// Records download telemetry and updates download counts

// In-memory cache for warm serverless instances
let memoryEvents = global._kinetixMemoryEvents || [];
global._kinetixMemoryEvents = memoryEvents;

export default async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // use string as-is
      }
    }

    const { visitorId, platform, referrer, screen } = body || {};

    const event = {
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      visitorId: visitorId || 'anon_guest',
      platform: platform || 'unknown',
      timestamp: new Date().toISOString(),
      referrer: referrer || req.headers['referer'] || 'direct',
      screen: screen || 'unknown',
      ipCountry: req.headers['x-vercel-ip-country'] || 'global',
      userAgent: req.headers['user-agent'] || 'unknown'
    };

    // 1. Add to instance memory (capped at 500)
    memoryEvents.unshift(event);
    if (memoryEvents.length > 500) {
      memoryEvents.pop();
    }

    // 2. If Vercel KV / Upstash is configured, persist automatically
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (kvUrl && kvToken) {
      try {
        // Multi-command pipeline to Upstash REST API
        await fetch(`${kvUrl}/pipeline`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([
            ['INCR', 'kinetix:downloads:total'],
            ['INCR', `kinetix:downloads:${platform}`],
            ['SADD', 'kinetix:downloads:unique_visitors', event.visitorId],
            ['LPUSH', 'kinetix:downloads:events', JSON.stringify(event)],
            ['LTRIM', 'kinetix:downloads:events', 0, 499]
          ])
        });
      } catch (kvErr) {
        console.warn('Vercel KV pipeline error:', kvErr);
      }
    }

    res.status(200).json({ success: true, eventId: event.id });
  } catch (err) {
    console.error('Track error:', err);
    res.status(500).json({ error: 'Failed to record event' });
  }
}
