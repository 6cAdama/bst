const CACHE_NAME = 'gestclasse-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/vite.svg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Network first, fall back to cache strategy
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});