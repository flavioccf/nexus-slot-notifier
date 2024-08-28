importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page";

// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
const offlineFallbackPage = "/";

// Cache assets during the install step
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('slot-notifier-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/static/js/bundle.js',
        '/logo192.png',
        '/logo512.png',
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    self.clients.claim()
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Fetch assets from cache
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        // Try to get the response from the preloadResponse promise
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }

        // Try to get the response from the cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, fetch from network
        return fetch(event.request);
      })()
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});

self.addEventListener('message', function(event) {
  const data = event.data;
  console.log('Received message from main thread', data);
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'path-to-icon.png',
  });
});

self.addEventListener('push', function(event) {
  const data = event.data.json();
  console.log('Received push event', data);
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'path-to-icon.png',
  });
});