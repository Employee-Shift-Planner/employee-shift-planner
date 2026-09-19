import { useState } from "react";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import StateMessage from "../components/ui/StateMessage";
import { useEmployees } from "../api/employees";
import { isManager } from "../api/auth";
import { useAttendance, useAuditLog, useReviewSwapRequest, useSaveAttendance, useSwapRequests } from "../api/operations";
import { formatShiftRangeLong, toOrganizationDateTimeInput } from "../lib/format";
import "./OperationsPage.css";

export default function OperationsPage() {
  const manager = isManager(); const swaps = useSwapRequests();
  const employees = useEmployees({ enabled: manager }); const attendance = useAttendance(undefined, { enabled: manager }); const audit = useAuditLog({ enabled: manager });
  const review = useReviewSwapRequest(); const saveAttendance = useSaveAttendance();
  const [replacements, setReplacements] = useState({}); const [records, setRecords] = useState({});
  if (!manager) return <Shell active="Operations" title="Shift Requests" copy="Track your shift-swap requests."><section className="card operations-panel"><h2>Your swap requests</h2>{(swaps.data ?? []).map(x => <article key={x.id}><b>{x.role || "Shift"} · {formatShiftRangeLong(x.startTime, x.endTime)}</b><span className={`operation-status ${x.status.toLowerCase()}`}>{x.status}</span><p>{x.reason || "No reason provided"}</p></article>)}</section></Shell>;
  const error = swaps.error ?? employees.error ?? attendance.error ?? audit.error ?? review.error ?? saveAttendance.error;
  const attendanceValue = (item) => records[item.shiftId] ?? {
    status: item.status,
    clockIn: item.clockIn ? toOrganizationDateTimeInput(item.clockIn) : "",
    clockOut: item.clockOut ? toOrganizationDateTimeInput(item.clockOut) : "",
    notes: item.notes ?? "",
  };
  const setAttendanceValue = (item, changes) => setRecords(current => ({ ...current, [item.shiftId]: { ...attendanceValue(item), ...changes } }));
  const hours = value => value == null ? "—" : `${Number(value).toFixed(2).replace(/\.00$/, "")}h`;
  return <Shell active="Operations" title="Operations" copy="Review swaps, record attendance, and inspect workforce changes.">
    {error ? <StateMessage tone="error" title="Could not update operations" detail={error.message} /> : null}
    <section className="card operations-panel"><h2>Pending shift swaps</h2>{(swaps.data ?? []).filter(x => x.status === "Pending").map(x => <article key={x.id}><div><b>{x.employeeName} · {x.role || "Shift"}</b><span>{formatShiftRangeLong(x.startTime, x.endTime)}</span></div><p>{x.reason || "No reason provided"}</p><select value={replacements[x.id] ?? ""} onChange={e => setReplacements(v => ({ ...v, [x.id]: e.target.value }))}><option value="">Select replacement</option>{(employees.data ?? []).filter(e => e.employeeId !== x.requestingEmployeeId).map(e => <option key={e.employeeId} value={e.employeeId}>{e.fullName}</option>)}</select><div className="operation-actions"><Button tone="gray" onClick={() => review.mutate({ id:x.id, decision:"Rejected", replacementEmployeeId:null, reviewNotes:"" })}>Reject</Button><Button tone="success" disabled={!replacements[x.id]} onClick={() => review.mutate({ id:x.id, decision:"Approved", replacementEmployeeId:replacements[x.id], reviewNotes:"" })}>Approve swap</Button></div></article>)}</section>
    <section className="card operations-panel"><h2>Attendance this week</h2><div className="operations-table"><table><thead><tr><th>Employee / shift</th><th>Clock in</th><th>Clock out</th><th>Status</th><th>Scheduled</th><th>Actual</th><th>Lateness</th><th></th></tr></thead><tbody>{(attendance.data ?? []).map(x => { const value = attendanceValue(x); const working = value.status === "Present" || value.status === "Late"; return <tr key={x.shiftId}>
      <td><strong>{x.employeeName}</strong><small>{formatShiftRangeLong(x.shiftStart,x.shiftEnd)}</small></td>
      <td><input type="datetime-local" value={value.clockIn} disabled={!working} onChange={e => setAttendanceValue(x, { clockIn:e.target.value })} /><button type="button" disabled={!working} onClick={() => setAttendanceValue(x, { clockIn:toOrganizationDateTimeInput(new Date()) })}>Now</button></td>
      <td><input type="datetime-local" value={value.clockOut} disabled={!working} onChange={e => setAttendanceValue(x, { clockOut:e.target.value })} /><button type="button" disabled={!working || !value.clockIn} onClick={() => setAttendanceValue(x, { clockOut:toOrganizationDateTimeInput(new Date()) })}>Now</button></td>
      <td><select value={value.status} onChange={e => setAttendanceValue(x, { status:e.target.value, ...(e.target.value === "Absent" || e.target.value === "Excused" ? { clockIn:"", clockOut:"" } : {}) })}><option>Not recorded</option><option>Present</option><option>Late</option><option>Absent</option><option>Excused</option></select></td>
      <td>{hours(x.scheduledHours)}</td><td>{hours(x.actualHours)}</td><td>{x.lateMinutes ? `${x.lateMinutes} min` : "On time"}</td>
      <td><button disabled={value.status === "Not recorded" || (working && !value.clockIn) || saveAttendance.isPending} onClick={() => saveAttendance.mutate({ shiftId:x.shiftId, ...value }, { onSuccess: () => setRecords(current => { const next={...current}; delete next[x.shiftId]; return next; }) })}>Save</button></td>
    </tr>})}</tbody></table></div></section>
    <section className="card operations-panel"><h2>Audit history</h2><div className="operations-table"><table><thead><tr><th>When</th><th>Actor</th><th>Change</th><th>Details</th></tr></thead><tbody>{(audit.data ?? []).map(x => <tr key={x.id}><td>{new Date(x.createdAt).toLocaleString()}</td><td>{x.actor}</td><td>{x.category}: {x.action}</td><td>{x.details || "—"}</td></tr>)}</tbody></table></div></section>
  </Shell>;
}
