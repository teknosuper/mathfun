const CACHE_NAME = 'mathfun-v2';
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
      .catch((err) => console.log('MathFun: Cache install failed:', err))
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== CACHE_DYNAMIC)
            .map((key) => {
              console.log('MathFun: Deleting old cache:', key);
              return caches.delete(key);
            })
        );
      })
  );
  self.clients.claim();
  console.log('MathFun: Service Worker Activated');
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(request)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone and cache the response
            const responseClone = response.clone();
            caches.open(CACHE_DYNAMIC)
              .then((cache) => {
                cache.put(request, responseClone);
              });

            return response;
          })
          .catch(() => {
            // Network failed, return offline page for document requests
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            // For other requests, just fail silently
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    console.log('MathFun: Background sync triggered');
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  const options = {
    body: 'Ayo belajar matematika sekarang! 🧮',
    icon: '/assets/images/icon-192.svg',
    badge: '/assets/images/icon-192.svg',
    vibrate: [100, 50, 100],
    tag: 'mathfun-notification',
    renotify: true,
    requireInteraction: false,
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: '/'
    },
    actions: [
      {
        action: 'belajar',
        title: '🎮 Mulai Belajar',
        icon: '/assets/images/icon-192.svg'
      },
      {
        action: 'game',
        title: '🎮 Main Game',
        icon: '/assets/images/icon-192.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MathFun Indonesia', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'belajar') {
    event.waitUntil(
      clients.openWindow('/materi/penjumlahan.html')
    );
  } else if (event.action === 'game') {
    event.waitUntil(
      clients.openWindow('/game/balon.html')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message event for skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Handle PWA install prompt
  if (event.data && event.data.type === 'PWA_INSTALL') {
    if (event.data.deferredPrompt) {
      event.data.deferredPrompt.prompt();
      event.data.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('MathFun: User accepted PWA install');
        } else {
          console.log('MathFun: User dismissed PWA install');
        }
      });
    }
  }
});

console.log('MathFun Indonesia - Service Worker Loaded');
