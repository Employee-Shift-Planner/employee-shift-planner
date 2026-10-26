import { useWorkWeekStartDay } from "../api/organization";
import useUnsavedChanges from "../lib/useUnsavedChanges";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Modal from "../components/ui/Modal";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import ShiftDetailsCard from "../components/schedule/ShiftDetailsCard";
import AssignEmployees from "../components/schedule/AssignEmployees";
import ConflictBanner from "../components/schedule/ConflictBanner";
import ShiftTemplateTools from "../components/schedule/ShiftTemplateTools";
import { useCreateShift, useShiftCandidates } from "../api/schedule";
import { useHolidays } from "../api/holidays";
import { usePositions } from "../api/employees";
import StateMessage from "../components/ui/StateMessage";
import { formatShiftRangeLong, startOfWeek, toDateParam, toOrganizationInstant } from "../lib/format";
import { fromDateParam } from "../utils/week";
import "./CreateShiftPage.css";

export default function CreateShiftPage() {
  const workWeekStartDay = useWorkWeekStartDay();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedWeek = useMemo(() => {
    const requested = fromDateParam(searchParams.get("week"));
    return startOfWeek(requested ?? new Date(), workWeekStartDay);
  }, [searchParams, workWeekStartDay]);
  const schedulePath = `/schedule?week=${toDateParam(selectedWeek)}`;
  const backToSchedule = () => navigate(schedulePath);
  const initial = useMemo(() => {
    const start = new Date(selectedWeek); start.setHours(8, 0, 0, 0);
    const end = new Date(start); end.setHours(12);
    const local = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    return { role: "", startTime: local(start), endTime: local(end), requiredSkill: "", notes: "", breakMinutes: 0 };
  }, [selectedWeek]);
  const [draft, setDraft] = useState(initial);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const markSaved = useUnsavedChanges(JSON.stringify(draft) !== JSON.stringify(initial) || Boolean(employeeId));
  const candidates = useShiftCandidates({ start: draft.startTime, end: draft.endTime, role: draft.role, requiredSkill: draft.requiredSkill, breakMinutes: draft.breakMinutes });
  const create = useCreateShift();
  const shiftDate = draft.startTime?.slice(0, 10);
  const holidays = useHolidays(shiftDate, shiftDate);
  const positions = usePositions();
  const dayHoliday = holidays.data?.[0];
  const validWindow = Boolean(draft.startTime && draft.endTime && new Date(draft.endTime) > new Date(draft.startTime));
  const validBreak = Number(draft.breakMinutes) >= 0 && Number(draft.breakMinutes) <= 240;
  const selected = candidates.data?.find(candidate => candidate.employeeId === employeeId && candidate.status === "Available");
  const canSubmit = Boolean(draft.role.trim() && selected && validWindow && validBreak && dayHoliday?.schedulingPolicy !== "Closed" && !candidates.isFetching && !candidates.isError && !create.isPending);
  const disabledReason = !validWindow ? "Choose an end time after the start time." : !validBreak ? "Breaks must be between 0 and 240 minutes." : !draft.role.trim() ? "Choose a role for this shift." : dayHoliday?.schedulingPolicy === "Closed" ? "Scheduling is closed on this holiday." : candidates.isFetching ? "Checking employee eligibility…" : candidates.isError ? "Employee eligibility could not be checked." : !selected ? "Select an available employee to continue." : "Review the shift, then save it as a draft.";
  const update = (field, value) => { setDraft((current) => ({ ...current, [field]: value })); if (["role", "requiredSkill", "breakMinutes", "startTime", "endTime"].includes(field)) setEmployeeId(""); };
  const applyTemplate = (template) => { setDraft((current) => ({ ...current, ...template })); setEmployeeId(""); };
  const submit = () => {
    if (!canSubmit) return;
    create.mutate({ ...draft, isPublished: false, employeeId, breakMinutes: Number(draft.breakMinutes), status: true, assignedColor: null }, { onSuccess: () => { markSaved(); backToSchedule(); } });
  };
  const conflict = candidates.data?.find((candidate) => candidate.status !== "Available");

  return (
    <Shell
      active="Schedule"
      title="Create shift"
      copy={`Planning for the week of ${toDateParam(selectedWeek)}. Assign qualified employees and resolve conflicts before publishing.`}
    >
      <p className="create-flow">1. Shift details → 2. Eligible employee → 3. Review and save draft</p>
      {reviewOpen ? <Modal onClose={() => setReviewOpen(false)} busy={create.isPending} aria-labelledby="create-review-title">
        <h2 id="create-review-title">Review shift</h2>
        <p><strong>{selected?.fullName || selected?.name}</strong><br />{draft.role}</p>
        <p>{draft.startTime.slice(0, 10)} · {formatShiftRangeLong(toOrganizationInstant(draft.startTime), toOrganizationInstant(draft.endTime))}<br />Ends {draft.endTime.slice(0, 10)} · {draft.breakMinutes} minute break</p>
        {draft.notes ? <p>{draft.notes}</p> : null}
        <p>This shift is saved as a draft. Employees will see it when you publish the week.</p>
        {create.isError ? <StateMessage tone="error" title="Could not save draft" detail={create.error?.message} /> : null}
        <div className="modal-actions"><Button tone="gray" disabled={create.isPending} onClick={() => setReviewOpen(false)}>Back to editing</Button><Button disabled={!canSubmit} onClick={submit}>{create.isPending ? "Saving…" : "Save draft"}</Button></div>
      </Modal> : null}
      <ShiftTemplateTools shift={draft} weekStart={selectedWeek} onApply={applyTemplate} />
      <div className="create">
        <ShiftDetailsCard shift={draft} positions={positions.data ?? []} onChange={update} />
        <div>
          {candidates.isPending ? <StateMessage title="Checking availability…" /> : candidates.isError ? <StateMessage tone="error" title="Could not check candidates" detail={candidates.error?.message} /> : <AssignEmployees candidates={candidates.data ?? []} selectedId={employeeId} onSelect={setEmployeeId} />}
          {conflict ? <ConflictBanner title="Some employees cannot take this shift" detail={conflict.detail ?? conflict.status} /> : null}
          {dayHoliday ? <StateMessage tone={dayHoliday.schedulingPolicy === "Closed" ? "error" : undefined} title={`${dayHoliday.name} · ${dayHoliday.schedulingPolicy}`} detail={dayHoliday.schedulingPolicy === "Closed" ? "Scheduling is closed on this date." : "This shift falls on a configured holiday; review staffing and pay rules before assigning it."} /> : null}
          {!validWindow ? <StateMessage tone="error" title="Check the shift times" detail="The end time must be after the start time." /> : null}
          {create.isError ? <StateMessage tone="error" title="Could not create shift" detail={create.error?.message} /> : null}
          <div className="create-submit-bar"><p id="create-disabled-reason">{disabledReason}</p><div className="end">
            <Button tone="gray" onClick={backToSchedule}>
              Cancel
            </Button>
            <Button disabled={!canSubmit} aria-describedby="create-disabled-reason" onClick={() => setReviewOpen(true)}>Review shift</Button>
          </div></div>
        </div>
      </div>
    </Shell>
  );
}
