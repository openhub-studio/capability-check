/* Probe service worker for capability-check.
   Registers to prove ServiceWorker support, is unregistered by the
   check immediately after. Intercepts nothing — no fetch handler. */
self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});
