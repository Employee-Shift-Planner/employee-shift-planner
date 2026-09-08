import "./MobileShiftRow.css";

/** One "this week" row on the mobile screen. */
export default function MobileShiftRow({ day, time }) {
  return (
    <div className="mshift">
      <b>{day}</b>
      <strong>{time}</strong>
    </div>
  );
}
