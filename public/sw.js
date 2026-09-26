/* ============================================================
   capability-check service worker — offline app shell.
   - install: precache the app shell
   - activate: drop old cache versions, claim clients
   - fetch: network-first for all same-origin GETs (navigations fall
     back to cached '/'), cache is the offline fallback only
   ============================================================ */
const VERSION = 'cc-v4';
const SHELL = ['/', '/index.html', '/styles/main.css', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  // Deliberately no skipWaiting() here — an updated worker waits until
  // the page confirms the update and posts SKIP_WAITING.
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('cc-') && k !== VERSION)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) {
    return;
  }
  /* Network-first for everything same-origin: code and markup must never
     serve stale after a deploy (a cached gate-less app.js would bypass the
     start gate entirely). The cache is the offline fallback, not the source
     of truth. */
  const isNav = req.mode === 'navigate';
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches
          .match(req)
          .then(
            (hit) =>
              hit ||
              (isNav
                ? caches.match('/')
                : Promise.reject(new Error('offline and not cached'))),
          ),
      ),
  );
});
