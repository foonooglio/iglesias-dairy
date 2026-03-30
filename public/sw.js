const CACHE_NAME = 'iglesias-dairy-v1';
const urlsToCache = ['/', '/inspection', '/cows', '/settings'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
