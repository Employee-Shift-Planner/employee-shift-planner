import { useMemo, useState } from "react";
import Button from "../ui/Button";
import StateMessage from "../ui/StateMessage";
import { useCancelShift, useCreateShift, useShiftCandidates, useUpdateShift } from "../../api/schedule";
import { formatShiftRange } from "../../lib/format";
import "./ScheduleBuilder.css";

const VIEWS = ["Employee", "Position", "Coverage"];
const dayIndex = (value, weekStart) => Math.max(0, Math.min(6, Math.floor((new Date(value) - weekStart) / 86400000)));

export default function ScheduleBuilder({ shifts, employees, requirements, weekStart, days, onOpenShift }) {
  const [view, setView] = useState("Employee");
  const [selected, setSelected] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [bulk, setBulk] = useState({ role:"", requiredSkill:"", breakMinutes:"" });
  const [fillEmployee, setFillEmployee] = useState("");
  const [undo, setUndo] = useState(null);
  const [message, setMessage] = useState("");
  const update = useUpdateShift();
  const create = useCreateShift();
  const cancel = useCancelShift();
  const busy = update.isPending || create.isPending || cancel.isPending;

  const employeeById = useMemo(() => Object.fromEntries(employees.map(x => [x.employeeId, x])), [employees]);
  const departments = useMemo(() => [...new Set(shifts.map(x => x.role).filter(Boolean))].sort(), [shifts]);
  const positions = useMemo(() => [...new Set(employees.map(x => x.positionTitle).filter(Boolean))].sort(), [employees]);
  const filteredEmployees = useMemo(() => employees.filter(employee =>
    (!employeeFilter || employee.fullName.toLowerCase().includes(employeeFilter.toLowerCase())) &&
    (!positionFilter || employee.positionTitle === positionFilter)), [employees, employeeFilter, positionFilter]);
  const filteredShifts = useMemo(() => shifts.filter(shift =>
    (!departmentFilter || shift.role === departmentFilter) &&
    filteredEmployees.some(employee => employee.employeeId === shift.employeeId)), [shifts, filteredEmployees, departmentFilter]);
  const chosen = filteredShifts.filter(x => selected.includes(x.id));
  const fillShift = chosen.length === 1 ? chosen[0] : null;
  const fillCandidates = useShiftCandidates({ start:fillShift?.startTime, end:fillShift?.endTime, role:fillShift?.role,
    requiredSkill:fillShift?.requiredSkill, breakMinutes:fillShift?.breakMinutes, excludeShiftId:fillShift?.id });
  const toggle = id => setSelected(value => value.includes(id) ? value.filter(x => x !== id) : [...value, id]);

  const saveMany = async (next, success, undoValue = chosen) => {
    setMessage("");
    try {
      for (const shift of next) await update.mutateAsync(shift);
      setUndo(undoValue.length ? { type:"restore", shifts:undoValue.map(x => ({ ...x })) } : null);
      setSelected([]);
      setMessage(success);
    } catch { /* mutation error is rendered below and selection stays intact */ }
  };
  const reassign = (shift, employeeId) => employeeId !== shift.employeeId && saveMany([{ ...shift, employeeId }], `Reassigned ${shift.role || "shift"}.`, [shift]);
  const applyBulk = () => {
    if (!chosen.length) return;
    const next = chosen.map(shift => ({ ...shift,
      role:bulk.role || shift.role,
      requiredSkill:bulk.requiredSkill || shift.requiredSkill,
      breakMinutes:bulk.breakMinutes === "" ? shift.breakMinutes : Number(bulk.breakMinutes),
    }));
    saveMany(next, `Updated ${next.length} shift${next.length === 1 ? "" : "s"}.`);
  };
  const duplicate = async () => {
    setMessage("");
    try {
      const copies = [];
      for (const shift of chosen) copies.push(await create.mutateAsync({ ...shift, id:0, isPublished:false }));
      setUndo({ type:"delete", ids:copies.map(x => x.id) });
      setSelected([]); setMessage(`Duplicated ${chosen.length} shift${chosen.length === 1 ? "" : "s"}.`);
    } catch { /* mutation error is rendered below */ }
  };
  const undoLast = async () => {
    if (!undo) return;
    const operation = undo; setUndo(null);
    if (operation.type === "delete") {
      try { for (const id of operation.ids) await cancel.mutateAsync(id); setMessage("Duplicated shifts were removed."); }
      catch { setUndo(operation); }
      return;
    }
    await saveMany(operation.shifts, "Last schedule change was undone.", []);
  };
  const fill = () => chosen.length === 1 && fillEmployee && reassign(chosen[0], fillEmployee);

  return <section className="schedule-builder">
    <div className="schedule-toolbar card">
      <div className="view-tabs" role="tablist">{VIEWS.map(item => <button key={item} role="tab" aria-selected={view === item} onClick={() => setView(item)}>{item} view</button>)}</div>
      <div className="schedule-filters">
        <label>Employee<input value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} placeholder="Search employees" /></label>
        <label>Department<select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}><option value="">All departments</option>{departments.map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Position<select value={positionFilter} onChange={e => setPositionFilter(e.target.value)}><option value="">All positions</option>{positions.map(x => <option key={x}>{x}</option>)}</select></label>
      </div>
    </div>

    {selected.length ? <div className="bulk-toolbar card" role="region" aria-label="Bulk shift actions">
      <b>{selected.length} selected</b>
      <input value={bulk.role} onChange={e => setBulk(x => ({ ...x, role:e.target.value }))} placeholder="Department/role" />
      <input value={bulk.requiredSkill} onChange={e => setBulk(x => ({ ...x, requiredSkill:e.target.value }))} placeholder="Required skill" />
      <input type="number" min="0" max="240" value={bulk.breakMinutes} onChange={e => setBulk(x => ({ ...x, breakMinutes:e.target.value }))} placeholder="Break min" />
      <Button disabled={busy} onClick={applyBulk}>{update.isPending ? "Saving…" : "Apply bulk edit"}</Button>
      <Button tone="gray" disabled={busy} onClick={duplicate}>{create.isPending ? "Duplicating…" : "Duplicate"}</Button>
      <select aria-label="Fill or reassign employee" value={fillEmployee} disabled={!fillShift || fillCandidates.isPending} onChange={e => setFillEmployee(e.target.value)}><option value="">{fillCandidates.isPending ? "Checking eligibility…" : "Choose eligible employee"}</option>{(fillCandidates.data ?? []).filter(x => x.status === "Available" && x.employeeId !== fillShift?.employeeId).map(x => <option value={x.employeeId} key={x.employeeId}>{x.fullName}</option>)}</select>
      <Button tone="success" disabled={busy || !fillShift || !fillEmployee} onClick={fill}>Fill open shift</Button>
      <button className="clear-selection" onClick={() => setSelected([])}>Clear</button>
    </div> : null}
    {undo ? <div className="undo-bar" role="status"><span>{message || "Schedule updated."}</span><Button tone="gray" disabled={busy} onClick={undoLast}>Undo</Button></div> : message ? <div className="undo-bar" role="status">{message}</div> : null}
    {(update.isError || create.isError || cancel.isError) ? <StateMessage tone="error" title="Schedule change was not saved" detail={(update.error ?? create.error ?? cancel.error)?.message} /> : null}

    {view === "Employee" ? <EmployeeView employees={filteredEmployees} shifts={filteredShifts} days={days} weekStart={weekStart} selected={selected} toggle={toggle} open={onOpenShift} reassign={reassign} busy={busy} /> : null}
    {view === "Position" ? <PositionView shifts={filteredShifts} selected={selected} toggle={toggle} open={onOpenShift} /> : null}
    {view === "Coverage" ? <CoverageView shifts={filteredShifts} requirements={requirements} employees={employeeById} weekStart={weekStart} days={days} positionFilter={positionFilter} /> : null}
  </section>;
}

