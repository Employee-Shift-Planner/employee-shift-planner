const { chromium } = require("@playwright/test");
const path = require("path");
const fs = require("fs");
const baseURL = process.env.GUIDE_BASE_URL || "http://127.0.0.1:3000";

const output = path.resolve(__dirname, "../docs/user-guide/images");
const employees = [
  { employeeId:"E001", fullName:"Alicia Grant", firstName:"Alicia", lastName:"Grant", positionTitle:"Store Manager", active:true },
  { employeeId:"E002", fullName:"Daniel Brown", firstName:"Daniel", lastName:"Brown", positionTitle:"Sales Associate", active:true },
  { employeeId:"E003", fullName:"Keisha Morgan", firstName:"Keisha", lastName:"Morgan", positionTitle:"Sales Associate", active:true },
  { employeeId:"E004", fullName:"Owen Campbell", firstName:"Owen", lastName:"Campbell", positionTitle:"Cashier", active:true },
];
const roster = employees.map((employee, index) => ({
  ...employee, initial:employee.fullName.split(" ").map(x => x[0]).join(""),
  availabilitySummary:index === 2 ? "Mon–Fri · mornings" : "Mon–Sat · flexible",
  scheduledHours:[40, 32, 28, 36][index], status:index === 0 ? "On track" : "Available",
}));
const shifts = [
  [1,"E001","Alicia Grant","2026-09-28T08:00:00-05:00","2026-09-28T16:30:00-05:00","Management",true],
  [2,"E002","Daniel Brown","2026-09-28T09:00:00-05:00","2026-09-28T17:00:00-05:00","Sales",true],
  [3,"E003","Keisha Morgan","2026-09-29T07:00:00-05:00","2026-09-29T15:00:00-05:00","Sales",false],
  [4,"E004","Owen Campbell","2026-09-29T11:00:00-05:00","2026-09-29T19:00:00-05:00","Front Desk",false],
  [5,"E001","Alicia Grant","2026-09-30T08:00:00-05:00","2026-09-30T16:30:00-05:00","Management",true],
  [6,"E002","Daniel Brown","2026-10-01T09:00:00-05:00","2026-10-01T17:00:00-05:00","Sales",false],
  [7,"E003","Keisha Morgan","2026-10-02T08:00:00-05:00","2026-10-02T16:00:00-05:00","Sales",true],
  [8,"E004","Owen Campbell","2026-10-03T10:00:00-05:00","2026-10-03T18:00:00-05:00","Front Desk",true],
].map(([id,employeeId,employeeName,startTime,endTime,role,isPublished]) => ({ id,employeeId,employeeName,startTime,endTime,role,isPublished,breakMinutes:30 }));

const report = {
  weekStart:"2026-09-28", coveragePercent:92, totalHours:164, coverageGaps:2,
  labourCost:184500, regularHours:156, overtimeHours:8, currency:"JMD",
  regularLabourCost:168500, overtimeLabourCost:16000, overtimeMultiplier:1.5,
  availabilityFitPercent:96,
  hoursByEmployee:roster.map(x => ({ employeeId:x.employeeId, fullName:x.fullName, hours:x.scheduledHours })),
  labourCostByEmployee:[
    { employeeId:"E001", fullName:"Alicia Grant", regularHours:40, overtimeHours:4, hourlyRate:1300, regularCost:52000, overtimeCost:7800, totalCost:59800 },
    { employeeId:"E002", fullName:"Daniel Brown", regularHours:38, overtimeHours:4, hourlyRate:900, regularCost:34200, overtimeCost:5400, totalCost:39600 },
    { employeeId:"E003", fullName:"Keisha Morgan", regularHours:38, overtimeHours:0, hourlyRate:900, regularCost:34200, overtimeCost:0, totalCost:34200 },
    { employeeId:"E004", fullName:"Owen Campbell", regularHours:40, overtimeHours:0, hourlyRate:850, regularCost:34000, overtimeCost:0, totalCost:34000 },
  ],
  coverageByDay:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day,i) => ({ day,date:`2026-10-0${Math.min(i+1,4)}`,scheduledEmployees:i === 5 ? 2 : 4,requiredEmployees:i === 5 ? 3 : 4,hours:i === 6 ? 0 : 24,coveragePercent:i === 5 ? 67 : 100,isGap:i === 5 })),
};

