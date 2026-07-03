// coi-sw.js — v2
// Injects COOP/COEP headers on SAME-ORIGIN responses only (that's all that's
// needed for cross-origin isolation). Cross-origin requests — including the
// very large Wasmer clang package download — pass through untouched, because
// piping big streams through a service worker is unreliable on iOS Safari.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;

  // Only touch same-origin requests; let everything else go direct:
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') return;

  e.respondWith((async () => {
    const res = await fetch(req);
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
