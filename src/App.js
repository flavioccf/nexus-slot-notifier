import React, { useState } from "react";
import {
  Box,
  Button,
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

        // Check if Notification permission has been granted
        if ("Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("You will be notified when slots are available!");
          } else if (Notification.permission !== "denied") {
            // Ask for permission if not already denied
            Notification.requestPermission().then(permission => {
              if (permission === "granted") {
                new Notification("You will be notified when slots are available!");
              }
            });
          }
        } else {
          console.log("Notifications are not supported in this browser.");
        }
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
  const [permission, setPermission] = useState(
    "Notification" in window ? Notification.permission : "unsupported"
  );

  const sendNotificationViaPush = (slotCount, lastUpdate) => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        title: `There are ${slotCount} available slots!`,
        body: `At ${lastUpdate}`,
      });
    }
  };

      // listen to messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        const data = event.data;
        console.log("Received message from service worker", data);

        setSlots((prevSlots) => [data.details, ...prevSlots]);
        setLastUpdate(data.details.fetchTime);

        // if (data.availableSlots && data.availableSlots.length > 0) {
        //   sendNotificationViaPush(
        //     data.availableSlots.length,
        //     new Date().toLocaleTimeString()
        //   );
        // }
      });

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Notifications already enabled!");
        setPermission("granted");
      } else if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            setPermission("granted");
            new Notification("Notifications enabled! You");
          } else {
            setPermission("denied");
          }
        });
      }
    } else {
      console.log("Notifications are not supported in this browser.");
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
                    isDisabled={permission === "unsupported"}
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
      <Container p={6}>
        <Card>
          <CardHeader>
            <Heading size="md">Notification Test</Heading>
          </CardHeader>
          <CardBody>
            <Stack divider={<StackDivider />} spacing="4">
              <Box>
                <Button onClick={() => { sendNotificationViaPush(5, new Date().toLocaleTimeString()) }}>
                  Send Test Notification
                </Button>
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </Container>
    </ChakraProvider>
  );
};

export default App;