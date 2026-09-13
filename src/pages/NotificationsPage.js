import { useState } from "react";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import NotificationRules from "../components/notifications/NotificationRules";
import EmailPreview from "../components/notifications/EmailPreview";
import PositionsSettings from "../components/settings/PositionsSettings";
import StaffingRequirementsSettings from "../components/settings/StaffingRequirementsSettings";
import UserAccessSettings from "../components/settings/UserAccessSettings";
import HolidaySettings from "../components/settings/HolidaySettings";
import { useCurrentEmployee } from "../api/employees";
import { useNotificationHistory, useNotificationPreferences, useSaveNotificationPreferences } from "../api/notifications";
import { QueryState } from "../components/ui/StateMessage";
import "./NotificationsPage.css";
import { isAdministrator } from "../api/auth";

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
  const employee = useCurrentEmployee();
  const preferences = useNotificationPreferences(employee.data?.employeeId);
  const history = useNotificationHistory(employee.data?.employeeId);
  const save = useSaveNotificationPreferences(employee.data?.employeeId);
  const [draft, setDraft] = useState(null);
  const value = draft ?? preferences.data;
  const rules = value ? [
    { id: "newShiftAssignment", label: "New shift assignment", enabled: value.newShiftAssignment },
    { id: "shiftChanged", label: "Shift changed or cancelled", enabled: value.shiftChanged },
    { id: "upcomingReminder", label: "Upcoming shift reminder", enabled: value.upcomingReminder },
    { id: "schedulePublished", label: "Weekly schedule published", enabled: value.schedulePublished },
    { id: "smsEnabled", label: "SMS alerts", enabled: value.smsEnabled },
    { id: "pushEnabled", label: "Push alerts", enabled: value.pushEnabled },
  ] : [];

  const toggleRule = (ruleId) => {
    setDraft((current) => ({ ...(current ?? preferences.data), [ruleId]: !(current ?? preferences.data)[ruleId] }));
  };

  return (
    <Shell
      active={active}
      title={title}
      copy={copy}
      actions={<Button disabled={!draft || save.isPending} onClick={() => save.mutate(draft, { onSuccess: () => setDraft(null) })}>{save.isPending ? "Saving…" : "Save changes"}</Button>}
    >
      {variant === "settings" ? <PositionsSettings /> : null}
      {variant === "settings" ? <StaffingRequirementsSettings /> : null}
      {variant === "settings" ? <HolidaySettings /> : null}
      {variant === "settings" && isAdministrator() ? <UserAccessSettings /> : null}
      <QueryState query={employee} empty={{ title: "No employee profile", detail: "Your user account is not linked to an employee." }}>
        {() => <QueryState query={preferences}>
          {() => <div className="notices">
            <NotificationRules rules={rules} onToggle={toggleRule} />
            <EmailPreview preview={{ subject: "Your shift was updated", body: `Hi ${employee.data.firstName}, a change was made to your schedule.`, action: "View schedule" }} />
            <section className="card notification-history">
              <h2>Delivery history</h2>
              <QueryState query={history} empty={{ title: "No notifications yet", detail: "Sent and queued messages will appear here." }}>
                {(items) => <div className="notification-history-list">{items.map((item) =>
                  <article key={item.id}>
                    <div><strong>{item.subject || item.eventType}</strong><span>{item.channel} · {item.status}</span></div>
                    <p>{item.body}</p>
                    <time>{new Date(item.createdAt).toLocaleString()}</time>
                    {item.lastError ? <small>{item.lastError}</small> : null}
                  </article>)}</div>}
              </QueryState>
            </section>
          </div>}
        </QueryState>}
      </QueryState>
    </Shell>
  );
}
