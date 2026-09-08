import "./Metrics.css";

/** A single KPI tile: large toned figure over a muted caption. */
export function MetricCard({ value, label, tone = "" }) {
  return (
    <div className="metric">
      <b className={tone}>{value}</b>
      <span>{label}</span>
    </div>
  );
}

/**
 * The KPI strip that sits under the page header on Schedule, Reports and the
 * employee detail screen. `items` is a list of { value, label, tone }.
 */
export default function Metrics({ items }) {
  return (
    <div className="metrics">
      {items.map((item) => (
        <MetricCard key={item.label} {...item} />
      ))}
    </div>
  );
}
