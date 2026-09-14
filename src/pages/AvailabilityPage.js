import { useEffect, useMemo, useState } from "react";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import { QueryState } from "../components/ui/StateMessage";
import SaveFeedback from "../components/ui/SaveFeedback";
import { isManager } from "../api/auth";
import { useCurrentEmployee, useEmployees } from "../api/employees";
import { useEmployeeAvailability, useSaveEmployeeAvailability } from "../api/availability";
import "./AvailabilityPage.css";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const dateDay = date => date ? new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" }) : "Monday";
const today = () => new Date().toISOString().slice(0, 10);
const recurringRule = () => ({ dayOfWeek:"Monday", startTime:"06:00", endTime:"14:00", specificDate:null, isAvailable:true, notes:"" });
const exceptionRule = () => ({ dayOfWeek:dateDay(today()), startTime:null, endTime:null, specificDate:today(), isAvailable:false, notes:"" });
const normalize = rule => ({ ...rule, startTime:rule.startTime?.slice(0, 5) ?? null, endTime:rule.endTime?.slice(0, 5) ?? null, notes:rule.notes ?? "" });

function RuleRow({ rule, onChange, onRemove, exception = false }) {
  const change = (field, value) => onChange({ ...rule, [field]:value });
  return <div className="availability-rule-row">
    {exception ? <label>Date<input required type="date" value={rule.specificDate} onChange={e => onChange({ ...rule, specificDate:e.target.value, dayOfWeek:dateDay(e.target.value) })} /></label>
      : <label>Day<select value={rule.dayOfWeek} onChange={e => change("dayOfWeek", e.target.value)}>{DAYS.map(day => <option key={day}>{day}</option>)}</select></label>}
    <label className="availability-check"><input type="checkbox" checked={rule.isAvailable} onChange={e => change("isAvailable", e.target.checked)} />Available</label>
    <label>From<input required={rule.isAvailable} type="time" disabled={!rule.isAvailable} value={rule.startTime ?? ""} onChange={e => change("startTime", e.target.value || null)} /></label>
    <label>To<input required={rule.isAvailable} type="time" disabled={!rule.isAvailable} value={rule.endTime ?? ""} onChange={e => change("endTime", e.target.value || null)} /></label>
    <label>Notes<input maxLength="250" value={rule.notes} onChange={e => change("notes", e.target.value)} /></label>
    <button type="button" className="remove-rule" onClick={onRemove}>Remove</button>
  </div>;
}

export default function AvailabilityPage() {
  const manager = isManager();
  const current = useCurrentEmployee();
  const employees = useEmployees({ enabled:manager });
  const [selectedId, setSelectedId] = useState("");
  const employeeId = manager ? selectedId : current.data?.employeeId;
  const availability = useEmployeeAvailability(employeeId);
  const save = useSaveEmployeeAvailability(employeeId);
  const [draft, setDraft] = useState(null);

  useEffect(() => { if (!selectedId && manager && employees.data?.length) setSelectedId(employees.data[0].employeeId); }, [manager, employees.data, selectedId]);
  useEffect(() => { if (availability.data) setDraft(availability.data.map(normalize)); }, [availability.data]);
  const recurring = useMemo(() => (draft ?? []).filter(x => !x.specificDate), [draft]);
  const exceptions = useMemo(() => (draft ?? []).filter(x => x.specificDate), [draft]);
  const replace = (rule, next) => { save.reset(); setDraft(rows => rows.map(x => x === rule ? next : x)); };
  const remove = rule => { save.reset(); setDraft(rows => rows.filter(x => x !== rule)); };
  const add = rule => { save.reset(); setDraft(rows => [...(rows ?? []), rule]); };
  const submit = event => {
    event.preventDefault();
    const rules = (draft ?? []).map(({ id, employeeId: ignored, employee, ...rule }) => ({ ...rule,
      startTime:rule.isAvailable ? rule.startTime : null, endTime:rule.isAvailable ? rule.endTime : null }));
    save.mutate(rules);
  };

  return <Shell active="Availability" title={manager ? "Team Availability" : "My Availability"} copy="Set recurring working windows and date-specific exceptions.">
    <QueryState query={manager ? employees : current} empty={{ title:"No employee profile", detail:"An employee profile is required before availability can be recorded." }}>
      {() => <>
        {manager ? <section className="card availability-person"><label>Employee<select value={selectedId} onChange={e => { setSelectedId(e.target.value); setDraft(null); }}>{(employees.data ?? []).map(employee => <option key={employee.employeeId} value={employee.employeeId}>{employee.fullName}</option>)}</select></label></section> : null}
        <QueryState query={availability}>{() => <form className="availability-editor" onSubmit={submit}>
          <section className="card"><div className="availability-heading"><div><h2>Weekly availability</h2><p>Add multiple windows per day. Overnight ranges such as 10 PM–6 AM are supported.</p></div><Button type="button" tone="gray" onClick={() => add(recurringRule())}>Add range</Button></div>
            {recurring.length ? recurring.map((rule, index) => <RuleRow key={rule.id ?? `r-${index}`} rule={rule} onChange={next => replace(rule, next)} onRemove={() => remove(rule)} />) : <p>No weekly restrictions: all times are treated as available.</p>}
          </section>
          <section className="card"><div className="availability-heading"><div><h2>One-off exceptions</h2><p>Date-specific entries replace every weekly range for that date.</p></div><Button type="button" tone="gray" onClick={() => add(exceptionRule())}>Add exception</Button></div>
            {exceptions.length ? exceptions.map((rule, index) => <RuleRow exception key={rule.id ?? `e-${index}`} rule={rule} onChange={next => replace(rule, next)} onRemove={() => remove(rule)} />) : <p>No one-off exceptions recorded.</p>}
          </section>
          <SaveFeedback mutation={save} success="Availability saved." />
          <div className="availability-save"><Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save availability"}</Button></div>
        </form>}</QueryState>
      </>}
    </QueryState>
  </Shell>;
}
