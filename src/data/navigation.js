// Sidebar destinations, in the order the design lists them.
export const NAV_ITEMS = [
  { label: "Schedule", path: "/schedule", icon: "calendar", roles: ["Administrator", "Supervisor"] },
  { label: "My schedule", path: "/mobile", icon: "calendar", roles: ["Employee"] },
  { label: "Employees", path: "/employees", icon: "users", roles: ["Administrator", "Supervisor"] },
  { label: "Availability", path: "/availability", icon: "clock", roles: ["Administrator", "Supervisor", "Employee"] },
  { label: "Time off", path: "/time-off", icon: "clock", roles: ["Administrator", "Supervisor", "Employee"] },
  { label: "Operations", path: "/operations", icon: "briefcase", roles: ["Administrator", "Supervisor", "Employee"] },
  { label: "Reports", path: "/reports", icon: "chart", roles: ["Administrator", "Supervisor"] },
  { label: "Notifications", path: "/notifications", icon: "bell", roles: ["Administrator", "Supervisor", "Employee"] },
  { label: "Settings", path: "/settings", icon: "settings", roles: ["Administrator", "Supervisor"] },
];
