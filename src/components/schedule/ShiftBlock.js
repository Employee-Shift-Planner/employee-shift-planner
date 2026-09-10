import "./ShiftBlock.css";

/**
 * A single coloured shift card placed on the week grid.
 * `column` / `row` are 1-based CSS grid positions.
 */
export default function ShiftBlock({ label, time, tone, column, row, onClick, isDraft }) {
  return (
    <button
      type="button"
      className={`shift ${tone}${isDraft ? " draft" : ""}`}
      style={{ gridColumn: column, gridRow: row }}
      onClick={onClick}
      aria-label={`${label}, ${time}. View shift details`}
    >
      <b>{label}</b>
      <span>{time}</span>
      {isDraft ? <em>Draft</em> : null}
    </button>
  );
}
