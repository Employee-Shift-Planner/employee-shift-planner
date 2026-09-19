import "./StateMessage.css";

/**
 * Loading, empty and error states rendered in the app's card language, so a
 * screen waiting on the API still looks like the screen.
 *
 * `tone` is "" (neutral) or "error".
 */
export default function StateMessage({ title, detail, tone = "", action }) {
  return (
    <section className={`card state ${tone}`.trim()} role={tone === "error" ? "alert" : "status"}>
      <b>{title}</b>
      {detail ? <p>{detail}</p> : null}
      {action}
    </section>
  );
}

/** Convenience wrapper for the common query states. */
export function QueryState({ query: result, empty, children }) {
  if (result.isPending) {
    return <StateMessage title="Loading…" detail="Fetching the latest data from the scheduler." />;
  }

  if (result.isError) {
    return (
      <StateMessage
        tone="error"
        title="Could not load this screen"
        detail={result.error?.message}
      />
    );
  }

  const isEmpty = Array.isArray(result.data) ? result.data.length === 0 : !result.data;
  if (isEmpty && empty) {
    return <StateMessage title={empty.title} detail={empty.detail} />;
  }

  return children(result.data);
}
