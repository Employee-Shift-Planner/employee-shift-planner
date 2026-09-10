import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import { QueryState } from "../components/ui/StateMessage";
import EmployeeTable from "../components/employees/EmployeeTable";
import { useRoster } from "../api/employees";
import { useNavigate } from "react-router-dom";

export default function EmployeesPage() {
  const roster = useRoster();
  const navigate = useNavigate();

  return (
    <Shell
      active="Employees"
      title="Employees"
      copy="Manage profiles, roles, availability and scheduled hours."
      actions={<Button onClick={() => navigate("/employees/new")}>+ Add employee</Button>}
    >
      <QueryState
        query={roster}
        empty={{
          title: "No employees yet",
          detail: "Add your first team member to start building schedules.",
        }}
      >
        {(rows) => <EmployeeTable employees={rows} />}
      </QueryState>
    </Shell>
  );
}