async function mock(route) {
  const request = route.request();
  const url = new URL(request.url());
  const p = url.pathname.toLowerCase();
  const json = value => route.fulfill({ status:200, contentType:"application/json", body:JSON.stringify(value) });
  if (p.endsWith("/auth/login")) return json({ token:"guide-token", user:{ id:1,email:"manager@shiftly.demo",role:"Administrator" } });
  if (p.includes("/schedule/week/readiness")) return json({ isReady:true, issues:[] });
  if (p.includes("/schedule/week")) return json(shifts);
  if (p.endsWith("/schedule")) return json(url.searchParams.has("employeeId") ? shifts.filter(x => x.employeeId === "E002" && x.isPublished) : shifts);
  if (p.includes("/reports/weekly")) return json(report);
  if (p.includes("/staffingrequirements/coverage")) return json([{ requirementId:1,date:"2026-10-03",dayOfWeek:"Saturday",startTime:"10:00",endTime:"16:00",positionTitle:"Sales Associate",scheduledEmployees:2,requiredEmployees:3,missingEmployees:1 }]);
  if (p.endsWith("/staffingrequirements")) return json([]);
  if (p.includes("/employee/roster")) return json(roster);
  if (p.endsWith("/employee/e001/summary")) return json({ employee:{ ...employees[0], maxWeeklyHours:40, hourlyRate:1300, overtimeThresholdHours:40, preferredShift:"Morning" }, scheduledHours:40, maxWeeklyHours:40, upcomingShifts:shifts.filter(x => x.employeeId === "E001") });
  if (p.endsWith("/api/employee/e001")) return json({ ...employees[0], maxWeeklyHours:40, hourlyRate:1300, overtimeThresholdHours:40, positionId:1 });
  if (p.endsWith("/employee")) return json(employees);
  if (p.endsWith("/employee/me")) return json(employees[1]);
  if (p.endsWith("/position")) return json([{ positionId:1,title:"Store Manager",isActive:true },{ positionId:2,title:"Sales Associate",isActive:true },{ positionId:3,title:"Cashier",isActive:true }]);
  if (p.includes("/availability/matrix")) return json([]);
  if (p.includes("/availability/employee/")) return json([
    { id:1, dayOfWeek:"Monday",startTime:"08:00",endTime:"16:30",specificDate:null,isAvailable:true,notes:"Regular working window" },
    { id:2, dayOfWeek:"Friday",startTime:null,endTime:null,specificDate:"2026-10-09",isAvailable:false,notes:"One-off exception" },
  ]);
  if (p.endsWith("/timeoffrequests")) return json([
    { id:1,employeeId:"E003",employeeName:"Keisha Morgan",startDate:"2026-10-09",endDate:"2026-10-10",reason:"Family commitment",status:"Pending" },
    { id:2,employeeId:"E002",employeeName:"Daniel Brown",startDate:"2026-09-18",endDate:"2026-09-18",reason:"Appointment",status:"Approved",reviewNotes:"Coverage confirmed" },
  ]);
  if (p.includes("/holidays")) return json([]);
  if (p.includes("/organizationSettings".toLowerCase())) return json({ organizationName:"Harbour Street Market",currency:"JMD",timeZone:"America/Jamaica",locationName:"Kingston office",countryCode:"JM",regionCode:"",isConfigured:true });
  if (p.includes("/shifttemplates")) return json([]);
  if (p.includes("/operations/swaps")) return json([]);
  if (p.includes("/operations/attendance")) return json([]);
  if (p.includes("/operations/audit")) return json([]);
  if (p.endsWith("/history")) return json([]);
  if (p.includes("/notificationpreferences")) return json({newShiftAssignment:true,shiftChanged:true,upcomingReminder:true,schedulePublished:true,smsEnabled:false,pushEnabled:false,reminderHoursBefore:12});
  if (p.endsWith("/user")) return json([]);
  return json([]);
}

(async () => {
  fs.mkdirSync(output, { recursive:true });
  const browser = await chromium.launch({
    headless:true,
    executablePath:process.env.PLAYWRIGHT_CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage({ viewport:{ width:1440,height:1000 }, deviceScaleFactor:1, timezoneId:"America/Jamaica" });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/api/**", mock);
  await page.goto(`${baseURL}/`);
  await page.screenshot({ path:path.join(output,"01-sign-in.png"), fullPage:true });
  await page.getByLabel("Email address").fill("manager@shiftly.demo");
  await page.locator('input[name="password"]').fill("demo-password");
  await page.getByRole("button", { name:"Sign in" }).click();
  await page.waitForURL("**/schedule");
  await page.goto(`${baseURL}/schedule?week=2026-09-28`);
  await page.waitForTimeout(700);
  await page.screenshot({ path:path.join(output,"02-weekly-schedule.png"), fullPage:true });
  await page.goto(`${baseURL}/employees`);
  await page.waitForTimeout(500);
  await page.screenshot({ path:path.join(output,"03-employees.png"), fullPage:true });
  await page.goto(`${baseURL}/time-off`);
  await page.waitForTimeout(500);
  await page.screenshot({ path:path.join(output,"04-time-off.png"), fullPage:true });
  await page.goto(`${baseURL}/reports?week=2026-09-28`);
  await page.waitForTimeout(500);
  await page.screenshot({ path:path.join(output,"05-reports.png"), fullPage:true });
  for (const [route, name, heading] of [
    ["employees/E001","06-employee-profile.png","Alicia Grant"],
    ["employees/new","07-add-employee.png","Add employee"],
    ["availability","08-availability.png","Team Availability"],
    ["operations","09-operations.png","Operations"],
    ["notifications","10-notifications.png","Notifications"],
    ["settings","11-settings.png","Settings"],
    ["create-shift","12-create-shift.png","Create shift"],
  ]) {
    await page.goto(`${baseURL}/${route}`);
    await page.getByRole("heading", { name:heading, exact:true }).waitFor();
    await page.waitForTimeout(700);
    await page.screenshot({ path:path.join(output,name), fullPage:true });
  }
  await page.route(url => url.pathname.toLowerCase().endsWith("/auth/login"), route => route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({token:"employee-guide-token",user:{id:2,email:"employee@shiftly.demo",role:"Employee"}})}));
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(`${baseURL}/`);
  await page.getByLabel("Email address").fill("employee@shiftly.demo");
  await page.locator('input[name="password"]').fill("demo-password");
  await page.getByRole("button", { name:"Sign in" }).click();
  await page.waitForURL("**/mobile");
  await page.setViewportSize({width:430,height:932});
  await page.waitForTimeout(700);
  await page.screenshot({path:path.join(output,"13-my-schedule.png"),fullPage:true});
  await browser.close();
  if (errors.length) throw new Error(errors.join("\n"));
})();
