import "./ShiftDetailsCard.css";

/** Read-only summary of the shift being created. */
const BREAK_OPTIONS = [0, 15, 30, 45, 60, 90, 120];

export default function ShiftDetailsCard({ shift, positions = [], onChange }) {
  const roles = positions.filter(position => position.isActive).map(position => position.title);
  if (shift.role && !roles.includes(shift.role)) roles.unshift(shift.role);
  const breaks = BREAK_OPTIONS.includes(Number(shift.breakMinutes)) ? BREAK_OPTIONS : [Number(shift.breakMinutes), ...BREAK_OPTIONS].sort((a, b) => a - b);
  return (
    <section className="card details">
      <h2>Shift details</h2>
      <label>Role<select value={shift.role} onChange={(e) => onChange("role", e.target.value)} required><option value="">Select position</option>{roles.map(role => <option key={role}>{role}</option>)}</select></label>
      <label>Starts<input type="datetime-local" value={shift.startTime} onChange={(e) => onChange("startTime", e.target.value)} required /></label>
      <label>Ends<input type="datetime-local" value={shift.endTime} onChange={(e) => onChange("endTime", e.target.value)} required /></label>
      <label>Required skill<input value={shift.requiredSkill} onChange={(e) => onChange("requiredSkill", e.target.value)} /></label>
      <label>Break<select value={shift.breakMinutes} onChange={(e) => onChange("breakMinutes", e.target.value)}>{breaks.map(minutes => <option key={minutes} value={minutes}>{minutes ? `${minutes} minutes` : "No break"}</option>)}</select></label>
      <label>Notes<textarea value={shift.notes} onChange={(e) => onChange("notes", e.target.value)} /></label>
    </section>
  );
}
