import React, { useEffect, useState } from 'react';


if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        new Notification('You will be notified when slots are available!');
      }, function(error) {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}


const App = () => {
  const [slots, setSlots] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const sendNotification = (slotCount, lastUpdate) => {
      if (Notification.permission === 'granted') {
        new Notification(`There are ${slotCount} available slots! At ${lastUpdate}`);
      }
    };
    
    const checkAvailableSlots = async () => {
      try {
        const response = await fetch('https://ttp.cbp.dhs.gov/schedulerapi/slot-availability?locationId=5020');
        const data = await response.json();

        setLastUpdate(new Date().toLocaleTimeString());
  
        if (data.availableSlots && data.availableSlots.length > 0) {
          setSlots(data.availableSlots);
          sendNotification(data.availableSlots.length, new Date().toLocaleTimeString());
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
  

  const requestNotificationPermission = () => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification('Notifications enabled! You');
        }
      });
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
