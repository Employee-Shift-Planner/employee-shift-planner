// Employee roster. Each record carries both the row shown on the Employees
// table and the fields the detail screen renders, so /employees/:employeeId
// works for every person in the list rather than only the first one.
export const EMPLOYEES = [
  {
    id: "alicia-brown",
    name: "Alicia Brown",
    role: "Customer Support",
    availability: "Mon–Fri · Morning",
    hours: "38h",
    status: "Scheduled",
    statusTone: "green",
    tone: "blue",
    email: "alicia.brown@company.com",
    phone: "(876) 555-0142",
    qualifications: ["Customer care certified", "Prefers morning shifts"],
    metrics: [
      { value: "38h", label: "Scheduled this week", tone: "blue" },
      { value: "98%", label: "Attendance", tone: "green" },
    ],
    upcomingShifts: [
      { day: "MON 7", role: "Customer Support", time: "8:00 AM–12:00 PM" },
      { day: "TUE 8", role: "Front Desk cover", time: "9:00 AM–2:00 PM" },
      { day: "THU 10", role: "Customer Support", time: "10:00 AM–4:00 PM" },
    ],
  },
  {
    id: "daniel-reid",
    name: "Daniel Reid",
    role: "Operations",
    availability: "Tue–Sat · Flexible",
    hours: "40h",
    status: "Scheduled",
    statusTone: "green",
    tone: "green",
    email: "daniel.reid@company.com",
    phone: "(876) 555-0187",
    qualifications: ["Forklift certified", "Opens and closes the floor"],
    metrics: [
      { value: "40h", label: "Scheduled this week", tone: "blue" },
      { value: "96%", label: "Attendance", tone: "green" },
    ],
    upcomingShifts: [
      { day: "TUE 8", role: "Operations", time: "7:00 AM–3:00 PM" },
      { day: "WED 9", role: "Operations", time: "7:00 AM–3:00 PM" },
      { day: "SAT 12", role: "Stock intake", time: "6:00 AM–12:00 PM" },
    ],
  },
  {
    id: "shanice-grant",
    name: "Shanice Grant",
    role: "Front Desk",
    availability: "Mon–Thu · Day",
    hours: "28h",
    status: "Available",
    statusTone: "green",
    tone: "orange",
    email: "shanice.grant@company.com",
    phone: "(876) 555-0119",
    qualifications: ["Front desk trained", "Bilingual — English / Spanish"],
    metrics: [
      { value: "28h", label: "Scheduled this week", tone: "blue" },
      { value: "94%", label: "Attendance", tone: "green" },
    ],
    upcomingShifts: [
      { day: "MON 7", role: "Front Desk", time: "10:00 AM–2:00 PM" },
      { day: "WED 9", role: "Front Desk", time: "9:00 AM–3:00 PM" },
      { day: "THU 10", role: "Front Desk", time: "9:00 AM–3:00 PM" },
    ],
  },
  {
    id: "omar-lewis",
    name: "Omar Lewis",
    role: "Supervisor",
    availability: "Mon–Fri · Flexible",
    hours: "42h",
    status: "Overtime risk",
    statusTone: "red",
    tone: "red",
    email: "omar.lewis@company.com",
    phone: "(876) 555-0164",
    qualifications: ["Shift supervisor", "First aid certified"],
    metrics: [
      { value: "42h", label: "Scheduled this week", tone: "red" },
      { value: "99%", label: "Attendance", tone: "green" },
    ],
    upcomingShifts: [
      { day: "MON 7", role: "Floor supervision", time: "8:00 AM–5:00 PM" },
      { day: "TUE 8", role: "Floor supervision", time: "8:00 AM–5:00 PM" },
      { day: "FRI 11", role: "Coverage support", time: "12:00 PM–8:00 PM" },
    ],
  },
];

export const findEmployee = (employeeId) =>
  EMPLOYEES.find((employee) => employee.id === employeeId);
