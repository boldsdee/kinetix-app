// Kinetix Telemetry & Download Tracker
// Generates unique anonymous visitor IDs and tracks downloads privately

const VISITOR_KEY = 'kinetix_visitor_id';
const LOCAL_EVENTS_KEY = 'kinetix_telemetry_events';

// Generate or retrieve persistent anonymous visitor ID
export function getOrCreateVisitorId() {
  if (typeof window === 'undefined') return 'server_guest';
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      const rand = Math.random().toString(36).substring(2, 10);
      const time = Date.now().toString(36).slice(-4);
      id = `vis_${rand}_${time}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return 'anon_' + Math.random().toString(36).substring(2, 8);
  }
}

// Track a download or export event
export async function trackDownload(platform) {
  const visitorId = getOrCreateVisitorId();
  const event = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    visitorId,
    platform, // 'mac_dmg' | 'windows_exe' | 'framer_token'
    timestamp: new Date().toISOString(),
    referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct',
    screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown'
  };

  // 1. Save locally for fallback aggregation
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '[]');
    existing.unshift(event);
    // Keep last 200 events locally
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch (err) {
    console.debug('Local telemetry write error:', err);
  }

  // 2. Transmit to Vercel Serverless API (/api/track)
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
      navigator.sendBeacon('/api/track', blob);
    } else {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true
      }).catch(() => {});
    }
  } catch (err) {
    console.debug('Remote telemetry ping skipped:', err);
  }

  return event;
}

// Retrieve telemetry stats for private admin dashboard
export async function fetchTelemetryStats(password = 'kinetix2026') {
  // First attempt to query Vercel Serverless API
  try {
    const res = await fetch(`/api/stats?password=${encodeURIComponent(password)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, ...data };
    }
  } catch (err) {
    console.debug('Failed to query remote stats API, falling back to local store:', err);
  }

  // Fallback: Aggregate from local storage events
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
    const events = raw ? JSON.parse(raw) : [];
    
    const uniqueVisitors = new Set(events.map(e => e.visitorId)).size;
    const platforms = {
      mac_dmg: events.filter(e => e.platform === 'mac_dmg').length,
      windows_exe: events.filter(e => e.platform === 'windows_exe').length,
      framer_token: events.filter(e => e.platform === 'framer_token').length,
    };

    return {
      success: true,
      isLocalFallback: true,
      totalDownloads: events.length,
      uniqueVisitors,
      platforms,
      recentEvents: events.slice(0, 50)
    };
  } catch {
    return {
      success: true,
      isLocalFallback: true,
      totalDownloads: 0,
      uniqueVisitors: 0,
      platforms: { mac_dmg: 0, windows_exe: 0, framer_token: 0 },
      recentEvents: []
    };
  }
}

// Export telemetry events to CSV
export function exportEventsToCSV(events = []) {
  if (!events || events.length === 0) return;
  const headers = ['Event ID', 'Visitor ID', 'Platform', 'Timestamp', 'Referrer', 'Screen'];
  const rows = events.map(e => [
    e.id,
    e.visitorId,
    e.platform,
    e.timestamp,
    `"${(e.referrer || '').replace(/"/g, '""')}"`,
    e.screen || ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `kinetix_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
