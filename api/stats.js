// Vercel Serverless Function: /api/stats
// Returns aggregated telemetry stats for private admin dashboard

export default async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Password verification (default: 'kinetix2026' or process.env.ADMIN_PASSWORD)
  const expectedPassword = process.env.ADMIN_PASSWORD || 'kinetix2026';
  const providedPassword = req.query.password || req.headers['x-admin-password'];

  if (providedPassword !== expectedPassword) {
    res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });
    return;
  }

  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  // 1. If Vercel KV / Upstash is configured, pull full cloud stats
  if (kvUrl && kvToken) {
    try {
      const pipelineRes = await fetch(`${kvUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          ['GET', 'kinetix:downloads:total'],
          ['SCARD', 'kinetix:downloads:unique_visitors'],
          ['GET', 'kinetix:downloads:mac_dmg'],
          ['GET', 'kinetix:downloads:windows_exe'],
          ['GET', 'kinetix:downloads:framer_token'],
          ['LRANGE', 'kinetix:downloads:events', 0, 99]
        ])
      });

      if (pipelineRes.ok) {
        const rawResults = await pipelineRes.json();
        const total = parseInt(rawResults[0]?.result || 0, 10);
        const unique = parseInt(rawResults[1]?.result || 0, 10);
        const mac = parseInt(rawResults[2]?.result || 0, 10);
        const win = parseInt(rawResults[3]?.result || 0, 10);
        const token = parseInt(rawResults[4]?.result || 0, 10);
        const rawEvents = rawResults[5]?.result || [];

        const recentEvents = rawEvents.map((str) => {
          try {
            return typeof str === 'string' ? JSON.parse(str) : str;
          } catch {
            return null;
          }
        }).filter(Boolean);

        return res.status(200).json({
          source: 'vercel_kv',
          totalDownloads: total,
          uniqueVisitors: unique,
          platforms: {
            mac_dmg: mac,
            windows_exe: win,
            framer_token: token
          },
          recentEvents
        });
      }
    } catch (kvErr) {
      console.warn('Failed to query Vercel KV, falling back to memory:', kvErr);
    }
  }

  // 2. Fallback to memory instance
  const memoryEvents = global._kinetixMemoryEvents || [];
  const uniqueVisitors = new Set(memoryEvents.map(e => e.visitorId)).size;
  const platforms = {
    mac_dmg: memoryEvents.filter(e => e.platform === 'mac_dmg').length,
    windows_exe: memoryEvents.filter(e => e.platform === 'windows_exe').length,
    framer_token: memoryEvents.filter(e => e.platform === 'framer_token').length,
  };

  res.status(200).json({
    source: 'serverless_memory',
    totalDownloads: memoryEvents.length,
    uniqueVisitors,
    platforms,
    recentEvents: memoryEvents.slice(0, 100)
  });
}
