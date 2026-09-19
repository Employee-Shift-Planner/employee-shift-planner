import "./Button.css";

/**
 * The single button primitive used across every screen.
 *
 * `tone` selects a palette variant from the design: "" (primary blue),
 * "success" (green) or "gray" (secondary). `type` defaults to "button" so a
 * button placed inside a form never submits it by accident.
 */
export default function Button({
  children,
  tone = "",
  type = "button",
  className = "",
  ...rest
}) {
  const classes = ["btn", tone, className].filter(Boolean).join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
