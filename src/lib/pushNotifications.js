import { registerPushSubscription, revokePushSubscription } from "../api/notifications";

const publicKey = process.env.REACT_APP_WEB_PUSH_PUBLIC_KEY;

const decodePublicKey = (value) => {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const raw = window.atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
};

export const pushSupport = () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  if (!publicKey) return "unconfigured";
  if (Notification.permission === "denied") return "denied";
  return "available";
};

export async function enablePushNotifications() {
  const support = pushSupport();
  if (support !== "available") throw new Error(support === "denied" ? "Notifications are blocked in your browser settings." : support === "unconfigured" ? "Push notifications are not configured for this environment." : "This browser does not support push notifications.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not granted.");

  const registration = await navigator.serviceWorker.register(`${process.env.PUBLIC_URL || ""}/push-service-worker.js`);
  const existing = await registration.pushManager.getSubscription();
  const subscription = existing ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodePublicKey(publicKey),
  });
  await registerPushSubscription(subscription.toJSON());
  return subscription;
}

export async function disablePushNotifications() {
  await revokePushSubscription();
  const registration = await navigator.serviceWorker.getRegistration(`${process.env.PUBLIC_URL || ""}/push-service-worker.js`);
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) await subscription.unsubscribe();
}
