const CACHE_NAME = 'mathfun-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/materi/penjumlahan.html',
  '/materi/pengurangan.html',
  '/materi/jarimatika.html',
  '/materi/latihan.html',
  '/game/balon.html',
  '/game/memory.html',
  '/game/puzzle.html',
  '/dashboard.html',
  '/css/style.css',
  '/js/app.js',
  '/js/game.js',
  '/js/jarimatika.js',
  '/manifest.json',
  '/assets/images/icon-192.svg',
  '/assets/images/icon-512.svg'
];

const CACHE_DYNAMIC = 'mathfun-dynamic-v1';

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('MathFun: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.log('MathFun: Cache install failed:', err))
  );
});

// Activate event
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
      .then(() => self.clients.claim())
  );
  console.log('MathFun: Service Worker Activated');
});

// Fetch event - Cache first, then network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Skip invalid responses
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone and cache the response
            const responseClone = response.clone();
            caches.open(CACHE_DYNAMIC)
              .then((cache) => {
                cache.put(request, responseClone);
              });

            return response;
          });
      })
      .catch(() => {
        // Return offline page only for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: 'Ayo belajar matematika sekarang! 🧮',
    icon: '/assets/images/icon-192.svg',
    badge: '/assets/images/icon-192.svg',
    vibrate: [100, 50, 100],
    tag: 'mathfun-notification'
  };

  event.waitUntil(
    self.registration.showNotification('MathFun Indonesia', options)
  );
});

// Message event for skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('MathFun Indonesia - Service Worker Loaded');
