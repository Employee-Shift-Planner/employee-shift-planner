import { useNavigate } from "react-router-dom";
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
          key={employee.id}
          onClick={() => navigate(`/employees/${employee.id}`)}
        >
          <span className="person">
            <i className={employee.tone}>{employee.name.charAt(0)}</i>
            <b>{employee.name}</b>
          </span>
          <span>{employee.role}</span>
          <span>{employee.availability}</span>
          <b>{employee.hours}</b>
          <span className={employee.statusTone}>{employee.status}</span>
        </button>
      ))}
    </section>
  );
}
