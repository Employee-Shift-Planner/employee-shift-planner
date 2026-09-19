import { useState } from "react";
import { useCreateUser, useUpdateUserAccess, useUsers } from "../../api/users";
import { useEmployees } from "../../api/employees";
import Button from "../ui/Button";
import PasswordInput from "../ui/PasswordInput";
import StateMessage from "../ui/StateMessage";
import "./UserAccessSettings.css";

const ROLES = ["Employee", "Supervisor", "Administrator"];
const EMPTY = { email: "", password: "", role: "Employee", employeeId: "" };

export default function UserAccessSettings() {
  const users = useUsers();
  const employees = useEmployees();
  const create = useCreateUser();
  const update = useUpdateUserAccess();
  const [form, setForm] = useState(EMPTY);
  const [message, setMessage] = useState("");

  const add = (event) => {
    event.preventDefault();
    create.mutate(form, { onSuccess: () => { setForm(EMPTY); setMessage("User account created."); } });
  };
  const setAccess = (user, changes) => update.mutate({ ...user, ...changes }, {
    onSuccess: () => setMessage("User access updated. Changes apply at the user's next sign-in."),
  });
  const error = users.error ?? employees.error ?? create.error ?? update.error;
  const employeeOptions = employees.data ?? [];

  return (
    <section className="user-access-settings" aria-labelledby="user-access-heading">
      <div><h2 id="user-access-heading">Users and permissions</h2><p>Administrators control who can manage the workforce and who has employee-only access.</p></div>
      {error ? <StateMessage tone="error" title="Could not manage user access" detail={error.message} /> : null}
      {message ? <p className="user-access-message" role="status">{message}</p> : null}
      <div className="user-access-layout">
        <form className="card user-access-form" onSubmit={add}>
          <h3>Create account</h3>
          <label>Email<input required type="email" maxLength="100" value={form.email} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} /></label>
          <label htmlFor="temporary-password">Temporary password<PasswordInput id="temporary-password" required minLength="6" value={form.password} onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))} /></label>
          <label>Role<select value={form.role} onChange={(event) => setForm((value) => ({ ...value, role: event.target.value }))}>{ROLES.map((role) => <option key={role}>{role}</option>)}</select></label>
          <label>Employee profile<select required={form.role === "Employee"} value={form.employeeId} onChange={(event) => setForm((value) => ({ ...value, employeeId: event.target.value }))}><option value="">Not linked</option>{employeeOptions.map((employee) => <option key={employee.employeeId} value={employee.employeeId}>{employee.fullName}</option>)}</select></label>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? "Creating…" : "Create user"}</Button>
        </form>
        <section className="card user-access-list">
          <h3>Existing users</h3>
          {users.isPending ? <p>Loading users…</p> : null}
          {(users.data ?? []).map((user) => <div className="user-access-row" key={user.id}>
            <div><b>{user.email}</b><span>{user.isActive ? "Active" : "Inactive"}</span></div>
            <select aria-label={`Role for ${user.email}`} value={user.role} disabled={update.isPending} onChange={(event) => setAccess(user, { role: event.target.value })}>{ROLES.map((role) => <option key={role}>{role}</option>)}</select>
            <select aria-label={`Employee profile for ${user.email}`} value={user.employeeId ?? ""} disabled={update.isPending} onChange={(event) => setAccess(user, { employeeId: event.target.value || null })}><option value="">Not linked</option>{employeeOptions.map((employee) => <option key={employee.employeeId} value={employee.employeeId}>{employee.fullName}</option>)}</select>
            <button type="button" disabled={update.isPending} onClick={() => setAccess(user, { isActive: !user.isActive })}>{user.isActive ? "Deactivate" : "Activate"}</button>
          </div>)}
        </section>
      </div>
    </section>
  );
}
