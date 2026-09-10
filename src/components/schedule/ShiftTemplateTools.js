import { useState } from "react";
import {
  useCreateShiftTemplate,
  useDeleteShiftTemplate,
  useShiftTemplates,
} from "../../api/schedule";
import Button from "../ui/Button";
import StateMessage from "../ui/StateMessage";
import "./ShiftTemplateTools.css";

const DAY_MS = 86_400_000;
const part = (number) => String(number).padStart(2, "0");
const localValue = (date) => `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}`;

const dateAt = (weekStart, dayOffset, time) => {
  const [hours, minutes] = String(time).split(":").map(Number);
  const date = new Date(weekStart);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export default function ShiftTemplateTools({ shift, weekStart, onApply }) {
  const templates = useShiftTemplates();
  const createTemplate = useCreateShiftTemplate();
  const deleteTemplate = useDeleteShiftTemplate();
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const selected = templates.data?.find((template) => String(template.id) === selectedId);

  const apply = () => {
    if (!selected) return;
    const start = dateAt(weekStart, selected.dayOffset, selected.startTime);
    const end = dateAt(weekStart, selected.dayOffset, selected.endTime);
    if (end <= start) end.setDate(end.getDate() + 1);
    onApply({
      role: selected.role,
      startTime: localValue(start),
      endTime: localValue(end),
      requiredSkill: selected.requiredSkill ?? "",
      notes: selected.notes ?? "",
      breakMinutes: selected.breakMinutes,
    });
    setMessage(`${selected.name} applied.`);
  };

  const save = (event) => {
    event.preventDefault();
    const start = new Date(shift.startTime);
    const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const weekDay = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
    const dayOffset = Math.min(6, Math.max(0, Math.round((dayStart - weekDay) / DAY_MS)));
    const time = (value) => `${String(value).slice(11, 16)}:00`;

    createTemplate.mutate({
      name,
      role: shift.role,
      dayOffset,
      startTime: time(shift.startTime),
      endTime: time(shift.endTime),
      requiredSkill: shift.requiredSkill || null,
      notes: shift.notes || null,
      breakMinutes: Number(shift.breakMinutes),
    }, {
      onSuccess: (created) => {
        setName("");
        setSelectedId(String(created.id));
        setMessage(`${created.name} saved.`);
      },
    });
  };

  const remove = () => {
    if (!selected || !window.confirm(`Delete the “${selected.name}” template?`)) return;
    deleteTemplate.mutate(selected.id, {
      onSuccess: () => {
        setSelectedId("");
        setMessage("Template deleted.");
      },
    });
  };

  const error = templates.error ?? createTemplate.error ?? deleteTemplate.error;

  return (
    <section className="card shift-template-tools" aria-labelledby="shift-templates-heading">
      <div>
        <h2 id="shift-templates-heading">Shift templates</h2>
        <p>Apply a saved shift pattern or save the current details for reuse.</p>
      </div>
      <div className="shift-template-controls">
        <select value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setMessage(""); }} aria-label="Saved shift template">
          <option value="">Select a template</option>
          {(templates.data ?? []).map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
        </select>
        <Button tone="gray" onClick={apply} disabled={!selected || deleteTemplate.isPending}>Apply</Button>
        <Button tone="gray" onClick={remove} disabled={!selected || deleteTemplate.isPending}>Delete</Button>
      </div>
      <form onSubmit={save} className="shift-template-save">
        <input required maxLength="100" value={name} onChange={(event) => { setName(event.target.value); setMessage(""); }} placeholder="Template name" aria-label="New template name" />
        <Button type="submit" disabled={!name.trim() || !shift.role.trim() || createTemplate.isPending}>
          {createTemplate.isPending ? "Saving…" : "Save current as template"}
        </Button>
      </form>
      {error ? <StateMessage tone="error" title="Could not manage templates" detail={error.message} /> : null}
      {message ? <p className="shift-template-message" role="status">{message}</p> : null}
    </section>
  );
}
