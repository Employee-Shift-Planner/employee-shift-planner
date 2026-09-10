import { useState } from "react";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import StateMessage from "../components/ui/StateMessage";
import { useEmployees } from "../api/employees";
import {
  useCreateTimeOffRequest,
  useReviewTimeOffRequest,
  useTimeOffRequests,
} from "../api/timeOff";
import { toDateParam } from "../lib/format";
import "./TimeOffPage.css";

const today = () => toDateParam(new Date());
const EMPTY = { employeeId: "", startDate: today(), endDate: today(), reason: "" };

const formatDates = (request) => request.startDate === request.endDate
  ? request.startDate
  : `${request.startDate} – ${request.endDate}`;

export default function TimeOffPage() {
  const employees = useEmployees();
  const requests = useTimeOffRequests();
  const createRequest = useCreateTimeOffRequest();
  const reviewRequest = useReviewTimeOffRequest();
  const [form, setForm] = useState(EMPTY);
  const [reviewNotes, setReviewNotes] = useState({});
  const [message, setMessage] = useState("");

  const pending = requests.data?.filter((request) => request.status === "Pending") ?? [];
  const reviewed = requests.data?.filter((request) => request.status !== "Pending") ?? [];
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    createRequest.mutate(form, {
      onSuccess: () => {
        setForm({ ...EMPTY, startDate: today(), endDate: today() });
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

  const error = createRequest.error ?? reviewRequest.error;

  return (
    <Shell active="Time off" title="Time Off" copy="Submit employee leave and review requests before building the schedule.">
      {error ? <StateMessage tone="error" title="Could not update time off" detail={error.message} /> : null}
      {message ? <div className="time-off-message" role="status">{message}</div> : null}

      <div className="time-off-layout">
        <form className="card time-off-form" onSubmit={submit}>
          <h2>New request</h2>
          <label>
            Employee
            <select required value={form.employeeId} onChange={update("employeeId")}>
              <option value="">Select employee</option>
              {(employees.data ?? []).map((employee) => <option key={employee.employeeId} value={employee.employeeId}>{employee.fullName}</option>)}
            </select>
          </label>
          <div className="time-off-date-grid">
            <label>From<input required type="date" value={form.startDate} onChange={update("startDate")} /></label>
            <label>Through<input required type="date" min={form.startDate} value={form.endDate} onChange={update("endDate")} /></label>
          </div>
          <label>
            Reason
            <textarea required maxLength="500" rows="4" value={form.reason} onChange={update("reason")} placeholder="Vacation, appointment, personal leave…" />
          </label>
          {employees.isError ? <StateMessage tone="error" title="Could not load employees" detail={employees.error?.message} /> : null}
          <Button type="submit" disabled={createRequest.isPending || !form.employeeId || form.endDate < form.startDate}>
            {createRequest.isPending ? "Submitting…" : "Submit request"}
          </Button>
        </form>

        <section className="card time-off-queue">
          <div className="time-off-section-heading">
            <h2>Pending approval</h2>
            <span>{pending.length}</span>
          </div>
          {requests.isPending ? <p>Loading requests…</p> : null}
          {requests.isError ? <StateMessage tone="error" title="Could not load requests" detail={requests.error?.message} /> : null}
          {requests.isSuccess && pending.length === 0 ? <p>No requests are waiting for approval.</p> : null}
          {pending.map((request) => (
            <article className="time-off-request" key={request.id}>
              <div><b>{request.employeeName}</b><span>{formatDates(request)}</span></div>
              <p>{request.reason}</p>
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
        </section>
      </div>

      <section className="card time-off-history">
        <h2>Request history</h2>
        {reviewed.length === 0 ? <p>No requests have been reviewed yet.</p> : (
          <div className="time-off-table-wrap"><table><thead><tr><th>Employee</th><th>Dates</th><th>Reason</th><th>Status</th><th>Review note</th></tr></thead><tbody>
            {reviewed.map((request) => <tr key={request.id}><td>{request.employeeName}</td><td>{formatDates(request)}</td><td>{request.reason}</td><td><span className={`time-off-status ${request.status.toLowerCase()}`}>{request.status}</span></td><td>{request.reviewNotes || "—"}</td></tr>)}
          </tbody></table></div>
        )}
      </section>
    </Shell>
  );
}
