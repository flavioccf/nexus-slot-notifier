importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// Cache assets during the install step

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

const checkAvailableSlots = async () => {
  try {
    const response = await fetch(
      "https://ttp.cbp.dhs.gov/schedulerapi/slot-availability?locationId=5020"
    );
    const data = await response.json();
    const time = new Date().toLocaleTimeString();

    const dataWithTime = {
      ...data,
      fetchTime: time,
    };

    return dataWithTime;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

setInterval(async () => {
  const data = await checkAvailableSlots();
  if (data.availableSlots.length > 0) {
    self.registration.showNotification(
      `There are ${data.availableSlots.length} available slots!`,
      {
        body: `At ${data.fetchTime}`,
        icon: 'path-to-icon.png',
      }
    );
      // postMessage to main thread
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          title: `There are ${data.availableSlots.length} available slots!`,
          body: `At ${data.fetchTime}`,
          details: data,
        });
      });
    });
  }
}, 500);