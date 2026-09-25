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

  const existingUsers = users.data ?? [];
  const employeeOptions = employees.data ?? [];
  const normalizedEmail = form.email.trim().toLowerCase();
  const duplicateUser = existingUsers.find((user) => user.email.toLowerCase() === normalizedEmail);
  const duplicateApiError = create.error && /already exists|duplicate/i.test(create.error.message);
  const emailError = duplicateUser || duplicateApiError ? "An account with this email already exists." : "";
  const linkedEmployeeIds = new Set(existingUsers.map((user) => user.employeeId).filter(Boolean));
  const formIsValid = normalizedEmail && form.password.length >= 6 && (form.role !== "Employee" || form.employeeId) && !emailError;

  const updateForm = (changes) => {
    setForm((value) => ({ ...value, ...changes }));
    setMessage("");
    if (create.isError) create.reset();
  };

  const add = (event) => {
    event.preventDefault();
    if (!formIsValid) return;
    create.mutate({ ...form, email: form.email.trim() }, {
      onSuccess: () => {
        setForm(EMPTY);
        setMessage("User account created.");
      },
    });
  };

  const setAccess = (user, changes) => update.mutate({ ...user, ...changes }, {
    onSuccess: () => setMessage("User access updated. Changes apply at the user's next sign-in."),
  });

  const toggleAccess = (user) => {
    if (user.isActive && !window.confirm(`Deactivate ${user.email}? They will no longer be able to sign in.`)) return;
    setAccess(user, { isActive: !user.isActive });
  };

  const error = users.error ?? employees.error ?? (duplicateApiError ? null : create.error) ?? update.error;

  const employeeChoices = (currentEmployeeId = "") => employeeOptions.map((employee) => (
    <option
      key={employee.employeeId}
      value={employee.employeeId}
      disabled={linkedEmployeeIds.has(employee.employeeId) && employee.employeeId !== currentEmployeeId}
    >
      {employee.fullName}{linkedEmployeeIds.has(employee.employeeId) && employee.employeeId !== currentEmployeeId ? " (already linked)" : ""}
    </option>
  ));

  return (
    <section className="user-access-settings" aria-labelledby="user-access-heading">
      <header className="user-access-heading">
        <h2 id="user-access-heading">Users &amp; access</h2>
        <p>Control who can manage the workforce and who has employee-only access.</p>
      </header>
      {error ? <div className="user-access-alert"><StateMessage tone="error" title="Could not manage user access" detail={error.message} /></div> : null}
      {message ? <p className="user-access-message" role="status">{message}</p> : null}
      <div className="user-access-layout">
        <form className="card user-access-form" onSubmit={add}>
          <div className="user-access-card-heading">
            <h3>Create user</h3>
            <p>Create sign-in credentials and optionally connect an employee profile.</p>
          </div>
          <label htmlFor="user-email">Email
            <input id="user-email" required type="email" maxLength="100" autoComplete="off" aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "user-email-error" : undefined} value={form.email} onChange={(event) => updateForm({ email: event.target.value })} />
            {emailError ? <span id="user-email-error" className="field-error" role="alert">{emailError}</span> : null}
          </label>
          <label htmlFor="temporary-password">Temporary password
            <PasswordInput id="temporary-password" required minLength="6" autoComplete="new-password" value={form.password} onChange={(event) => updateForm({ password: event.target.value })} />
            <span className="field-help">Use at least 6 characters. The user can change it after signing in.</span>
          </label>
          <label htmlFor="new-user-role">Role
            <select id="new-user-role" value={form.role} onChange={(event) => updateForm({ role: event.target.value })}>{ROLES.map((role) => <option key={role}>{role}</option>)}</select>
            <span className="field-help">Administrators manage settings; supervisors manage day-to-day scheduling.</span>
          </label>
          <label htmlFor="new-user-employee">Employee profile
            <select id="new-user-employee" required={form.role === "Employee"} value={form.employeeId} onChange={(event) => updateForm({ employeeId: event.target.value })}>
              <option value="">Not linked</option>
              {employeeChoices()}
            </select>
            <span className="field-help">Links this sign-in to schedules and employee records.</span>
          </label>
          <Button type="submit" disabled={create.isPending || !formIsValid}>{create.isPending ? "Creating…" : "Create user"}</Button>
        </form>

        <section className="card user-access-list" aria-labelledby="existing-users-heading">
          <div className="user-access-card-heading">
            <h3 id="existing-users-heading">Existing users</h3>
            <p>{existingUsers.length} {existingUsers.length === 1 ? "account" : "accounts"}</p>
          </div>
          {users.isPending ? <p role="status">Loading users…</p> : null}
          {!users.isPending && existingUsers.length === 0 ? <p className="user-access-empty">No user accounts yet.</p> : null}
          {existingUsers.length > 0 ? <div className="user-access-columns" aria-hidden="true"><span>User</span><span>Role</span><span>Employee profile</span><span>Action</span></div> : null}
          {existingUsers.map((user) => <div className="user-access-row" key={user.id}>
            <div className="user-access-identity">
              <b title={user.email}>{user.email}</b>
              <span className={`user-status ${user.isActive ? "active" : "inactive"}`}>{user.isActive ? "Active" : "Inactive"}</span>
            </div>
            <label><span className="mobile-label">Role</span><select aria-label={`Role for ${user.email}`} value={user.role} disabled={update.isPending} onChange={(event) => setAccess(user, { role: event.target.value })}>{ROLES.map((role) => <option key={role}>{role}</option>)}</select></label>
            <label><span className="mobile-label">Employee profile</span><select aria-label={`Employee profile for ${user.email}`} value={user.employeeId ?? ""} disabled={update.isPending} onChange={(event) => setAccess(user, { employeeId: event.target.value || null })}><option value="">Not linked</option>{employeeChoices(user.employeeId)}</select></label>
            <Button tone="gray" className={`user-access-action ${user.isActive ? "danger" : ""}`} disabled={update.isPending} onClick={() => toggleAccess(user)}>{user.isActive ? "Deactivate" : "Activate"}</Button>
          </div>)}
        </section>
      </div>
    </section>
  );
}
