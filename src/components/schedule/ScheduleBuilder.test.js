import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ScheduleBuilder from "./ScheduleBuilder";

const mockUpdateAsync = jest.fn(() => Promise.resolve());
const mockCreateAsync = jest.fn(() => Promise.resolve({ id:99 }));
const mockCancelAsync = jest.fn(() => Promise.resolve());
jest.mock("../../api/schedule", () => ({
  useUpdateShift: () => ({ mutateAsync:mockUpdateAsync, isPending:false, isError:false }),
  useCreateShift: () => ({ mutateAsync:mockCreateAsync, isPending:false, isError:false }),
  useCancelShift: () => ({ mutateAsync:mockCancelAsync, isPending:false, isError:false }),
  useShiftCandidates: () => ({ data:[{ employeeId:"E2", fullName:"Alicia Reid", status:"Available" }], isPending:false }),
}));

const weekStart = new Date(2026, 8, 14);
const days = ["MON 14", "TUE 15", "WED 16", "THU 17", "FRI 18", "SAT 19", "SUN 20"];
const employees = [
  { employeeId:"E1", fullName:"John Brown", positionTitle:"Server" },
  { employeeId:"E2", fullName:"Alicia Reid", positionTitle:"Server" },
];
const shifts = [{ id:10, employeeId:"E1", employeeName:"John Brown", startTime:"2026-09-14T08:00:00-05:00", endTime:"2026-09-14T16:00:00-05:00", role:"Dining", breakMinutes:30, status:true, isPublished:false }];

beforeEach(() => { mockUpdateAsync.mockClear(); mockCreateAsync.mockClear(); mockCancelAsync.mockClear(); });

test("switches between employee, position, and demand coverage views", () => {
  render(<ScheduleBuilder shifts={shifts} employees={employees} requirements={[{ id:1, dayOfWeek:"Monday", startTime:"08:00", endTime:"12:00", requiredEmployees:2, isActive:true, positionTitle:"Server" }]} weekStart={weekStart} days={days} onOpenShift={() => {}} />);
  expect(screen.getByText("John Brown")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name:"Position view" }));
  expect(screen.getByRole("heading", { name:"Dining" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name:"Coverage view" }));
  expect(screen.getByText("Required")).toBeInTheDocument();
  expect(screen.getAllByText("GAP").length).toBeGreaterThan(0);
});

test("supports selection, duplication, and drag reassignment", async () => {
  const { container } = render(<ScheduleBuilder shifts={shifts} employees={employees} requirements={[]} weekStart={weekStart} days={days} onOpenShift={() => {}} />);
  fireEvent.click(screen.getByRole("checkbox", { name:/Select John Brown/ }));
  fireEvent.click(screen.getByRole("button", { name:"Duplicate" }));
  await waitFor(() => expect(mockCreateAsync).toHaveBeenCalledWith(expect.objectContaining({ id:0, employeeId:"E1" })));

  const shift = container.querySelector(".planner-shift");
  const target = screen.getAllByText("Alicia Reid").find(element => element.tagName === "STRONG").closest(".planner-grid-row");
  const transfer = { setData:jest.fn(), getData:() => "10" };
  fireEvent.dragStart(shift, { dataTransfer:transfer });
  fireEvent.drop(target, { dataTransfer:transfer });
  await waitFor(() => expect(mockUpdateAsync).toHaveBeenCalledWith(expect.objectContaining({ id:10, employeeId:"E2" })));
});
