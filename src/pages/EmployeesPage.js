import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import EmployeeTable from "../components/employees/EmployeeTable";
import { EMPLOYEES } from "../data/employees";

export default function EmployeesPage() {
  return (
    <Shell
      active="Employees"
      title="Employees"
      copy="Manage profiles, roles, availability and scheduled hours."
      actions={<Button>+ Add employee</Button>}
    >
      <EmployeeTable employees={EMPLOYEES} />
    </Shell>
  );
}
