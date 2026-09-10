// Sidebar destinations, in the order the design lists them.
export const NAV_ITEMS = [
  { label: "Schedule", path: "/schedule", roles: ["Administrator", "Supervisor"] },
  { label: "My schedule", path: "/mobile", roles: ["Employee"] },
  { label: "Employees", path: "/employees", roles: ["Administrator", "Supervisor"] },
  { label: "Availability", path: "/availability", roles: ["Administrator", "Supervisor"] },
  { label: "Time off", path: "/time-off", roles: ["Administrator", "Supervisor", "Employee"] },
  { label: "Operations", path: "/operations", roles: ["Administrator", "Supervisor", "Employee"] },
  { label: "Reports", path: "/reports", roles: ["Administrator", "Supervisor"] },
  { label: "Notifications", path: "/notifications", roles: ["Administrator", "Supervisor", "Employee"] },
  { label: "Settings", path: "/settings", roles: ["Administrator", "Supervisor"] },
];
