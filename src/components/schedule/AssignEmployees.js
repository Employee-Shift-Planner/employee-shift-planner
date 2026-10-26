import "./AssignEmployees.css";

/** Candidate list for a shift, each row showing why they can or cannot take it. */
export default function AssignEmployees({ candidates, selectedId, onSelect }) {
  return (
    <section className="card assign">
      <h2>Assign employees</h2>
      <p style={{ display: "block" }}>Employees can work a different role for this shift without changing their primary position. Availability and required qualifications still apply.</p>
      {!candidates.length ? <p>No eligible employees found. Adjust the shift details or check employee availability.</p> : null}
      <div className="assign-list" role="region" aria-label="Employee candidates" tabIndex={0}>
      {candidates.map((candidate) => (
        <label key={candidate.employeeId}>
          <span><input type="radio" name="employeeId" checked={selectedId === candidate.employeeId} disabled={candidate.status !== "Available"} onChange={() => onSelect(candidate.employeeId)} /> {candidate.fullName ?? candidate.name}</span>
          <span>{candidate.status}</span>
        </label>
      ))}
      </div>
    </section>
  );
}
