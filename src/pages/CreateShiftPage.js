import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import ShiftDetailsCard from "../components/schedule/ShiftDetailsCard";
import AssignEmployees from "../components/schedule/AssignEmployees";
import ConflictBanner from "../components/schedule/ConflictBanner";
import { useCreateShift, useShiftCandidates } from "../api/schedule";
import StateMessage from "../components/ui/StateMessage";
import { startOfWeek } from "../lib/format";
import "./CreateShiftPage.css";

export default function CreateShiftPage() {
  const navigate = useNavigate();
  const backToSchedule = () => navigate("/schedule");
  const initial = useMemo(() => {
    const start = startOfWeek(); start.setHours(8, 0, 0, 0);
    const end = new Date(start); end.setHours(12);
    const local = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    return { role: "Customer Support", startTime: local(start), endTime: local(end), requiredSkill: "", notes: "", breakMinutes: 0 };
  }, []);
  const [draft, setDraft] = useState(initial);
  const [employeeId, setEmployeeId] = useState("");
  const candidates = useShiftCandidates({ start: draft.startTime, end: draft.endTime, role: draft.role });
  const create = useCreateShift();
  const validWindow = Boolean(draft.startTime && draft.endTime && new Date(draft.endTime) > new Date(draft.startTime));
  const validBreak = Number(draft.breakMinutes) >= 0 && Number(draft.breakMinutes) <= 240;
  const canSubmit = Boolean(draft.role.trim() && employeeId && validWindow && validBreak && !create.isPending);
  const update = (field, value) => { setDraft((current) => ({ ...current, [field]: value })); if (["role", "startTime", "endTime"].includes(field)) setEmployeeId(""); };
  const submit = () => create.mutate({ ...draft, employeeId, breakMinutes: Number(draft.breakMinutes), status: true, assignedColor: null }, { onSuccess: backToSchedule });
  const conflict = candidates.data?.find((candidate) => candidate.status !== "Available");

  return (
    <Shell
      active="Schedule"
      title="Create shift"
      copy="Assign qualified employees and resolve conflicts before publishing."
    >
      <div className="create">
        <ShiftDetailsCard shift={draft} onChange={update} />
        <div>
          {candidates.isPending ? <StateMessage title="Checking availability…" /> : candidates.isError ? <StateMessage tone="error" title="Could not check candidates" detail={candidates.error?.message} /> : <AssignEmployees candidates={candidates.data ?? []} selectedId={employeeId} onSelect={setEmployeeId} />}
          {conflict ? <ConflictBanner title="Some employees cannot take this shift" detail={conflict.detail ?? conflict.status} /> : null}
          {!validWindow ? <StateMessage tone="error" title="Check the shift times" detail="The end time must be after the start time." /> : null}
          {create.isError ? <StateMessage tone="error" title="Could not create shift" detail={create.error?.message} /> : null}
          <div className="end">
            <Button tone="gray" onClick={backToSchedule}>
              Cancel
            </Button>
            <Button disabled={!canSubmit} onClick={submit}>{create.isPending ? "Creating…" : "Create shift"}</Button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
