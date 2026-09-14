import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import AvailabilityPage from "./pages/AvailabilityPage";
import OperationsPage from "./pages/OperationsPage";

const response = body => Promise.resolve({ ok:true, status:200, text:() => Promise.resolve(JSON.stringify(body)) });
const managerSession = () => {
  localStorage.setItem("token", "test-token");
  localStorage.setItem("user", JSON.stringify({ id:1, email:"manager@test.local", role:"Supervisor", employeeId:"E1" }));
};
const renderPage = page => render(<QueryClientProvider client={new QueryClient({ defaultOptions:{ queries:{ retry:false } } })}><MemoryRouter>{page}</MemoryRouter></QueryClientProvider>);

beforeEach(() => { localStorage.clear(); managerSession(); jest.restoreAllMocks(); });

test("manager adds multiple weekly ranges and a one-off availability exception", async () => {
  let saved;
  jest.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
    if (options.method === "PUT") { saved = JSON.parse(options.body); return response(saved); }
    if (String(url).endsWith("/Employee")) return response([{ employeeId:"E1", fullName:"Alex Brown" }]);
    if (String(url).endsWith("/Employee/me")) return response({ employeeId:"E1", fullName:"Alex Brown" });
    if (String(url).includes("/Availability/employee/E1")) return response([]);
    throw new Error(`Unexpected request: ${url}`);
  });

  renderPage(<AvailabilityPage />);
  await screen.findByText("No weekly restrictions: all times are treated as available.");
  fireEvent.click(screen.getByRole("button", { name:"Add range" }));
  fireEvent.click(screen.getByRole("button", { name:"Add range" }));
  fireEvent.click(screen.getByRole("button", { name:"Add exception" }));
  fireEvent.click(screen.getByRole("button", { name:"Save availability" }));

  await waitFor(() => expect(saved).toHaveLength(3));
  expect(saved.filter(x => x.dayOfWeek === "Monday" && !x.specificDate)).toHaveLength(2);
  expect(saved.find(x => x.specificDate).isAvailable).toBe(false);
});

test("manager records real clock times from the attendance workflow", async () => {
  let saved;
  const attendance = [{ shiftId:10, employeeId:"E1", employeeName:"Alex Brown", shiftStart:"2026-09-14T08:00:00-05:00", shiftEnd:"2026-09-14T16:00:00-05:00", clockIn:null, clockOut:null, status:"Not recorded", scheduledHours:7.5, actualHours:null, lateMinutes:0 }];
  jest.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
    if (options.method === "PUT" && String(url).includes("/attendance/10")) { saved=JSON.parse(options.body); return response(null); }
    if (String(url).includes("/Operations/swaps")) return response([]);
    if (String(url).endsWith("/Employee")) return response([{ employeeId:"E1", fullName:"Alex Brown" }]);
    if (String(url).includes("/Operations/attendance")) return response(attendance);
    if (String(url).includes("/Operations/audit")) return response([]);
    throw new Error(`Unexpected request: ${url}`);
  });

  const { container } = renderPage(<OperationsPage />);
  await screen.findByText("Alex Brown");
  fireEvent.change(screen.getByDisplayValue("Not recorded"), { target:{ value:"Present" } });
  const inputs = container.querySelectorAll('input[type="datetime-local"]');
  fireEvent.change(inputs[0], { target:{ value:"2026-09-14T08:12" } });
  fireEvent.change(inputs[1], { target:{ value:"2026-09-14T16:00" } });
  fireEvent.click(screen.getByRole("button", { name:"Save" }));

  await waitFor(() => expect(saved).toBeDefined());
  expect(saved.clockIn).toBe("2026-09-14T08:12:00-05:00");
  expect(saved.clockOut).toBe("2026-09-14T16:00:00-05:00");
});
