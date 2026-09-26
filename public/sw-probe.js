/* Probe service worker for capability-check.
   Registered at scope /__cc_probe__/ by the Service Worker check, then
   unregistered immediately. Intercepts nothing — no fetch handler. */
self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});
