import { fireEvent, render, screen } from "@testing-library/react";
import EmployeeDetailPage from "./EmployeeDetailPage";
import { useDeleteEmployee, useEmployeeSummary } from "../api/employees";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useParams: () => ({ employeeId: "E1" }),
  useNavigate: () => mockNavigate,
}));
jest.mock("../api/employees");
jest.mock("../components/layout/Shell", () => ({ children, actions }) => <div>{actions}{children}</div>);
jest.mock("../components/employees/EmployeeProfileCard", () => () => null);
jest.mock("../components/employees/UpcomingShifts", () => () => null);

const mockMutate = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(window, "confirm").mockReturnValue(true);
  useEmployeeSummary.mockReturnValue({ data: {
    employee: { fullName: "Jane Doe", active: true },
    scheduledHours: 0, maxWeeklyHours: 40, upcomingShifts: [],
  } });
  useDeleteEmployee.mockReturnValue({ mutate: mockMutate });
});
afterEach(() => jest.restoreAllMocks());

test("confirmation deletes the employee and returns to the directory after success", () => {
  render(<EmployeeDetailPage />);
  fireEvent.click(screen.getByRole("button", { name: "Delete employee" }));
  expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("historical records will be preserved"));
  expect(mockMutate).toHaveBeenCalledWith("E1", expect.any(Object));
  expect(mockNavigate).not.toHaveBeenCalled();
  mockMutate.mock.calls[0][1].onSuccess();
  expect(mockNavigate).toHaveBeenCalledWith("/employees", { replace: true });
});

test("cancelling leaves the employee unchanged", () => {
  window.confirm.mockReturnValue(false);
  render(<EmployeeDetailPage />);
  fireEvent.click(screen.getByRole("button", { name: "Delete employee" }));
  expect(mockMutate).not.toHaveBeenCalled();
});

test("failed deletion displays the server error", () => {
  useDeleteEmployee.mockReturnValue({ mutate: mockMutate, isError: true, error: new Error("Please retry") });
  render(<EmployeeDetailPage />);
  expect(screen.getByRole("alert")).toHaveTextContent("Please retry");
});

test("pending deletion disables profile actions", () => {
  useDeleteEmployee.mockReturnValue({ mutate: mockMutate, isPending: true });
  render(<EmployeeDetailPage />);
  expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Edit profile" })).toBeDisabled();
});
