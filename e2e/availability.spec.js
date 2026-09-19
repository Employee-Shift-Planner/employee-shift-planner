const { test, expect } = require("@playwright/test");

test("employee signs in and saves a recurring availability range", async ({ page }) => {
  let savedRules;
  await page.route("**/api/**", async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.endsWith("/auth/login")) return route.fulfill({ json:{ token:"e2e-token", user:{ id:7, email:"alex@test.local", role:"Employee", employeeId:"E1" } } });
    if (path.endsWith("/Employee/me")) return route.fulfill({ json:{ employeeId:"E1", firstName:"Alex", fullName:"Alex Brown" } });
    if (path.endsWith("/Availability/employee/E1") && request.method() === "PUT") {
      savedRules = request.postDataJSON();
      return route.fulfill({ json:savedRules });
    }
    if (path.endsWith("/Availability/employee/E1")) return route.fulfill({ json:[] });
    if (path.endsWith("/Schedule")) return route.fulfill({ json:[] });
    return route.fulfill({ json:[] });
  });

  await page.goto("/");
  await page.getByLabel("Email address").fill("alex@test.local");
  await page.getByLabel("Password").fill("correct-password");
  await page.getByRole("button", { name:"Sign in" }).click();
  await page.getByRole("button", { name:"Manage availability" }).click();
  await expect(page.getByRole("heading", { name:"My Availability" })).toBeVisible();
  await page.getByRole("button", { name:"Add range" }).click();
  await page.getByRole("button", { name:"Save availability" }).click();

  await expect.poll(() => savedRules?.length).toBe(1);
  expect(savedRules[0]).toMatchObject({ dayOfWeek:"Monday", startTime:"06:00", endTime:"14:00", isAvailable:true });
});
