import { DAY_LABELS, availabilityLabel } from "../../data/availability";
import "./AvailabilityMatrix.css";

/**
 * Employee × day availability grid.
 *
 * When `editable` is true each cell toggles between available and unavailable;
 * otherwise the cells are inert so the grid reads as a report.
 */
export default function AvailabilityMatrix({ rows, editable = false, onToggle }) {
  return (
    <section className={`card matrix${editable ? " editing" : ""}`}>
      <div className="mrow mhead">
        <b>EMPLOYEE</b>
        {DAY_LABELS.map((day) => (
          <b key={day}>{day}</b>
        ))}
      </div>
      {rows.map((row) => (
        <div className="mrow" key={row.employeeId}>
          <b>{row.name}</b>
          {row.days.map((isAvailable, dayIndex) => (
            <button
              type="button"
              key={DAY_LABELS[dayIndex]}
              className={isAvailable ? "yes" : "no"}
              aria-pressed={editable ? isAvailable : undefined}
              onClick={
                editable ? () => onToggle(row.employeeId, dayIndex) : undefined
              }
            >
              {availabilityLabel(isAvailable, dayIndex)}
            </button>
          ))}
        </div>
      ))}
    </section>
  );
}
