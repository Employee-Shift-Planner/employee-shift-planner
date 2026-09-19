import "./CoverageCard.css";

const format = (entries) =>
  entries.map(({ day, value }) => `${day} ${value}`).join("　 ");

/** Coverage percentage per day, split over two lines as in the design. */
export default function CoverageCard({ coverage }) {
  return (
    <section className="card coverage">
      <h2>Coverage by day</h2>
      <p>
        {format(coverage.slice(0, 3))}
        <br />
        {format(coverage.slice(3))}
      </p>
    </section>
  );
}
