import { useState } from "react";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import NotificationRules from "../components/notifications/NotificationRules";
import EmailPreview from "../components/notifications/EmailPreview";
import { EMAIL_PREVIEW, NOTIFICATION_RULES } from "../data/notifications";
import "./NotificationsPage.css";

// Notifications and Settings share this screen; only the heading copy differs.
const COPY = {
  notifications: {
    active: "Notifications",
    title: "Notifications",
    copy: "Configure assignments, changes, reminders and delivery channels.",
  },
  settings: {
    active: "Settings",
    title: "Settings",
    copy: "Manage workspace preferences and how your team is notified.",
  },
};

export default function NotificationsPage({ variant = "notifications" }) {
  const { active, title, copy } = COPY[variant];
  const [rules, setRules] = useState(NOTIFICATION_RULES);

  const toggleRule = (ruleId) => {
    setRules((current) =>
      current.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  return (
    <Shell
      active={active}
      title={title}
      copy={copy}
      actions={<Button>Save changes</Button>}
    >
      <div className="notices">
        <NotificationRules rules={rules} onToggle={toggleRule} />
        <EmailPreview preview={EMAIL_PREVIEW} />
      </div>
    </Shell>
  );
}
