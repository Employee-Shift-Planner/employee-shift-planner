export const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// Index 0 is Monday. `true` means the employee can be scheduled that day.
export const TEAM_AVAILABILITY = [
  {
    employeeId: "alicia-brown",
    name: "Alicia Brown",
    days: [true, true, true, true, true, true, true],
  },
  {
    employeeId: "daniel-reid",
    name: "Daniel Reid",
    days: [true, true, true, true, true, true, true],
  },
  {
    employeeId: "shanice-grant",
    name: "Shanice Grant",
    days: [true, true, true, true, false, false, false],
  },
  {
    employeeId: "omar-lewis",
    name: "Omar Lewis",
    days: [true, true, true, true, true, true, true],
  },
  {
    employeeId: "kayon-grant",
    name: "Kayon Grant",
    days: [false, false, true, true, true, true, true],
  },
];

// Weekdays show fixed hours, the weekend is flexible — matches the design.
export const availabilityLabel = (isAvailable, dayIndex) => {
  if (!isAvailable) return "Unavailable";
  return dayIndex > 4 ? "Flexible" : "8a–5p";
};
