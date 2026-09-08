import "./ShiftDetailsCard.css";

/** Read-only summary of the shift being created. */
export default function ShiftDetailsCard({ shift }) {
  return (
    <section className="card details">
      <h2>Shift details</h2>
      <p>{shift.title}</p>
      <p>
        {shift.date}
        <br />
        {shift.time}
      </p>
      <p>
        Required skill
        <br />
        {shift.requiredSkill}
      </p>
      <p>
        Notes
        <br />
        {shift.notes}
      </p>
    </section>
  );
}
