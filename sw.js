const CACHE_NAME = 'mtmc26-bbs-v10';
const ASSETS = [
  './',
  './index.html',
  './events.json',
  './mess_menu.json',
  './manifest.json',
  './logo/logo.png',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => k !== CACHE_NAME ? caches.delete(k) : null)
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // For navigation & document requests, use Network First so updates are seen instantly
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(event.request) || caches.match('./index.html'))
    );
    return;
  }

  // For static assets, serve from cache with network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
