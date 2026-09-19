import ShiftBlock from "./ShiftBlock";
import "./WeekCalendar.css";

/** Seven-column week grid with the scheduled shifts laid over it. */
export default function WeekCalendar({ days, shifts, onShiftSelect }) {
  return (
    <section className="calendar">
      <div className="days">
        {days.map((day) => (
          <b key={day}>{day}</b>
        ))}
      </div>
      <div className="shiftgrid">
        {shifts.map((shift) => (
          <ShiftBlock key={shift.id} {...shift} onClick={() => onShiftSelect?.(shift.source)} />
        ))}
      </div>
    </section>
  );
}
