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

// Fetch assets from cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('message', function(event) {
  const data = event.data;
  console.log('Received message from main thread', data);
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'path-to-icon.png',
  });
});
