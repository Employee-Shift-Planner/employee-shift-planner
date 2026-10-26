import { microsoftLoginEnabled, microsoftLoginUrl } from "./MicrosoftSession";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { currentUser, useLogin } from "../../api/auth";
import { getSessionExpiration } from "../../api/client";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import PasswordInput from "../ui/PasswordInput";
import StateMessage from "../ui/StateMessage";

export function SessionWarning() {
  const [warning, setWarning] = useState(false);
  const expiry = getSessionExpiration();
  useEffect(() => {
    if (!expiry) return;
    const check = () => setWarning(expiry - Date.now() <= 120_000);
    check();
    const timer = window.setTimeout(check, Math.max(0, expiry - Date.now() - 120_000));
    return () => window.clearTimeout(timer);
  }, [expiry]);
  return warning ? <aside className="session-warning" role="status">Your session expires soon. Save your work now. If it expires, you can sign in again without leaving this page.</aside> : null;
}
export default function SessionRecovery({ account }) {
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const submit = event => {
    event.preventDefault();
    login.mutate({ email: account.email, password }, { onSuccess: () => {
      setPassword("");
      queryClient.invalidateQueries();
      if (currentUser()?.mustChangePassword) navigate("/change-password");
    } });
  };
  return <Modal onClose={() => {}} busy aria-labelledby="session-expired-title">
    <h2 id="session-expired-title">Your session expired</h2>
    <p>Your unsaved work is still on this page. Sign in again as {account.email} to continue.</p>
    {microsoftLoginEnabled ? <p><a className="btn" href={microsoftLoginUrl}>Sign in with Microsoft</a></p> : null}
    <form onSubmit={submit}>
      <label htmlFor="session-password">Password<PasswordInput id="session-password" required autoFocus autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} /></label>
      {login.isError ? <StateMessage tone="error" title="Could not sign in" detail={login.error?.message} /> : null}
      <div className="modal-actions"><Button disabled={login.isPending} tone="gray" onClick={() => navigate("/", { state: { sessionExpired: true, from: `${location.pathname}${location.search}` } })}>Go to sign in</Button><Button type="submit" disabled={login.isPending}>{login.isPending ? "Signing in…" : "Continue editing"}</Button></div>
    </form>
  </Modal>;
}
