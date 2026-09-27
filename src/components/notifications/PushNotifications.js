import { useState } from "react";
import Button from "../ui/Button";
import { disablePushNotifications, enablePushNotifications, pushSupport } from "../../lib/pushNotifications";
import "./PushNotifications.css";

export default function PushNotifications({ enabled, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const support = pushSupport();

  const toggle = async () => {
    setBusy(true);
    setError("");
    try {
      if (enabled) await disablePushNotifications();
      else await enablePushNotifications();
      onChange(!enabled);
    } catch (reason) {
      setError(reason?.message || "Push notification settings could not be updated.");
    } finally {
      setBusy(false);
    }
  };

  return <section className="card push-notifications" aria-labelledby="push-heading">
    <div><h2 id="push-heading">Device notifications</h2><p>Receive schedule updates on this browser. Permission and subscription are managed by your device.</p></div>
    <span className={`push-state ${enabled ? "enabled" : ""}`}>{enabled ? "Enabled" : "Not enabled"}</span>
    <Button tone={enabled ? "gray" : ""} disabled={busy || (!enabled && support !== "available")} onClick={toggle}>{busy ? "Updating…" : enabled ? "Disable on this device" : "Enable on this device"}</Button>
    {support === "unconfigured" ? <small>Set REACT_APP_WEB_PUSH_PUBLIC_KEY during the production build to enable browser push.</small> : null}
    {support === "unsupported" ? <small>This browser does not support Web Push.</small> : null}
    {support === "denied" ? <small>Notifications are blocked. Allow them in your browser’s site settings first.</small> : null}
    {error ? <p className="push-error" role="alert">{error}</p> : null}
  </section>;
}
