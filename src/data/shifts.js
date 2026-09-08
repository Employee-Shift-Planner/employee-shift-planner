export const CURRENT_WEEK = {
  label: "September 7–13, 2026",
  days: ["MON 7", "TUE 8", "WED 9", "THU 10", "FRI 11", "SAT 12", "SUN 13"],
};

export const SCHEDULE_METRICS = [
  { value: 42, label: "Scheduled shifts", tone: "blue" },
  { value: "326h", label: "Total hours", tone: "green" },
  { value: 3, label: "Coverage gaps", tone: "red" },
  { value: "92%", label: "Availability fit", tone: "orange" },
];

// `column` / `row` are 1-based CSS grid positions inside the week calendar.
export const WEEK_SHIFTS = [
  {
    id: "tue-support",
    column: 2,
    row: 1,
    label: "Support",
    time: "8:00–12:00",
    tone: "blue",
  },
  {
    id: "wed-front-desk",
    column: 3,
    row: 2,
    label: "Front Desk",
    time: "8:00–12:00",
    tone: "green",
  },
  {
    id: "thu-operations",
    column: 4,
    row: 3,
    label: "Operations",
    time: "8:00–12:00",
    tone: "purple",
  },
  {
    id: "fri-support",
    column: 5,
    row: 2,
    label: "Support",
    time: "8:00–12:00",
    tone: "orange",
  },
  {
    id: "sat-gap",
    column: 6,
    row: 4,
    label: "Coverage needed",
    time: "8:00–12:00",
    tone: "red",
  },
];

// The shift being composed on the "Create shift" screen.
export const SHIFT_DRAFT = {
  title: "Customer Support — Morning",
  date: "Monday, September 7",
  time: "8:00 AM–12:00 PM · 30-minute break",
  requiredSkill: "Customer care certification",
  notes: "Cover lobby and incoming enquiries.",
};

export const ASSIGNMENT_CANDIDATES = [
  { employeeId: "alicia-brown", name: "Alicia Brown", status: "Available" },
  { employeeId: "daniel-reid", name: "Daniel Reid", status: "Role mismatch" },
  { employeeId: "shanice-grant", name: "Shanice Grant", status: "Time conflict" },
  { employeeId: "omar-lewis", name: "Omar Lewis", status: "Available" },
];

export const ASSIGNMENT_CONFLICT = {
  title: "Assignment conflict detected",
  detail: "Shanice already works 10:00 AM–2:00 PM.",
};
