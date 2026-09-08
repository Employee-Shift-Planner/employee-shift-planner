import { Navigate, useParams } from "react-router-dom";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import Metrics from "../components/ui/Metrics";
import EmployeeProfileCard from "../components/employees/EmployeeProfileCard";
import UpcomingShifts from "../components/employees/UpcomingShifts";
import { findEmployee } from "../data/employees";
import "./EmployeeDetailPage.css";

export default function EmployeeDetailPage() {
  const { employeeId } = useParams();
  const employee = findEmployee(employeeId);

  // An unknown id falls back to the roster rather than rendering an empty page.
  if (!employee) return <Navigate replace to="/employees" />;

  return (
    <Shell
      active="Employees"
      title={employee.name}
      copy={`${employee.role} · Active employee`}
      actions={<Button>Edit profile</Button>}
    >
      <div className="detail">
        <EmployeeProfileCard employee={employee} />
        <div>
          <Metrics items={employee.metrics} />
          <UpcomingShifts shifts={employee.upcomingShifts} />
        </div>
      </div>
    </Shell>
  );
}
