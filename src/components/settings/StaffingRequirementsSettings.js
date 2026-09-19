import { useState } from "react";
import { usePositions } from "../../api/employees";
import {
  useCreateStaffingRequirement,
  useDeleteStaffingRequirement,
  useStaffingRequirements,
  useUpdateStaffingRequirement,
} from "../../api/staffing";
import Button from "../ui/Button";
import StateMessage from "../ui/StateMessage";
import "./StaffingRequirementsSettings.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const EMPTY = { dayOfWeek: "Monday", startTime: "08:00", endTime: "17:00", positionId: "", requiredEmployees: 1, isActive: true };
const displayTime = (value) => String(value).slice(0, 5);

export default function StaffingRequirementsSettings() {
  const requirements = useStaffingRequirements();
  const positions = usePositions();
  const create = useCreateStaffingRequirement();
  const update = useUpdateStaffingRequirement();
  const remove = useDeleteStaffingRequirement();
  const [form, setForm] = useState(EMPTY);
  const [message, setMessage] = useState("");
  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const busy = create.isPending || update.isPending || remove.isPending;

  const submit = (event) => {
    event.preventDefault();
    create.mutate({ ...form, positionId: form.positionId ? Number(form.positionId) : null, requiredEmployees: Number(form.requiredEmployees) }, {
      onSuccess: () => { setForm(EMPTY); setMessage("Staffing requirement added."); },
    });
  };

  const toggle = (item) => update.mutate({
    ...item,
    startTime: displayTime(item.startTime),
    endTime: displayTime(item.endTime),
    isActive: !item.isActive,
  }, { onSuccess: () => setMessage(`Requirement ${item.isActive ? "paused" : "activated"}.`) });

  const deleteItem = (item) => {
    if (!window.confirm(`Delete the ${item.dayOfWeek} ${item.positionTitle} requirement?`)) return;
    remove.mutate(item.id, { onSuccess: () => setMessage("Staffing requirement deleted.") });
  };

  const error = requirements.error ?? positions.error ?? create.error ?? update.error ?? remove.error;

  return (
    <section className="staffing-settings" aria-labelledby="staffing-settings-heading">
      <div className="staffing-settings-copy">
        <h2 id="staffing-settings-heading">Staffing requirements</h2>
        <p>Set the minimum number of employees needed for recurring time windows.</p>
      </div>
      {error ? <StateMessage tone="error" title="Could not manage staffing requirements" detail={error.message} /> : null}
      {message ? <p className="staffing-settings-message" role="status">{message}</p> : null}
      <div className="staffing-settings-layout">
        <form className="card staffing-form" onSubmit={submit}>
          <h3>Add requirement</h3>
          <label>Day<select value={form.dayOfWeek} onChange={change("dayOfWeek")}>{DAYS.map((day) => <option key={day}>{day}</option>)}</select></label>
          <div className="staffing-time-grid">
            <label>Starts<input required type="time" value={form.startTime} onChange={change("startTime")} /></label>
            <label>Ends<input required type="time" value={form.endTime} onChange={change("endTime")} /></label>
          </div>
          <label>Position<select value={form.positionId} onChange={change("positionId")}><option value="">Any position</option>{(positions.data ?? []).filter((position) => position.isActive).map((position) => <option key={position.positionId} value={position.positionId}>{position.title}</option>)}</select></label>
          <label>Employees required<input required type="number" min="1" max="100" value={form.requiredEmployees} onChange={change("requiredEmployees")} /></label>
          <Button type="submit" disabled={busy || form.startTime === form.endTime}>{create.isPending ? "Adding…" : "Add requirement"}</Button>
        </form>

        <section className="card staffing-list">
          <h3>Current requirements</h3>
          {requirements.isPending ? <p>Loading requirements…</p> : null}
          {requirements.isSuccess && requirements.data.length === 0 ? <p>No staffing requirements have been configured.</p> : null}
          <ul>{(requirements.data ?? []).map((item) => <li key={item.id} className={item.isActive ? "" : "paused"}>
            <div><b>{item.dayOfWeek} · {displayTime(item.startTime)}–{displayTime(item.endTime)}</b><p>{item.positionTitle} · {item.requiredEmployees} required</p></div>
            <div className="staffing-list-actions"><button type="button" onClick={() => toggle(item)} disabled={busy}>{item.isActive ? "Pause" : "Activate"}</button><button type="button" onClick={() => deleteItem(item)} disabled={busy}>Delete</button></div>
          </li>)}</ul>
        </section>
      </div>
    </section>
  );
}
