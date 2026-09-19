import "./AssignEmployees.css";

/** Candidate list for a shift, each row showing why they can or cannot take it. */
export default function AssignEmployees({ candidates, selectedId, onSelect }) {
  return (
    <section className="card assign">
      <h2>Assign employees</h2>
      {candidates.map((candidate) => (
        <label key={candidate.employeeId}>
          <span><input type="radio" name="employeeId" checked={selectedId === candidate.employeeId} disabled={candidate.status !== "Available"} onChange={() => onSelect(candidate.employeeId)} /> {candidate.fullName ?? candidate.name}</span>
          <span>{candidate.status}</span>
        </label>
      ))}
    </section>
  );
}
