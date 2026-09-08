export const NOTIFICATION_RULES = [
  { id: "shift-assigned", label: "New shift assignment", enabled: true },
  { id: "shift-changed", label: "Shift changed or cancelled", enabled: true },
  { id: "shift-reminder", label: "Upcoming shift reminder", enabled: true },
  { id: "schedule-published", label: "Weekly schedule published", enabled: true },
  { id: "sms-alerts", label: "SMS alerts", enabled: false },
];

export const EMAIL_PREVIEW = {
  subject: "Your shift was updated",
  body: "Hi Alicia, your Customer Support shift is now Monday, 8:00 AM–12:00 PM.",
  action: "View schedule",
};
