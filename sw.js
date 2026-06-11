const CACHE_NAME = 'mathfun-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/latihan',
  '/game',
  '/materi/penjumlahan',
  '/materi/pengurangan',
  '/materi/penjumlahan-bersusun',
  '/materi/pengurangan-bersusun',
  '/materi/jarimatika',
  '/game/balon',
  '/game/memory',
  '/game/puzzle',
  '/dashboard',
  '/css/style.css',
  '/js/app.js',
  '/js/game.js',
  '/js/jarimatika.js',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(names => Promise.all(names.map(n => n !== CACHE_NAME && caches.delete(n)))));
});
