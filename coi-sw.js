// coi-sw.js — injects the COOP/COEP headers needed for SharedArrayBuffer
// on hosts that don't let you configure headers (e.g. GitHub Pages).
// Register from the page; it reloads once, then all responses carry the headers.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Pass through range/cached-only requests untouched:
  if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') return;

  e.respondWith((async () => {
    const res = await fetch(req);
    // Opaque responses (status 0) can't have headers modified:
    if (res.status === 0) return res;

    const headers = new Headers(res.headers);
    headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  })());
});
