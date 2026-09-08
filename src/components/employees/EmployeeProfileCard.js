import { Fragment } from "react";
import "./EmployeeProfileCard.css";

/** Contact details and qualifications for one employee. */
export default function EmployeeProfileCard({ employee }) {
  return (
    <section className="card profile">
      <h2>Employee profile</h2>
      <p>
        {employee.email}
        <br />
        {employee.phone}
      </p>
      <p>
        {employee.qualifications.map((qualification, index) => (
          <Fragment key={qualification}>
            {index > 0 && <br />}
            {qualification}
          </Fragment>
        ))}
      </p>
    </section>
  );
}
