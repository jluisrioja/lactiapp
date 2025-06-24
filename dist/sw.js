const CACHE_NAME = 'lactiapp-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/icons/icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Instala y guarda en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Intercepta peticiones y responde desde caché si está disponible
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
