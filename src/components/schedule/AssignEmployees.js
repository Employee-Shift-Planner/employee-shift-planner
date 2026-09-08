import "./AssignEmployees.css";

/** Candidate list for a shift, each row showing why they can or cannot take it. */
export default function AssignEmployees({ candidates }) {
  return (
    <section className="card assign">
      <h2>Assign employees</h2>
      {candidates.map((candidate) => (
        <p key={candidate.employeeId}>
          <span>{candidate.name}</span>
          <span>{candidate.status}</span>
        </p>
      ))}
    </section>
  );
}
