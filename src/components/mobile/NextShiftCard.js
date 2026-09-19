import "./NextShiftCard.css";

/** Hero card on the mobile screen showing the employee's next shift. */
export default function NextShiftCard({ shift }) {
  return (
    <div className="next">
      <h2>{shift.role}</h2>
      <b>{shift.time}</b>
      <p>{shift.detail}</p>
    </div>
  );
}
