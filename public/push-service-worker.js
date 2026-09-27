self.addEventListener("push", (event) => {
  let message = {};
  try { message = event.data?.json() ?? {}; } catch { message = { body: event.data?.text() }; }
  event.waitUntil(self.registration.showNotification(message.title || "Shiftly", {
    body: message.body || "You have a new schedule notification.",
    icon: "/logo192.png",
    badge: "/favicon-32.png",
    data: { url: message.url || "/mobile" },
    tag: message.tag || "shiftly-notification",
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/mobile", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => client.url === target);
    return existing ? existing.focus() : clients.openWindow(target);
  }));
});
