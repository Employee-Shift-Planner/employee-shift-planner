import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import StateMessage from "../components/ui/StateMessage";
import { useEmployee, usePositions, useSaveEmployee } from "../api/employees";
import "./EmployeeFormPage.css";

const EMPTY = {
  employeeId: "", firstName: "", middleName: "", lastName: "", email: "",
  phone: "", positionId: "", active: true, preferredShift: "", maxWeeklyHours: 40,
};

export default function EmployeeFormPage() {
  const { employeeId } = useParams();
  const editing = Boolean(employeeId);
  const navigate = useNavigate();
  const employee = useEmployee(employeeId);
  const positions = usePositions();
  const save = useSaveEmployee(employeeId);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (employee.data) {
      setForm({ ...EMPTY, ...employee.data, middleName: employee.data.middleName ?? "",
        email: employee.data.email ?? "", phone: employee.data.phone ?? "",
        positionId: employee.data.positionId ?? "", preferredShift: employee.data.preferredShift ?? "" });
    }
  }, [employee.data]);

  const update = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };
  const submit = (event) => {
    event.preventDefault();
    save.mutate(form, { onSuccess: () => navigate(editing ? `/employees/${encodeURIComponent(employeeId)}` : "/employees") });
  };

  if (editing && employee.isPending) return <Shell active="Employees" title="Edit employee"><StateMessage title="Loading employee…" /></Shell>;
  if (editing && employee.isError) return <Shell active="Employees" title="Edit employee"><StateMessage tone="error" title="Could not load employee" detail={employee.error?.message} /></Shell>;

  return (
    <Shell active="Employees" title={editing ? "Edit employee" : "Add employee"} copy="Capture the employee details used for scheduling, availability, and notifications.">
      <form className="employee-form card" onSubmit={submit}>
        <div className="employee-form-grid">
          <label>Employee ID<input required maxLength="50" disabled={editing} value={form.employeeId} onChange={update("employeeId")} /></label>
          <label>First name<input required maxLength="50" value={form.firstName} onChange={update("firstName")} /></label>
          <label>Middle name<input maxLength="50" value={form.middleName} onChange={update("middleName")} /></label>
          <label>Last name<input required maxLength="50" value={form.lastName} onChange={update("lastName")} /></label>
          <label>Email<input type="email" maxLength="100" value={form.email} onChange={update("email")} /></label>
          <label>Phone<input type="tel" maxLength="30" value={form.phone} onChange={update("phone")} /></label>
          <label>Position<select value={form.positionId} onChange={update("positionId")}><option value="">Unassigned</option>{(positions.data ?? []).filter((p) => p.isActive).map((p) => <option key={p.positionId} value={p.positionId}>{p.title}</option>)}</select></label>
          <label>Preferred shift<select value={form.preferredShift} onChange={update("preferredShift")}><option value="">Flexible</option><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option></select></label>
          <label>Maximum weekly hours<input required type="number" min="1" max="168" value={form.maxWeeklyHours} onChange={update("maxWeeklyHours")} /></label>
          <label className="employee-active"><input type="checkbox" checked={form.active} onChange={update("active")} /> Active employee</label>
        </div>
        {positions.isError ? <StateMessage tone="error" title="Could not load positions" detail={positions.error?.message} /> : null}
        {save.isError ? <StateMessage tone="error" title="Could not save employee" detail={save.error?.message} /> : null}
        <div className="employee-form-actions"><Button tone="gray" onClick={() => navigate(-1)}>Cancel</Button><Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save employee"}</Button></div>
      </form>
    </Shell>
  );
}
