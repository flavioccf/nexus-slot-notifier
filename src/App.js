import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  ChakraProvider,
  Container,
  FormLabel,
  Heading,
  Stack,
  StackDivider,
  Switch,
  Text,
} from "@chakra-ui/react";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/serviceWorker.js").then(
      function (registration) {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
        new Notification("You will be notified when slots are available!");
      },
      function (error) {
        console.log("ServiceWorker registration failed: ", error);
      }
    );
  });
}

const App = () => {
  const [slots, setSlots] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    const sendNotification = (slotCount, lastUpdate) => {
      if (Notification.permission === "granted") {
        new Notification(
          `There are ${slotCount} available slots! At ${lastUpdate}`
        );
      }
    };

    const checkAvailableSlots = async () => {
      try {
        const response = await fetch(
          "https://ttp.cbp.dhs.gov/schedulerapi/slot-availability?locationId=5020"
        );
        const data = await response.json();
        const time = new Date().toLocaleTimeString();

        setLastUpdate(time);

        const dataWithTime = {
          ...data,
          fetchTime: time,
        };

        setSlots((prevSlots) => [dataWithTime, ...prevSlots]);

        if (data.availableSlots && data.availableSlots.length > 0) {
          sendNotification(
            data.availableSlots.length,
            new Date().toLocaleTimeString()
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const interval = setInterval(checkAvailableSlots, 7000);

    checkAvailableSlots();

    return () => clearInterval(interval);
  }, []);

  const requestNotificationPermission = () => {
    if (Notification.permission === "granted") {
      new Notification("Notifications already enabled!");
      setPermission("granted");
    }
    if (Notification.permission !== "granted") {
      setPermission("denied");
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setPermission("granted");
          new Notification("Notifications enabled! You");
        }
      });
    }
  };

  return (
    <ChakraProvider>
      {/* show service worker status */}
      <Container p={6}>
        <Card>
          <CardHeader>
            <Heading size="md">Service Worker Status</Heading>
          </CardHeader>
          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
              <Box>
                <Text fontSize="sm">
                  {navigator?.serviceWorker?.controller
                    ? "Service Worker is active"
                    : "Service Worker is not active"}
                </Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>
        </Container>
      <Container p={6}>
        <Card>
          <CardHeader>
            <Heading size="md">
              Nexus Slot Notifier - Last Updated at - {lastUpdate}
            </Heading>
          </CardHeader>
          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
              <Box spacing={4}>
                <FormLabel htmlFor="enableNotifications">
                  Enable Notification:{" "}
                  <Switch
                    id="enableNotifications"
                    isChecked={permission === "granted"}
                    onChange={requestNotificationPermission}
                  />
                </FormLabel>
              </Box>
              <Box>
                <Heading size="xs" textTransform="uppercase">
                  Available Slots Listing
                </Heading>
                </Box>
                {slots.slice(0, 6).map((slot, index) => (
                  <Text pt="2" fontSize="sm" key={index}>
                    {slot.availableSlots.length} Slots Available - Fetch at {slot.fetchTime}
                  </Text>
                ))}
            </Stack>
          </CardBody>
        </Card>
      </Container>
    </ChakraProvider>
  );
};

export default App;
