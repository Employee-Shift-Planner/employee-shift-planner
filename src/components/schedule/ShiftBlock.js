import "./ShiftBlock.css";

/**
 * A single coloured shift card placed on the week grid.
 * `column` / `row` are 1-based CSS grid positions.
 */
export default function ShiftBlock({ label, time, tone, column, row }) {
  return (
    <div
      className={`shift ${tone}`}
      style={{ gridColumn: column, gridRow: row }}
    >
      <b>{label}</b>
      <span>{time}</span>
    </div>
  );
}