function ShiftCell({ shift, selected, toggle, open }) {
  return <div className={`planner-shift${selected ? " selected" : ""}`} draggable onDragStart={event => event.dataTransfer.setData("text/shift-id", String(shift.id))}>
    <input type="checkbox" checked={selected} onChange={() => toggle(shift.id)} aria-label={`Select ${shift.employeeName} ${formatShiftRange(shift.startTime, shift.endTime)}`} />
    <button onClick={() => open(shift)}><b>{formatShiftRange(shift.startTime, shift.endTime)}</b><span>{shift.role || "Shift"}</span></button>
  </div>;
}

function EmployeeView({ employees, shifts, days, weekStart, selected, toggle, open, reassign, busy }) {
  return <div className="planner-grid card"><div className="planner-grid-row planner-grid-head"><b>Employee</b>{days.map(day => <b key={day}>{day}</b>)}</div>
    {employees.map(employee => <div className="planner-grid-row" key={employee.employeeId} onDragOver={e => e.preventDefault()} onDrop={e => { const shift=shifts.find(x => x.id === Number(e.dataTransfer.getData("text/shift-id"))); if (shift && !busy) reassign(shift, employee.employeeId); }}>
      <strong>{employee.fullName}<small>{employee.positionTitle || "Unassigned"}</small></strong>
      {days.map((day, index) => <div className="planner-day-cell" key={day}>{shifts.filter(x => x.employeeId === employee.employeeId && dayIndex(x.startTime, weekStart) === index).map(shift => <ShiftCell key={shift.id} shift={shift} selected={selected.includes(shift.id)} toggle={toggle} open={open} />)}{!shifts.some(x => x.employeeId === employee.employeeId && dayIndex(x.startTime, weekStart) === index) ? <span className="off">OFF</span> : null}</div>)}
    </div>)}</div>;
}

