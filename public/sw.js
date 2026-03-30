const CACHE_NAME = 'iglesias-dairy-v5';
const urlsToCache = ['/', '/inspection', '/cows', '/settings'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network first for HTML pages — always get fresh content
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // Cache first for static assets (JS, CSS, images)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
