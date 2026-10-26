import { useEffect, useState } from "react";
import { API_BASE_URL, restoreCookieSession } from "../../api/client";

export const microsoftLoginEnabled = process.env.REACT_APP_MICROSOFT_LOGIN_ENABLED === "true";
export const microsoftLoginUrl = `${API_BASE_URL}/auth/microsoft`;

// Block route guards until the server has checked the HttpOnly cookie.
export default function MicrosoftSession({ children }) {
  const [state, setState] = useState(microsoftLoginEnabled ? "loading" : "ready");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!microsoftLoginEnabled) return;
    let active = true;
    restoreCookieSession().then(() => { if (active) setState("ready"); })
      .catch(error => { if (active) setState(error.status === 401 ? "ready" : "error"); });
    return () => { active = false; };
  }, [attempt]);
  if (state === "loading") return <p role="status">Checking your session…</p>;
  if (state === "error") return <div role="alert"><p>Could not check your session. Please try again.</p><button onClick={() => { setState("loading"); setAttempt(value => value + 1); }}>Try again</button></div>;
  return children;
}
