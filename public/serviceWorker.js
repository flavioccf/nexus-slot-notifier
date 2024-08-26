self.addEventListener('message', function(event) {
  const data = event.data;
  console.log('Received message from main thread', data);
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'path-to-icon.png',
  });
});
