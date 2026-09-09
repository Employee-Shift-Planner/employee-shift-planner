import "./ShiftDetailsCard.css";

/** Read-only summary of the shift being created. */
export default function ShiftDetailsCard({ shift, onChange }) {
  return (
    <section className="card details">
      <h2>Shift details</h2>
      <label>Role<input value={shift.role} onChange={(e) => onChange("role", e.target.value)} required /></label>
      <label>Starts<input type="datetime-local" value={shift.startTime} onChange={(e) => onChange("startTime", e.target.value)} required /></label>
      <label>Ends<input type="datetime-local" value={shift.endTime} onChange={(e) => onChange("endTime", e.target.value)} required /></label>
      <label>Required skill<input value={shift.requiredSkill} onChange={(e) => onChange("requiredSkill", e.target.value)} /></label>
      <label>Break (minutes)<input type="number" min="0" max="240" value={shift.breakMinutes} onChange={(e) => onChange("breakMinutes", e.target.value)} /></label>
      <label>Notes<textarea value={shift.notes} onChange={(e) => onChange("notes", e.target.value)} /></label>
    </section>
  );
}
