import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import { Modal, Form, Alert, Spinner } from "react-bootstrap";
import config from "../../config/config";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./AdminPortal.css";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

const navItems = ["Schedule", "Employees", "Availability", "Reports", "Notifications", "Settings"];
const colours = ["#2e66f2", "#1ca66e", "#7d52f2", "#f5a31f", "#e8404a"];

const demoEmployees = [
  { employeeID: "AB001", firstName: "Alicia", lastName: "Brown", position: "Customer Support", email: "alicia.brown@company.com", maxWeeklyHours: 40 },
  { employeeID: "DR002", firstName: "Daniel", lastName: "Reid", position: "Operations", email: "daniel.reid@company.com", maxWeeklyHours: 40 },
  { employeeID: "SG003", firstName: "Shanice", lastName: "Grant", position: "Front Desk", email: "shanice.grant@company.com", maxWeeklyHours: 40 },
  { employeeID: "OL004", firstName: "Omar", lastName: "Lewis", position: "Supervisor", email: "omar.lewis@company.com", maxWeeklyHours: 40 },
];

const demoShifts = [
  { id: -1, employeeId: "AB001", role: "Customer Support", startTime: "2026-09-07T08:00:00", endTime: "2026-09-07T12:00:00", assignedColor: colours[0], status: true },
  { id: -2, employeeId: "DR002", role: "Operations", startTime: "2026-09-08T09:00:00", endTime: "2026-09-08T14:00:00", assignedColor: colours[1], status: true },
  { id: -3, employeeId: "SG003", role: "Front Desk", startTime: "2026-09-10T10:00:00", endTime: "2026-09-10T16:00:00", assignedColor: colours[3], status: true },
];

const getData = async (endpoint, fallback) => {
  try {
    const { data } = await axios.get(`${config.api.baseUrl}${endpoint}`);
    return Array.isArray(data) ? data : fallback;
  } catch {
    return fallback;
  }
};

function Sidebar({ active, onChange }) {
  return (
    <aside className="shiftly-sidebar">
      <div className="shiftly-brand">SHIFTLY<small>WORKFORCE PLANNER</small></div>
      <nav>
        {navItems.map((item) => (
          <button key={item} className={active === item ? "active" : ""} onClick={() => onChange(item)}>{item}</button>
        ))}
      </nav>
      <div className="shiftly-user"><small>ADMIN</small><strong>Miguel Jackson</strong></div>
    </aside>
  );
}

function PageHeader({ title, subtitle, action }) {
  return <header className="shiftly-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</header>;
}

function Metric({ value, label, tone = "blue" }) {
  return <article className="metric-card"><strong className={tone}>{value}</strong><span>{label}</span></article>;
}

function ScheduleView({ shifts, employees, onCreate }) {
  const events = shifts.filter((x) => x.status !== false).map((shift) => ({
    ...shift,
    title: shift.role || employees.find((e) => e.employeeID === shift.employeeId)?.position || "Shift",
    start: new Date(shift.startTime),
    end: new Date(shift.endTime),
  }));
  const hours = Math.round(events.reduce((sum, x) => sum + (x.end - x.start) / 3600000, 0));
  return <>
    <PageHeader title="Weekly Schedule" subtitle="Build, review and publish employee coverage." action={<button className="primary-button" onClick={onCreate}>+ Create shift</button>} />
    <section className="metrics-grid">
      <Metric value={events.length} label="Scheduled shifts" />
      <Metric value={`${hours}h`} label="Total hours" tone="green" />
      <Metric value="3" label="Coverage gaps" tone="red" />
      <Metric value="92%" label="Availability fit" tone="amber" />
    </section>
    <section className="surface calendar-surface">
      <Calendar localizer={localizer} events={events} defaultView={Views.WEEK} views={[Views.DAY, Views.WEEK, Views.MONTH]} defaultDate={new Date("2026-09-07T12:00:00")} startAccessor="start" endAccessor="end" selectable onSelectSlot={({ start, end }) => onCreate({ start, end })} eventPropGetter={(event) => ({ style: { backgroundColor: event.assignedColor || colours[0] } })} />
    </section>
  </>;
}

