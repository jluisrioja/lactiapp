const CACHE_NAME = 'lactiapp-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/icons/icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Forzar actualización inmediata
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Borrar cachés antiguos al activar
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Interceptar fetch y responder desde caché si existe
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
