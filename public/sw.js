const CACHE_NAME = 'tile-cache-v1';
const TILE_URL_PATTERN = /\/api\/tiles\/|\/tiles\//;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (TILE_URL_PATTERN.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            // Return cached response immediately
            // Optionally, we could fetch in background to update cache (stale-while-revalidate)
            return response;
          }

          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
             // Offline fallback for tiles? Can return a transparent tile or a specific error
             return new Response(new Blob(), { status: 404, statusText: "Offline" });
          });
        });
      })
    );
  }
});