function EmployeesView({ employees, shifts }) {
  const hoursFor = (id) => Math.round(shifts.filter((x) => x.employeeId === id && x.status !== false).reduce((sum, x) => sum + (new Date(x.endTime) - new Date(x.startTime)) / 3600000, 0));
  return <>
    <PageHeader title="Employees" subtitle="Manage team profiles, roles, availability and scheduled hours." action={<button className="primary-button">+ Add employee</button>} />
    <section className="surface table-surface">
      <div className="table-tools"><input aria-label="Search employees" placeholder="Search employees by name or role" /><select aria-label="Filter roles"><option>All roles</option></select></div>
      <div className="employee-table" role="table">
        <div className="table-row table-head"><span>Employee</span><span>Role</span><span>Availability</span><span>This week</span><span>Status</span></div>
        {employees.map((employee, index) => {
          const hours = hoursFor(employee.employeeID);
          return <div className="table-row" key={employee.employeeID}>
            <span className="employee-cell"><i style={{ background: colours[index % colours.length] }}>{employee.firstName?.[0]}</i><span><strong>{employee.firstName} {employee.lastName}</strong><small>{employee.email}</small></span></span>
            <span>{employee.position?.title || employee.position || "Staff"}</span><span>Mon–Fri · Flexible</span><strong>{hours}h</strong><span className={`status-pill ${hours > (employee.maxWeeklyHours || 40) ? "risk" : "good"}`}>{hours > (employee.maxWeeklyHours || 40) ? "Overtime risk" : "Scheduled"}</span>
          </div>;
        })}
      </div>
    </section>
  </>;
}

function AvailabilityView({ employees, availability }) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const status = (employeeId, day) => availability.find((x) => x.employeeId === employeeId && x.dayOfWeek === day);
  return <>
    <PageHeader title="Team Availability" subtitle="Review recurring availability and identify scheduling conflicts." action={<button className="primary-button">Edit availability</button>} />
    <section className="surface availability-grid">
      <div className="availability-row availability-head"><strong>Employee</strong>{days.map((day) => <strong key={day}>{day.slice(0, 3)}</strong>)}</div>
      {employees.map((employee) => <div className="availability-row" key={employee.employeeID}><strong>{employee.firstName} {employee.lastName}</strong>{days.map((day) => { const value = status(employee.employeeID, day); return <span className={value?.isAvailable === false ? "unavailable" : "available"} key={day}>{value?.isAvailable === false ? "Unavailable" : value ? `${value.startTime}–${value.endTime}` : "8a–5p"}</span>; })}</div>)}
    </section>
  </>;
}

function ReportsView({ shifts }) {
  const active = shifts.filter((x) => x.status !== false);
  const hours = Math.round(active.reduce((sum, x) => sum + (new Date(x.endTime) - new Date(x.startTime)) / 3600000, 0));
  return <>
    <PageHeader title="Reports & exports" subtitle="Track staffing coverage, scheduled hours and labour-cost risk." action={<div className="header-actions"><button>Export PDF</button><button className="success-button">Export Excel</button></div>} />
    <section className="metrics-grid"><Metric value="92%" label="Coverage" tone="green" /><Metric value={`${hours}h`} label="Hours" /><Metric value="3" label="Open shifts" tone="red" /><Metric value="JMD 428K" label="Labour cost" tone="purple" /></section>
    <section className="reports-grid"><article className="surface chart-card"><h2>Coverage by day</h2><div className="bars">{[92,94,100,88,93,66,54].map((v,i)=><div key={i}><span style={{height:`${v * 2.4}px`}}></span><small>{["M","T","W","T","F","S","S"][i]}</small></div>)}</div></article><div className="insight-column"><article className="surface insight danger"><h3>Needs attention</h3><p>Saturday afternoon has two uncovered shifts.</p></article><article className="surface insight positive"><h3>Positive trend</h3><p>Wednesday reached 100% coverage.</p></article></div></section>
  </>;
}

function NotificationsView({ preferences, onToggle }) {
  const rules = [["newShiftAssignment","New shift assignment","Notify employee immediately"],["shiftChanged","Shift changed or cancelled","Send updates to affected staff"],["upcomingReminder","Upcoming shift reminder","Send the evening before"],["schedulePublished","Weekly schedule published","Notify the full team"],["smsEnabled","SMS alerts","Optional employee opt-in"]];
  return <><PageHeader title="Notifications" subtitle="Configure assignment alerts, reminders and delivery channels." action={<button className="primary-button">Save changes</button>} /><section className="notification-grid"><article className="surface rules-card"><h2>Notification rules</h2>{rules.map(([key,label,help])=><div className="rule" key={key}><span><strong>{label}</strong><small>{help}</small></span><button aria-label={`Toggle ${label}`} className={`toggle ${preferences[key] ? "on" : ""}`} onClick={()=>onToggle(key)}><i /></button></div>)}</article><article className="email-preview"><small>EMAIL PREVIEW</small><h2>Your shift was updated</h2><p>Hi Alicia, your Customer Support shift is now Monday, 8:00 AM–12:00 PM.</p><button className="primary-button">View schedule</button></article></section></>;
}

