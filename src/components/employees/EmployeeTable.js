import { useNavigate } from "react-router-dom";
import { formatHours, toneFor } from "../../lib/format";
import "./EmployeeTable.css";

/** Roster table. Each row opens that employee's detail screen. */
export default function EmployeeTable({ employees }) {
  const navigate = useNavigate();

  return (
    <section className="card table">
      <div className="row head">
        <span>EMPLOYEE</span>
        <span>ROLE</span>
        <span>AVAILABILITY</span>
        <span>HOURS</span>
        <span>STATUS</span>
      </div>
      {employees.map((employee) => (
        <button
          type="button"
          className="row"
          key={employee.employeeId}
          onClick={() => navigate(`/employees/${encodeURIComponent(employee.employeeId)}`)}
        >
          <span className="person">
            <i className={toneFor(employee.employeeId)}>{employee.initial}</i>
            <b>{employee.fullName}</b>
          </span>
          <span>{employee.positionTitle ?? "Unassigned"}</span>
          <span>{employee.availabilitySummary}</span>
          <b>{formatHours(employee.scheduledHours)}</b>
          <span className={employee.status === "Overtime risk" ? "red" : "green"}>
            {employee.status}
          </span>
        </button>
      ))}
    </section>
  );
}
