const CACHE_NAME = 'umbrella-system-v1';
const urlsToCache = [
  '/',
  '/borrow',
  '/return',
  '/manifest.json',
  // จะ cache static assets โดยอัตโนมัติ
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // Cache first strategy สำหรับ static assets
  if (event.request.destination === 'script' || 
      event.request.destination === 'style' ||
      event.request.destination === 'document') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
    );
  }
  
  // Network first สำหรับ Firebase API calls
  if (event.request.url.includes('firebaseio.com')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // ถ้า network ไม่ได้ ให้แสดง cached data
          return new Response(
            JSON.stringify({ offline: true }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
  }
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
