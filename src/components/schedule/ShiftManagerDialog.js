import { useEffect, useMemo, useState } from "react";
import {
  useCancelShift,
  useCreateShift,
  useShiftCandidates,
  useUpdateShift,
} from "../../api/schedule";
import Button from "../ui/Button";
import StateMessage from "../ui/StateMessage";
import "./ShiftManagerDialog.css";

const toLocalInput = (value) => {
  const date = new Date(value);
  const part = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}`;
};

const initialDraft = (shift) => ({
  id: shift.id,
  employeeId: shift.employeeId,
  role: shift.role ?? "",
  startTime: toLocalInput(shift.startTime),
  endTime: toLocalInput(shift.endTime),
  requiredSkill: shift.requiredSkill ?? "",
  notes: shift.notes ?? "",
  breakMinutes: shift.breakMinutes ?? 0,
  assignedColor: shift.assignedColor ?? null,
  status: true,
});

const moveOneWeek = (value) => {
  const date = new Date(value);
  date.setDate(date.getDate() + 7);
  return toLocalInput(date);
};

export default function ShiftManagerDialog({ shift, onClose }) {
  const [draft, setDraft] = useState(() => initialDraft(shift));
  const [message, setMessage] = useState("");
  const updateShift = useUpdateShift();
  const cancelShift = useCancelShift();
  const copyShift = useCreateShift();
  const validWindow = Boolean(draft.startTime && draft.endTime && new Date(draft.endTime) > new Date(draft.startTime));
  const candidates = useShiftCandidates({
    start: draft.startTime,
    end: draft.endTime,
    role: draft.role,
    excludeShiftId: shift.id,
  });
  const busy = updateShift.isPending || cancelShift.isPending || copyShift.isPending;

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [busy, onClose]);

  const employeeOptions = useMemo(() => {
    const options = candidates.data ?? [];
    return options.some((candidate) => candidate.employeeId === draft.employeeId)
      ? options
      : [{ employeeId: draft.employeeId, fullName: shift.employeeName, status: "Current assignment" }, ...options];
  }, [candidates.data, draft.employeeId, shift.employeeName]);

  const update = (field) => (event) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }));
    setMessage("");
  };

  const save = (event) => {
    event.preventDefault();
    updateShift.mutate(
      { ...draft, breakMinutes: Number(draft.breakMinutes) },
      { onSuccess: onClose }
    );
  };

  const copyToNextWeek = () => {
    copyShift.mutate({
      ...draft,
      id: undefined,
      startTime: moveOneWeek(draft.startTime),
      endTime: moveOneWeek(draft.endTime),
      breakMinutes: Number(draft.breakMinutes),
    }, { onSuccess: () => setMessage("Shift copied to the same time next week.") });
  };

  const cancel = () => {
    if (!window.confirm("Cancel this shift? It will be removed from the schedule.")) return;
    cancelShift.mutate(shift.id, { onSuccess: onClose });
  };

  const error = updateShift.error ?? copyShift.error ?? cancelShift.error;

  return (
    <div className="shift-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !busy && onClose()}>
      <section className="card shift-dialog" role="dialog" aria-modal="true" aria-labelledby="shift-dialog-title">
        <div className="shift-dialog-heading">
          <div>
            <h2 id="shift-dialog-title">Manage shift</h2>
            <p>Edit the details, change the assigned employee, or manage this shift.</p>
          </div>
          <button className="shift-dialog-close" type="button" onClick={onClose} disabled={busy} aria-label="Close shift details">×</button>
        </div>

        <form onSubmit={save}>
          <div className="shift-dialog-grid">
            <label>Role<input required maxLength="100" value={draft.role} onChange={update("role")} /></label>
            <label>
              Assigned employee
              <select value={draft.employeeId} onChange={update("employeeId")} disabled={candidates.isPending}>
                {employeeOptions.map((candidate) => (
                  <option
                    key={candidate.employeeId}
                    value={candidate.employeeId}
                    disabled={candidate.status !== "Available" && candidate.employeeId !== draft.employeeId}
                  >
                    {candidate.fullName ?? candidate.name} — {candidate.status}
                  </option>
                ))}
              </select>
            </label>
            <label>Starts<input required type="datetime-local" value={draft.startTime} onChange={update("startTime")} /></label>
            <label>Ends<input required type="datetime-local" value={draft.endTime} onChange={update("endTime")} /></label>
            <label>Required skill<input maxLength="200" value={draft.requiredSkill} onChange={update("requiredSkill")} /></label>
            <label>Break (minutes)<input type="number" min="0" max="240" value={draft.breakMinutes} onChange={update("breakMinutes")} /></label>
            <label className="shift-dialog-notes">Notes<textarea rows="3" value={draft.notes} onChange={update("notes")} /></label>
          </div>

          {!validWindow ? <StateMessage tone="error" title="Check the shift times" detail="The end time must be after the start time." /> : null}
          {candidates.isError ? <StateMessage tone="error" title="Could not check employee availability" detail={candidates.error?.message} /> : null}
          {error ? <StateMessage tone="error" title="Could not manage shift" detail={error.message} /> : null}
          {message ? <p className="shift-dialog-success" role="status">{message}</p> : null}

          <div className="shift-dialog-actions">
            <Button tone="gray" onClick={cancel} disabled={busy}>Cancel shift</Button>
            <Button tone="gray" onClick={copyToNextWeek} disabled={busy || !validWindow}>
              {copyShift.isPending ? "Copying…" : "Copy to next week"}
            </Button>
            <Button type="submit" disabled={busy || !validWindow || !draft.employeeId}>
              {updateShift.isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
