import "./NotificationRules.css";

/** Toggle list controlling which events trigger a notification. */
export default function NotificationRules({ rules, onToggle }) {
  return (
    <section className="card rules">
      <h2>Notification rules</h2>
      {rules.map((rule) => (
        <label key={rule.id} htmlFor={`rule-${rule.id}`}>
          <span>{rule.label}</span>
          <input
            id={`rule-${rule.id}`}
            name={rule.id}
            type="checkbox"
            checked={rule.enabled}
            onChange={() => onToggle(rule.id)}
          />
        </label>
      ))}
    </section>
  );
}