function ShiftModal({ show, initial, employees, onClose, onSaved }) {
  const [form, setForm] = useState({ employeeId: "", role: "Customer Support", startTime: "", endTime: "", breakMinutes: 30, requiredSkill: "", notes: "", assignedColor: colours[0] });
  const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  useEffect(() => { if (show) setForm((current) => ({ ...current, startTime: initial?.start ? format(initial.start,"yyyy-MM-dd'T'HH:mm") : "", endTime: initial?.end ? format(initial.end,"yyyy-MM-dd'T'HH:mm") : "" })); }, [show, initial]);
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => { event.preventDefault(); setSaving(true); setError(""); try { await axios.post(`${config.api.baseUrl}${config.api.endpoints.schedule}`, { ...form, breakMinutes: Number(form.breakMinutes), status: true }); onSaved(); onClose(); } catch (e) { setError(e.response?.data?.message || e.response?.data || "Unable to create shift. Check availability and existing assignments."); } finally { setSaving(false); } };
  return <Modal show={show} onHide={onClose} size="lg" centered><Form onSubmit={submit}><Modal.Header closeButton><Modal.Title>Create shift</Modal.Title></Modal.Header><Modal.Body>{error && <Alert variant="danger">{String(error)}</Alert>}<div className="shift-form-grid"><Form.Group><Form.Label>Employee</Form.Label><Form.Select required name="employeeId" value={form.employeeId} onChange={change}><option value="">Select employee</option>{employees.map(e=><option value={e.employeeID} key={e.employeeID}>{e.firstName} {e.lastName}</option>)}</Form.Select></Form.Group><Form.Group><Form.Label>Role</Form.Label><Form.Control required name="role" value={form.role} onChange={change}/></Form.Group><Form.Group><Form.Label>Start</Form.Label><Form.Control required type="datetime-local" name="startTime" value={form.startTime} onChange={change}/></Form.Group><Form.Group><Form.Label>End</Form.Label><Form.Control required type="datetime-local" name="endTime" value={form.endTime} onChange={change}/></Form.Group><Form.Group><Form.Label>Break (minutes)</Form.Label><Form.Control type="number" name="breakMinutes" value={form.breakMinutes} onChange={change}/></Form.Group><Form.Group><Form.Label>Required skill</Form.Label><Form.Control name="requiredSkill" value={form.requiredSkill} onChange={change}/></Form.Group><Form.Group className="wide"><Form.Label>Notes</Form.Label><Form.Control as="textarea" name="notes" value={form.notes} onChange={change}/></Form.Group></div></Modal.Body><Modal.Footer><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? <Spinner size="sm" /> : "Create shift"}</button></Modal.Footer></Form></Modal>;
}

export default function AdminPortal() {
  const [active, setActive] = useState("Schedule"); const [modal, setModal] = useState(false); const [slot, setSlot] = useState(null);
  const [preferences, setPreferences] = useState({ newShiftAssignment:true, shiftChanged:true, upcomingReminder:true, schedulePublished:true, smsEnabled:false });
  const queryClient = useQueryClient();
  const { data: employees = demoEmployees, isLoading } = useQuery({ queryKey:["admin-employees"], queryFn:()=>getData(config.api.endpoints.employees,demoEmployees) });
  const { data: shifts = demoShifts } = useQuery({ queryKey:["admin-schedules"], queryFn:()=>getData(config.api.endpoints.schedule,demoShifts) });
  const { data: availability = [] } = useQuery({ queryKey:["availability"], queryFn:()=>getData(config.api.endpoints.availability,[]) });
  const content = useMemo(() => ({ Schedule:<ScheduleView shifts={shifts} employees={employees} onCreate={(value)=>{setSlot(value?.start ? value : null);setModal(true);}}/>, Employees:<EmployeesView employees={employees} shifts={shifts}/>, Availability:<AvailabilityView employees={employees} availability={availability}/>, Reports:<ReportsView shifts={shifts}/>, Notifications:<NotificationsView preferences={preferences} onToggle={(key)=>setPreferences({...preferences,[key]:!preferences[key]})}/>, Settings:<NotificationsView preferences={preferences} onToggle={(key)=>setPreferences({...preferences,[key]:!preferences[key]})}/> }), [availability, employees, preferences, shifts]);
  if (isLoading) return <div className="shiftly-loading"><Spinner animation="border"/><p>Loading workforce data…</p></div>;
  return <div className="shiftly-app"><Sidebar active={active} onChange={setActive}/><main className="shiftly-main">{content[active]}</main><ShiftModal show={modal} initial={slot} employees={employees} onClose={()=>setModal(false)} onSaved={()=>queryClient.invalidateQueries({queryKey:["admin-schedules"]})}/></div>;
}
