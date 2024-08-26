import React, { useEffect, useState } from 'react';


if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(error) {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}


const App = () => {
  const [slots, setSlots] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const checkAvailableSlots = async () => {
      try {
        const response = await fetch('https://ttp.cbp.dhs.gov/schedulerapi/slot-availability?locationId=5020');
        const data = await response.json();

        setLastUpdate(new Date().toLocaleTimeString());
  
        if (data.availableSlots && data.availableSlots.length > 0) {
          setSlots(data.availableSlots);
          sendNotification(data.availableSlots.length);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    // Check for available slots every 30 seconds
    const interval = setInterval(checkAvailableSlots, 15000);
  
    // Initial check
    checkAvailableSlots();
  
    return () => clearInterval(interval);
  }, []); // Empty dependency array to only run once on mount
  

  const sendNotification = (slotCount) => {
    if (Notification.permission === 'granted') {
      new Notification(`There are ${slotCount} available slots! At ${lastUpdate}`);
    }
  };

  const requestNotificationPermission = () => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  return (
    <div className="App">
      <h1>Nexus Slot Notifier</h1>
      <button onClick={requestNotificationPermission}>
        Enable Notifications
      </button>
      <p>{slots.length} slots available!</p>
      <p>Last checked: {lastUpdate}</p>
    </div>
  );
};

export default App;
