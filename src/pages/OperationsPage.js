import { useState } from "react";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import StateMessage from "../components/ui/StateMessage";
import { useEmployees } from "../api/employees";
import { isManager } from "../api/auth";
import { useAttendance, useAuditLog, useReviewSwapRequest, useSaveAttendance, useSwapRequests } from "../api/operations";
import { formatShiftRangeLong } from "../lib/format";
import "./OperationsPage.css";

export default function OperationsPage() {
  const manager = isManager(); const swaps = useSwapRequests();
  const employees = useEmployees({ enabled: manager }); const attendance = useAttendance(undefined, { enabled: manager }); const audit = useAuditLog({ enabled: manager });
  const review = useReviewSwapRequest(); const saveAttendance = useSaveAttendance();
  const [replacements, setReplacements] = useState({}); const [records, setRecords] = useState({});
  if (!manager) return <Shell active="Operations" title="Shift Requests" copy="Track your shift-swap requests."><section className="card operations-panel"><h2>Your swap requests</h2>{(swaps.data ?? []).map(x => <article key={x.id}><b>{x.role || "Shift"} · {formatShiftRangeLong(x.startTime, x.endTime)}</b><span className={`operation-status ${x.status.toLowerCase()}`}>{x.status}</span><p>{x.reason || "No reason provided"}</p></article>)}</section></Shell>;
  const error = swaps.error ?? employees.error ?? attendance.error ?? audit.error ?? review.error ?? saveAttendance.error;
  return <Shell active="Operations" title="Operations" copy="Review swaps, record attendance, and inspect workforce changes.">
    {error ? <StateMessage tone="error" title="Could not update operations" detail={error.message} /> : null}
    <section className="card operations-panel"><h2>Pending shift swaps</h2>{(swaps.data ?? []).filter(x => x.status === "Pending").map(x => <article key={x.id}><div><b>{x.employeeName} · {x.role || "Shift"}</b><span>{formatShiftRangeLong(x.startTime, x.endTime)}</span></div><p>{x.reason || "No reason provided"}</p><select value={replacements[x.id] ?? ""} onChange={e => setReplacements(v => ({ ...v, [x.id]: e.target.value }))}><option value="">Select replacement</option>{(employees.data ?? []).filter(e => e.employeeId !== x.requestingEmployeeId).map(e => <option key={e.employeeId} value={e.employeeId}>{e.fullName}</option>)}</select><div className="operation-actions"><Button tone="gray" onClick={() => review.mutate({ id:x.id, decision:"Rejected", replacementEmployeeId:null, reviewNotes:"" })}>Reject</Button><Button tone="success" disabled={!replacements[x.id]} onClick={() => review.mutate({ id:x.id, decision:"Approved", replacementEmployeeId:replacements[x.id], reviewNotes:"" })}>Approve swap</Button></div></article>)}</section>
    <section className="card operations-panel"><h2>Attendance this week</h2><div className="operations-table"><table><thead><tr><th>Employee</th><th>Shift</th><th>Status</th><th></th></tr></thead><tbody>{(attendance.data ?? []).map(x => { const status=records[x.shiftId] ?? x.status; return <tr key={x.shiftId}><td>{x.employeeName}</td><td>{formatShiftRangeLong(x.shiftStart,x.shiftEnd)}</td><td><select value={status} onChange={e => setRecords(v => ({...v,[x.shiftId]:e.target.value}))}><option>Not recorded</option><option>Present</option><option>Late</option><option>Absent</option><option>Excused</option></select></td><td><button disabled={status === "Not recorded"} onClick={() => saveAttendance.mutate({ shiftId:x.shiftId,status,clockIn:null,clockOut:null,notes:null })}>Save</button></td></tr>})}</tbody></table></div></section>
    <section className="card operations-panel"><h2>Audit history</h2><div className="operations-table"><table><thead><tr><th>When</th><th>Actor</th><th>Change</th><th>Details</th></tr></thead><tbody>{(audit.data ?? []).map(x => <tr key={x.id}><td>{new Date(x.createdAt).toLocaleString()}</td><td>{x.actor}</td><td>{x.category}: {x.action}</td><td>{x.details || "—"}</td></tr>)}</tbody></table></div></section>
  </Shell>;
}
