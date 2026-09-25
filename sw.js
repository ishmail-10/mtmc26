const CACHE_NAME = 'mtmc26-bbs-v30';
const ASSETS = [
  './',
  './index.html',
  './supabase_adapter.js',
  './schedule.js',
  './js/theme.js',
  './js/state.js',
  './js/utils.js',
  './js/auth/gate.js',
  './js/auth/profile.js',
  './js/ui/notifications.js',
  './js/ui/publicProfile.js',
  './js/ui/lightbox.js',
  './js/admin/admin.js',
  './js/forum/safety.js',
  './js/forum/posts.js',
  './js/forum/feed.js',
  './js/events/events.js',
  './js/campus/mess.js',
  './js/campus/rules.js',
  './js/campus/drawer.js',
  './js/campus/viva.js',
  './js/app.js',
  './hostel_rules_clean.png',
  './events.json',
  './mess_menu.json',
  './course_schedule.json',
  './foundation_course_schedule_2026.pdf',
  './manifest.json',
  './logo/logo.png',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`[SW] Failed to cache: ${url}`, err);
          })
        )
      );
    })
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
