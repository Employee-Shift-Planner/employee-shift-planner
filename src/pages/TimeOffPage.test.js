import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TimeOffPage from "./TimeOffPage";

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockConfirm = jest.fn(() => Promise.resolve(true));
jest.mock("../components/ui/ConfirmProvider", () => ({ useConfirm: () => mockConfirm }));
jest.mock("../components/layout/Shell", () => ({ children }) => <main>{children}</main>);
jest.mock("../lib/useUnsavedChanges", () => () => {});
jest.mock("../lib/useIsMobile", () => () => false);
jest.mock("../api/auth", () => ({ isManager: () => false }));
jest.mock("../api/employees", () => ({
  useEmployees: () => ({}),
  useCurrentEmployee: () => ({ data:{ employeeId:"E1", fullName:"John Brown" } }),
}));
jest.mock("../api/timeOff", () => ({
  useTimeOffRequests: () => ({ isSuccess:true, data:[
    { id:1, employeeId:"E1", employeeName:"John Brown", startDate:"2026-11-02", endDate:"2026-11-04", type:"Vacation", reason:"Trip", status:"Pending" },
  ] }),
  useCreateTimeOffRequest: () => ({ mutate:mockCreate }),
  useUpdateTimeOffRequest: () => ({ mutate:mockUpdate }),
  useDeleteTimeOffRequest: () => ({ mutate:mockDelete }),
  useReviewTimeOffRequest: () => ({ mutate:jest.fn() }),
}));
beforeEach(() => { jest.clearAllMocks(); mockConfirm.mockResolvedValue(true); });

test("creates a request with a custom time-off type", () => {
  render(<TimeOffPage />);
  fireEvent.change(screen.getByLabelText("From"), { target:{ value:"2026-12-01" } });
  fireEvent.change(screen.getByLabelText("Through"), { target:{ value:"2026-12-02" } });
  fireEvent.change(screen.getByLabelText("Time-off type"), { target:{ value:"Custom" } });
  fireEvent.change(screen.getByLabelText("Custom time-off type"), { target:{ value:"Study leave" } });
  fireEvent.change(screen.getByLabelText("Reason"), { target:{ value:"Exams" } });
  fireEvent.click(screen.getByRole("button", { name:"Submit request" }));
  expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ employeeId:"E1", type:"Study leave", reason:"Exams" }), expect.anything());
});

test("edits a submitted request without conflicting with itself", () => {
  render(<TimeOffPage />);
  fireEvent.click(screen.getByRole("button", { name:"Edit" }));
  expect(screen.getByLabelText("Reason")).toHaveValue("Trip");
  fireEvent.change(screen.getByLabelText("Through"), { target:{ value:"2026-11-05" } });
  fireEvent.click(screen.getByRole("button", { name:"Save changes" }));
  expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ id:1, endDate:"2026-11-05", type:"Vacation" }), expect.anything());
});

test("deletes a submitted request after confirmation", async () => {
  render(<TimeOffPage />);
  fireEvent.click(screen.getByRole("button", { name:"Delete" }));
  await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(1, expect.anything()));
  expect(mockConfirm).toHaveBeenCalled();
});
