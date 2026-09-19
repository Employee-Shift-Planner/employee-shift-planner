import "./ConflictBanner.css";

/** Warning surfaced when an assignment clashes with an existing shift. */
export default function ConflictBanner({ title, detail }) {
  return (
    <section className="conflict" role="alert">
      <b>{title}</b>
      <p>{detail}</p>
    </section>
  );
}
