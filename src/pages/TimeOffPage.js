import { useConfirm } from "../components/ui/ConfirmProvider";
import useUnsavedChanges from "../lib/useUnsavedChanges";
import { useState } from "react";
import useIsMobile from "../lib/useIsMobile";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import StateMessage from "../components/ui/StateMessage";
import Skeleton from "../components/ui/Skeleton";
import { useCurrentEmployee, useEmployees } from "../api/employees";
import {
  useCreateTimeOffRequest,
  useUpdateTimeOffRequest,
  useDeleteTimeOffRequest,
  useReviewTimeOffRequest,
  useTimeOffRequests,
} from "../api/timeOff";
import { toDateParam } from "../lib/format";
import { isManager } from "../api/auth";
import "./TimeOffPage.css";

const today = () => toDateParam(new Date());
const TYPES = ["Vacation", "Sick leave", "Personal leave", "Bereavement leave", "Maternity leave", "Paternity leave", "Unpaid leave"];
const EMPTY = { employeeId: "", startDate: today(), endDate: today(), type:"Vacation", customType:"" };

const formatDates = (request) => request.startDate === request.endDate
  ? request.startDate
  : `${request.startDate} – ${request.endDate}`;

export default function TimeOffPage() {
  const confirm = useConfirm();
  const [editingId, setEditingId] = useState(null);
  const updateRequest = useUpdateTimeOffRequest();
  const deleteRequest = useDeleteTimeOffRequest();
  const mobile = useIsMobile();
  const manager = isManager();
  const employees = useEmployees({ enabled: manager });
  const currentEmployee = useCurrentEmployee({ enabled: !manager });
  const requests = useTimeOffRequests();
  const createRequest = useCreateTimeOffRequest();
  const reviewRequest = useReviewTimeOffRequest();
  const [form, setForm] = useState(EMPTY);
  const [reviewNotes, setReviewNotes] = useState({});
  useUnsavedChanges(Boolean(editingId || form.customType || form.type !== EMPTY.type || form.employeeId || form.startDate !== EMPTY.startDate || form.endDate !== EMPTY.endDate || Object.values(reviewNotes).some(Boolean)));
  const [message, setMessage] = useState("");

  const pending = requests.data?.filter((request) => request.status === "Pending") ?? [];
  const reviewed = requests.data?.filter((request) => request.status !== "Pending") ?? [];
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const employeeId = manager ? form.employeeId : currentEmployee.data?.employeeId;

  const overlapping = (requests.data ?? []).some(item => item.id !== editingId && item.employeeId === employeeId && ["Pending", "Approved"].includes(item.status) && item.startDate <= form.endDate && form.startDate <= item.endDate);
  const dateError = form.endDate < form.startDate ? "The end date must be on or after the start date." : overlapping ? "A pending or approved request already overlaps these dates." : "";
  const disabledReason = !employeeId ? "Select an employee to continue." : requests.isPending ? "Checking existing time-off requests…" : requests.isError ? "Existing requests could not be checked. Try again before submitting." : dateError;
  const submit = (event) => {
    event.preventDefault();
    if (disabledReason) return;
    const reason = form.type === "Custom" ? form.customType.trim() : form.type;
    if (!reason) return;
    const mutation = editingId ? updateRequest : createRequest;
    mutation.mutate({ ...(editingId ? { id:editingId } : {}), ...form, employeeId, reason, type:reason }, {
      onSuccess: () => {
        setForm({ ...EMPTY, startDate: today(), endDate: today() });
        setEditingId(null);
        setMessage("Time-off request submitted for review.");
      },
    });
  };

  const review = (request, decision) => {
    reviewRequest.mutate({ id: request.id, decision, reviewNotes: reviewNotes[request.id] ?? "" }, {
      onSuccess: () => {
        setMessage(`${request.employeeName}'s request was ${decision.toLowerCase()}.`);
        setReviewNotes((current) => ({ ...current, [request.id]: "" }));
      },
    });
  };

  const busy = createRequest.isPending || updateRequest.isPending || deleteRequest.isPending || reviewRequest.isPending;
  const edit = request => {
    setEditingId(request.id);
    setForm({ employeeId:request.employeeId, startDate:request.startDate, endDate:request.endDate,
      type:TYPES.includes(request.type) ? request.type : "Custom",
      customType:TYPES.includes(request.type) ? "" : request.type || "Personal leave" });
    setMessage("");
  };
  const remove = async request => {
    if (!await confirm(`Delete the time-off request for ${request.employeeName} (${formatDates(request)})?`, "Delete request")) return;
    deleteRequest.mutate(request.id, { onSuccess: () => {
      if (editingId === request.id) { setEditingId(null); setForm({ ...EMPTY }); }
      setMessage("Time-off request deleted.");
    } });
  };
  const actions = request => <div className="time-off-actions">
    <Button type="button" tone="gray" disabled={busy} onClick={() => edit(request)}>Edit</Button>
    <Button type="button" tone="gray" disabled={busy} onClick={() => remove(request)}>Delete</Button>
  </div>;
  const error = createRequest.error ?? updateRequest.error ?? deleteRequest.error ?? reviewRequest.error;

  return (
    <Shell active="Time off" title="Time Off" copy="Submit employee leave and review requests before building the schedule.">
      {error ? <StateMessage tone="error" title="Could not update time off" detail={error.message} /> : null}
      {message ? <div className="time-off-message" role="status">{message}</div> : null}

      <div className="time-off-layout">
{manager ? <section className="card time-off-queue">
          <div className="time-off-section-heading">
            <h2>Pending approval</h2>
            <span>{pending.length}</span>
          </div>
          {requests.isPending ? <Skeleton label="Loading requests…" /> : null}
          {requests.isError ? <StateMessage tone="error" title="Could not load requests" detail={requests.error?.message} /> : null}
          {requests.isSuccess && pending.length === 0 ? <p>No requests are waiting for approval.</p> : null}
          {pending.map((request) => (
            <article className="time-off-request" key={request.id}>
              <div><b>{request.employeeName}</b><span>{formatDates(request)}</span></div>
              <p><b>{request.type || request.reason || "Personal leave"}</b></p>
              {actions(request)}
              <textarea
                rows="2"
                maxLength="500"
                value={reviewNotes[request.id] ?? ""}
                onChange={(event) => setReviewNotes((current) => ({ ...current, [request.id]: event.target.value }))}
                placeholder="Optional review note"
                aria-label={`Review note for ${request.employeeName}`}
              />
              <div className="time-off-actions">
                <Button tone="gray" disabled={reviewRequest.isPending} onClick={() => review(request, "Rejected")}>Reject</Button>
                <Button tone="success" disabled={reviewRequest.isPending} onClick={() => review(request, "Approved")}>Approve</Button>
              </div>
            </article>
          ))}
        </section> : <section className="card time-off-queue"><div className="time-off-section-heading"><h2>Your pending requests</h2><span>{pending.length}</span></div>{requests.isPending ? <Skeleton label="Loading your requests…" /> : requests.isError ? <StateMessage tone="error" title="Could not load requests" detail={requests.error?.message} /> : pending.length === 0 ? <p>You have no requests waiting for review.</p> : pending.map((request) => <article className="time-off-request" key={request.id}><div><b>{formatDates(request)}</b><span>Pending</span></div>{actions(request)}<p><b>{request.type || request.reason || "Personal leave"}</b></p></article>)}</section>}

        <form className="card time-off-form" onSubmit={submit}>
          <h2>{editingId ? "Edit request" : "New request"}</h2>
          {editingId ? <p>Saving changes returns this request to Pending for review.</p> : null}
          {manager ? <label>Employee<select required disabled={Boolean(editingId)} value={form.employeeId} onChange={update("employeeId")}><option value="">Select employee</option>{(employees.data ?? []).map((employee) => <option key={employee.employeeId} value={employee.employeeId}>{employee.fullName}</option>)}</select></label> : <label>Employee<input readOnly value={currentEmployee.data?.fullName ?? "Loading your profile…"} /></label>}
          <div className="time-off-date-grid">
            <label>From<input required type="date" value={form.startDate} onChange={update("startDate")} /></label>
            <label>Through<input aria-invalid={Boolean(dateError)} aria-describedby={dateError ? "time-off-date-error" : undefined} required type="date" min={form.startDate} value={form.endDate} onChange={update("endDate")} /></label>
          </div>
          {dateError ? <p id="time-off-date-error" className="field-error" role="alert">{dateError}</p> : null}
          <label>Reason<select required value={form.type} onChange={update("type")}>{TYPES.map(type => <option key={type}>{type}</option>)}<option value="Custom">Custom…</option></select></label>
          {form.type === "Custom" ? <label>Custom reason<input required maxLength="100" value={form.customType} onChange={update("customType")} /></label> : null}
          {(manager ? employees : currentEmployee).isError ? <StateMessage tone="error" title="Could not load employee profile" detail={(manager ? employees : currentEmployee).error?.message} /> : null}
          <p className="field-help">Leave balances are not available here. Confirm your remaining entitlement with your administrator.</p>
          {disabledReason ? <p id="time-off-submit-reason" role="status">{disabledReason}</p> : null}
          <Button type="submit" aria-describedby={disabledReason ? "time-off-submit-reason" : undefined} disabled={busy || Boolean(disabledReason) || (form.type === "Custom" && !form.customType.trim())}>
            {busy ? "Saving…" : editingId ? "Save changes" : "Submit request"}
          </Button>
          {editingId ? <Button type="button" tone="gray" disabled={busy} onClick={() => { setEditingId(null); setForm({ ...EMPTY }); }}>Cancel editing</Button> : null}
        </form>
      </div>

      <section className="card time-off-history">
        <h2>{manager ? "Request history" : "Your request history"}</h2>
        {requests.isPending ? <Skeleton label="Loading request history…" /> : requests.isError ? <StateMessage tone="error" title="Could not load request history" detail={requests.error?.message} /> : reviewed.length === 0 ? <p>No requests have been reviewed yet.</p> : mobile ? <div className="request-history-cards">{reviewed.map(request => <details key={request.id} className="request-history-card"><summary><b>{manager ? request.employeeName : formatDates(request)}</b><span className={`time-off-status ${request.status.toLowerCase()}`}>{request.status}</span></summary><p>{formatDates(request)}</p><p><b>{request.type || request.reason || "Personal leave"}</b></p><p>Review note: {request.reviewNotes || "No note provided"}</p>{actions(request)}</details>)}</div> : (
          <div className="time-off-table-wrap"><table><thead><tr><th>Employee</th><th>Dates</th><th>Reason</th><th>Status</th><th>Review note</th><th>Actions</th></tr></thead><tbody>
            {reviewed.map((request) => <tr key={request.id}><td>{request.employeeName}</td><td>{formatDates(request)}</td><td>{request.type || request.reason || "Personal leave"}</td><td><span className={`time-off-status ${request.status.toLowerCase()}`}>{request.status}</span></td><td>{request.reviewNotes || "—"}</td><td>{actions(request)}</td></tr>)}
          </tbody></table></div>
        )}
      </section>
    </Shell>
  );
}
