import { useState } from "react";
import "./PasswordInput.css";

export default function PasswordInput({ id, ...props }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="password-input">
      <input id={id} type={isVisible ? "text" : "password"} {...props} />
      <button
        type="button"
        className="password-input-toggle"
        aria-controls={id}
        aria-label={`${isVisible ? "Hide" : "Show"} password`}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((visible) => !visible)}
      >
        {isVisible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
