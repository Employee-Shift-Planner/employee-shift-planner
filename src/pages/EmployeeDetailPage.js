import { useNavigate, useParams } from "react-router-dom";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import Metrics from "../components/ui/Metrics";
import EmployeeProfileCard from "../components/employees/EmployeeProfileCard";
import UpcomingShifts from "../components/employees/UpcomingShifts";
import { useDeleteEmployee, useEmployeeSummary } from "../api/employees";
import StateMessage, { QueryState } from "../components/ui/StateMessage";
import { formatHours, formatShiftDay, formatShiftRangeLong } from "../lib/format";
import "./EmployeeDetailPage.css";

export default function EmployeeDetailPage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const summary = useEmployeeSummary(employeeId);
  const employee = summary.data?.employee;
  const deleteEmployee = useDeleteEmployee();

  const handleDelete = () => {
    if (!window.confirm(`Delete ${employee.fullName}? They will be removed from the employee directory and cannot be assigned new shifts. Existing shifts and historical records will be preserved.`)) return;
    deleteEmployee.mutate(employeeId, {
      onSuccess: () => navigate("/employees", { replace: true }),
    });
  };

  return (
    <Shell
      active="Employees"
      title={employee?.fullName ?? "Employee"}
      copy={employee ? `${employee.positionTitle ?? "Unassigned"} · ${employee.active ? "Active" : "Inactive"} employee` : "Loading employee details…"}
      actions={employee && <>
        <Button tone="gray" disabled={deleteEmployee.isPending} onClick={handleDelete}>
          {deleteEmployee.isPending ? "Deleting…" : "Delete employee"}
        </Button>
        <Button disabled={deleteEmployee.isPending} onClick={() => navigate(`/employees/${encodeURIComponent(employeeId)}/edit`)}>Edit profile</Button>
      </>}
    >
      {deleteEmployee.isError && <StateMessage tone="error" title="Employee could not be deleted" detail={deleteEmployee.error?.message || "Please try again."} />}
      <QueryState query={summary} empty={{ title: "Employee not found", detail: "This employee record no longer exists." }}>
        {(data) => <div className="detail">
          <EmployeeProfileCard employee={{ ...data.employee, qualifications: [data.employee.positionTitle ?? "No role assigned", data.employee.preferredShift ? `Prefers ${data.employee.preferredShift.toLowerCase()} shifts` : "Flexible shifts"] }} />
          <div>
            <Metrics items={[{ value: formatHours(data.scheduledHours), label: "Scheduled this week", tone: data.scheduledHours > data.maxWeeklyHours ? "red" : "blue" }, { value: formatHours(data.maxWeeklyHours), label: "Weekly limit", tone: "green" }]} />
            <UpcomingShifts shifts={data.upcomingShifts.map((shift) => ({ id: shift.id, day: formatShiftDay(shift.startTime), role: shift.role ?? "Scheduled shift", time: formatShiftRangeLong(shift.startTime, shift.endTime) }))} />
          </div>
        </div>}
      </QueryState>
    </Shell>
  );
}