function PositionView({ shifts, selected, toggle, open }) {
  const groups = Object.entries(shifts.reduce((all, shift) => { const key=shift.role || "Unassigned"; (all[key] ||= []).push(shift); return all; }, {})).sort();
  return <div className="position-view">{groups.map(([position, items]) => <section className="card" key={position}><h2>{position}</h2>{items.sort((a,b) => new Date(a.startTime)-new Date(b.startTime)).map(shift => <ShiftCell key={shift.id} shift={shift} selected={selected.includes(shift.id)} toggle={toggle} open={open} />)}</section>)}</div>;
}

function CoverageView({ shifts, requirements, employees, weekStart, days, positionFilter }) {
  const [day, setDay] = useState(0);
  const hours = Array.from({ length:19 }, (_, i) => i + 5);
  const date = new Date(weekStart); date.setDate(date.getDate() + day);
  const datePart = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const dayName = date.toLocaleDateString("en-US", { weekday:"long" });
  const relevant = requirements.filter(x => x.isActive && x.dayOfWeek === dayName && (!positionFilter || x.positionTitle === positionFilter));
  const count = hour => { const slot = new Date(`${datePart}T${String(hour).padStart(2, "0")}:00:00${process.env.REACT_APP_ORGANIZATION_UTC_OFFSET || "-05:00"}`); return shifts.filter(shift => new Date(shift.startTime) <= slot && new Date(shift.endTime) > slot && (!positionFilter || employees[shift.employeeId]?.positionTitle === positionFilter)).length; };
  const required = hour => relevant.filter(x => { const start=Number(String(x.startTime).slice(0,2)), end=Number(String(x.endTime).slice(0,2)); return start < end ? hour >= start && hour < end : hour >= start || hour < end; }).reduce((sum,x) => sum + x.requiredEmployees, 0);
  return <section className="coverage-view card"><div className="coverage-day-tabs">{days.map((label,index) => <button className={day === index ? "active" : ""} onClick={() => setDay(index)} key={label}>{label}</button>)}</div><div className="coverage-scroll"><table><thead><tr><th></th>{hours.map(hour => <th key={hour}>{hour % 12 || 12}{hour < 12 ? "AM" : "PM"}</th>)}</tr></thead><tbody><tr><th>Required</th>{hours.map(hour => <td key={hour}>{required(hour)}</td>)}</tr><tr><th>Scheduled</th>{hours.map(hour => { const scheduled=count(hour), needed=required(hour); return <td className={scheduled < needed ? "gap" : ""} key={hour}>{scheduled}{scheduled < needed ? <small>GAP</small> : null}</td>; })}</tr></tbody></table></div></section>;
}
