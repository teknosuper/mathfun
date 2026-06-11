const CACHE_NAME = 'mathfun-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/materi/penjumlahan.html',
  '/materi/pengurangan.html',
  '/materi/jarimatika.html',
  '/game/balon.html',
  '/game/memory.html',
  '/game/puzzle.html',
  '/css/style.css',
  '/js/app.js',
  '/js/game.js',
  '/js/jarimatika.js',
  '/manifest.json',
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png'
];

const CACHE_DYNAMIC = 'mathfun-dynamic-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => console.log('Cache install failed:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== CACHE_DYNAMIC)
            .map((key) => caches.delete(key))
        );
      })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_DYNAMIC)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            });
        })
        .catch(() => {
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        })
    );
  }
});

self.addEventListener('push', (event) => {
  const options = {
    body: 'Ayo belajar matematika sekarang!',
    icon: '/assets/images/icon-192.png',
    badge: '/assets/images/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('MathFun Indonesia', options)
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
