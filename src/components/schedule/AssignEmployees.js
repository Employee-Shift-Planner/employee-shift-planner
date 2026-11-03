import "./AssignEmployees.css";

/** Candidate list for a shift, each row showing why they can or cannot take it. */
export default function AssignEmployees({ candidates, selectedIds, onSelect, disabled = false }) {
  return (
    <section className="card assign">
      <h2>Assign employees</h2>
      <p style={{ display: "block" }}>Employees can work a different role for this shift without changing their primary position. Availability and required qualifications still apply.</p>
      {!candidates.length ? <p>No eligible employees found. Adjust the shift details or check employee availability.</p> : null}
      <p>{selectedIds.length} selected. Select all employees who should work this shift.</p>
      <div className="assign-list" role="region" aria-label="Employee candidates" tabIndex={0}>
      {candidates.map((candidate) => (
        <label key={candidate.employeeId}>
          <span><input type="checkbox" name="employeeIds" checked={selectedIds.includes(candidate.employeeId)} disabled={disabled || candidate.status !== "Available"} onChange={() => onSelect(candidate.employeeId)} /> {candidate.fullName ?? candidate.name}</span>
          <span>{candidate.status}</span>
        </label>
      ))}
      </div>
    </section>
  );
}
