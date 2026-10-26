import useUnsavedChanges from "../lib/useUnsavedChanges";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import StateMessage from "../components/ui/StateMessage";
import { useEmployee, usePositions, useSaveEmployee } from "../api/employees";
import { useOrganizationSettings } from "../api/organization";
import { organizationCurrency } from "../lib/format";
import "./EmployeeFormPage.css";

const EMPTY = {
  employeeId: "", firstName: "", middleName: "", lastName: "", email: "",
  phone: "", positionId: "", active: true, preferredShift: "", maxWeeklyHours: 40,
  skills: "", certifications: "", hourlyRate: 0, overtimeThresholdHours: 40,
};

export default function EmployeeFormPage() {
  const { employeeId } = useParams();
  const editing = Boolean(employeeId);
  const navigate = useNavigate();
  const employee = useEmployee(employeeId);
  const positions = usePositions();
  const organization = useOrganizationSettings();
  const save = useSaveEmployee(employeeId);
  const [form, setForm] = useState(EMPTY);
  const [baseline, setBaseline] = useState(EMPTY);
  const [step, setStep] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);
  const markSaved = useUnsavedChanges(dirty);
  const currency = organization.data?.currency || organizationCurrency();

  useEffect(() => {
    if (employee.data && !dirty) {
      const initial = { ...EMPTY, ...employee.data, middleName: employee.data.middleName ?? "",
        email: employee.data.email ?? "", phone: employee.data.phone ?? "",
        positionId: employee.data.positionId ?? "", preferredShift: employee.data.preferredShift ?? "",
        skills: employee.data.skills ?? "", certifications: employee.data.certifications ?? "" };
      setForm(initial);
      setBaseline(initial);
    }
  }, [employee.data, dirty]);

  const update = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors(current => ({ ...current, [field]: "" }));
  };
  const submit = (event) => {
    event.preventDefault();
    if (step < 2) { setStep(value => value + 1); return; }
    save.mutate(form, { onSuccess: () => {
      markSaved();
      navigate(editing ? `/employees/${encodeURIComponent(employeeId)}` : "/employees");
    } });
  };

  if (editing && employee.isPending) return <Shell active="Employees" title="Edit employee"><StateMessage title="Loading employee…" /></Shell>;
  if (editing && employee.isError) return <Shell active="Employees" title="Edit employee"><StateMessage tone="error" title="Could not load employee" detail={employee.error?.message} /></Shell>;

  return (
    <Shell active="Employees" title={editing ? "Edit employee" : "Add employee"} copy="Capture the employee details used for scheduling, availability, and notifications.">
      <form className="employee-form card" onSubmit={submit} onInvalid={event => {
        const name = event.target.getAttribute("name");
        if (name) setFieldErrors(current => ({ ...current, [name]: event.target.validationMessage }));
      }}>
        <ol className="form-stepper" aria-label="Employee form progress">{["Basics", "Employment", "Review"].map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined}>{index + 1}. {label}</li>)}</ol>
        {step === 0 ? <fieldset><legend>Personal and contact details</legend>
        <div className="employee-form-grid">
          <label>Employee ID<input required maxLength="50" disabled={editing} name="employeeId" aria-invalid={Boolean(fieldErrors.employeeId)} aria-describedby={fieldErrors.employeeId ? "error-employeeId" : undefined} value={form.employeeId} onChange={update("employeeId")} onBlur={event => setFieldErrors(current => ({ ...current, employeeId: event.target.validationMessage }))} />{fieldErrors.employeeId ? <span id="error-employeeId" className="field-error">{fieldErrors.employeeId}</span> : null}</label>
          <label>First name<input required maxLength="50" name="firstName" aria-invalid={Boolean(fieldErrors.firstName)} aria-describedby={fieldErrors.firstName ? "error-firstName" : undefined} value={form.firstName} onChange={update("firstName")} onBlur={event => setFieldErrors(current => ({ ...current, firstName: event.target.validationMessage }))} />{fieldErrors.firstName ? <span id="error-firstName" className="field-error">{fieldErrors.firstName}</span> : null}</label>
          <label>Middle name<input maxLength="50" name="middleName" aria-invalid={Boolean(fieldErrors.middleName)} aria-describedby={fieldErrors.middleName ? "error-middleName" : undefined} value={form.middleName} onChange={update("middleName")} onBlur={event => setFieldErrors(current => ({ ...current, middleName: event.target.validationMessage }))} />{fieldErrors.middleName ? <span id="error-middleName" className="field-error">{fieldErrors.middleName}</span> : null}</label>
          <label>Last name<input required maxLength="50" name="lastName" aria-invalid={Boolean(fieldErrors.lastName)} aria-describedby={fieldErrors.lastName ? "error-lastName" : undefined} value={form.lastName} onChange={update("lastName")} onBlur={event => setFieldErrors(current => ({ ...current, lastName: event.target.validationMessage }))} />{fieldErrors.lastName ? <span id="error-lastName" className="field-error">{fieldErrors.lastName}</span> : null}</label>
          <label>Email<input type="email" maxLength="100" name="email" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "error-email" : undefined} value={form.email} onChange={update("email")} onBlur={event => setFieldErrors(current => ({ ...current, email: event.target.validationMessage }))} />{fieldErrors.email ? <span id="error-email" className="field-error">{fieldErrors.email}</span> : null}</label>
          <label>Phone<input type="tel" maxLength="30" name="phone" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "error-phone" : undefined} value={form.phone} onChange={update("phone")} onBlur={event => setFieldErrors(current => ({ ...current, phone: event.target.validationMessage }))} />{fieldErrors.phone ? <span id="error-phone" className="field-error">{fieldErrors.phone}</span> : null}</label>
        </div></fieldset> : null}
        {step === 1 ? <fieldset><legend>Employment and scheduling</legend><div className="employee-form-grid">
          <label>Primary position<select value={form.positionId} onChange={update("positionId")}><option value="">Unassigned</option>{(positions.data ?? []).filter((p) => p.isActive).map((p) => <option key={p.positionId} value={p.positionId}>{p.title}</option>)}</select></label>
          <label>Preferred shift<select value={form.preferredShift} onChange={update("preferredShift")}><option value="">Flexible</option><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option></select></label>
          <label>Skills<input maxLength="500" placeholder="First aid, Forklift" value={form.skills} onChange={update("skills")} /><small>Separate multiple skills with commas.</small></label>
          <label>Certifications<input maxLength="500" placeholder="Food handler, CPR" value={form.certifications} onChange={update("certifications")} /><small>Separate multiple certifications with commas.</small></label>
          <label>Maximum weekly hours<input required type="number" min="1" max="168" name="maxWeeklyHours" aria-invalid={Boolean(fieldErrors.maxWeeklyHours)} aria-describedby={fieldErrors.maxWeeklyHours ? "error-maxWeeklyHours" : undefined} value={form.maxWeeklyHours} onChange={update("maxWeeklyHours")} onBlur={event => setFieldErrors(current => ({ ...current, maxWeeklyHours: event.target.validationMessage }))} />{fieldErrors.maxWeeklyHours ? <span id="error-maxWeeklyHours" className="field-error">{fieldErrors.maxWeeklyHours}</span> : null}</label>
          <label>Hourly rate ({currency})<input required type="number" min="0" max="1000000" step="0.01" name="hourlyRate" aria-invalid={Boolean(fieldErrors.hourlyRate)} aria-describedby={fieldErrors.hourlyRate ? "error-hourlyRate" : undefined} value={form.hourlyRate} onChange={update("hourlyRate")} onBlur={event => setFieldErrors(current => ({ ...current, hourlyRate: event.target.validationMessage }))} />{fieldErrors.hourlyRate ? <span id="error-hourlyRate" className="field-error">{fieldErrors.hourlyRate}</span> : null}<small>Use 0 to apply the company default rate in {currency}.</small></label>
          <label>Overtime starts after<input required type="number" min="1" max="168" name="overtimeThresholdHours" aria-invalid={Boolean(fieldErrors.overtimeThresholdHours)} aria-describedby={fieldErrors.overtimeThresholdHours ? "error-overtimeThresholdHours" : undefined} value={form.overtimeThresholdHours} onChange={update("overtimeThresholdHours")} onBlur={event => setFieldErrors(current => ({ ...current, overtimeThresholdHours: event.target.validationMessage }))} />{fieldErrors.overtimeThresholdHours ? <span id="error-overtimeThresholdHours" className="field-error">{fieldErrors.overtimeThresholdHours}</span> : null}</label>
          <label className="employee-active"><input type="checkbox" checked={form.active} onChange={update("active")} /> Active employee</label>
        </div>
        </fieldset> : null}
        {step === 2 ? <section aria-label="Review employee"><h2>Review employee</h2><dl>{Object.entries(form).map(([key, value]) => <div key={key}><dt>{key.replace(/([A-Z])/g, " $1")}</dt><dd>{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "—")}</dd></div>)}</dl><p>Check the details before saving. Use Back to make changes.</p></section> : null}
        {Object.values(fieldErrors).some(Boolean) ? <p role="alert">Check the highlighted fields before continuing.</p> : null}
        {positions.isError ? <StateMessage tone="error" title="Could not load positions" detail={positions.error?.message} /> : null}
        {save.isError ? <StateMessage tone="error" title="Could not save employee" detail={save.error?.message} /> : null}
        <div className="employee-form-actions"><Button tone="gray" onClick={() => navigate(-1)}>Cancel</Button>{step > 0 ? <Button tone="gray" disabled={save.isPending} onClick={() => setStep(value => value - 1)}>Back</Button> : null}<Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : step < 2 ? "Continue" : "Save employee"}</Button></div>
      </form>
    </Shell>
  );
}
