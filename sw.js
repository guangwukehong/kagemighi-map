const CACHE = 'kagemichi-v2';
const SHELL = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Network-first for external APIs and tiles
  if (url.includes('openstreetmap') || url.includes('osrm') ||
      url.includes('nominatim') || url.includes('overpass') ||
      url.includes('googleapis')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Cache-first for app shell
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
