const CACHE_NAME = 'eduspace-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
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
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache API calls - just pass through
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Skip caching for external resources (like Vercel speed insights)
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Cache static assets only
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        // Return original response for opaque responses (like external scripts)
        if (!response || response.type === 'opaque') {
          return response;
        }
        if (response.status !== 200) {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      }).catch((error) => {
        // Handle network errors gracefully - return a fallback or nothing
        console.warn('SW fetch failed:', error.message);
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});