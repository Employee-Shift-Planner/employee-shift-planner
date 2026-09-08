import "./UpcomingShifts.css";

/** The employee's next scheduled shifts, one line each. */
export default function UpcomingShifts({ shifts }) {
  return (
    <section className="card upcoming">
      <h2>Upcoming shifts</h2>
      {shifts.map((shift) => (
        <p key={`${shift.day}-${shift.time}`}>
          {`${shift.day}　 ${shift.role}　 ${shift.time}`}
        </p>
      ))}
    </section>
  );
}
