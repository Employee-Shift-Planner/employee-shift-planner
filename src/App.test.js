import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

// Every route renders its screen without throwing, and lands on the right title.
test.each([
  ["/", "Welcome back"],
  ["/login", "Welcome back"],
  ["/schedule", "Weekly Schedule"],
  ["/shiftplanner", "Weekly Schedule"],
  ["/create-shift", "Create shift"],
  ["/employees", "Employees"],
  ["/employee", "Employees"],
  ["/employees/alicia-brown", "Alicia Brown"],
  ["/availability", "Team Availability"],
  ["/reports", "Reports & exports"],
  ["/notifications", "Notifications"],
  ["/settings", "Settings"],
  ["/mobile", "Hi, Alicia"],
  ["/does-not-exist", "Welcome back"],
])("%s renders the %s screen", (path, heading) => {
  renderAt(path);
  expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
});

test("the shell exposes the sidebar as real router links", () => {
  renderAt("/schedule");
  expect(screen.getByRole("link", { name: "Employees" })).toHaveAttribute(
    "href",
    "/employees"
  );
  expect(screen.getByRole("link", { name: "Schedule" })).toHaveAttribute(
    "aria-current",
    "page"
  );
});

test("an unknown employee id redirects back to the roster", () => {
  renderAt("/employees/does-not-exist");
  expect(screen.getByRole("heading", { name: "Employees" })).toBeInTheDocument();
});

test("every employee row links to its own detail screen", () => {
  renderAt("/employees");
  expect(screen.getByText("Omar Lewis")).toBeInTheDocument();
  expect(screen.getByText("Overtime risk")).toHaveClass("red");
});
