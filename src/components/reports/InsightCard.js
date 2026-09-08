import "./InsightCard.css";

/** Short callout beside the coverage chart ("Needs attention", "Positive trend"). */
export default function InsightCard({ title, detail }) {
  return (
    <section className="card note">
      <h2>{title}</h2>
      <p>{detail}</p>
    </section>
  );
}
