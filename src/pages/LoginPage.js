import { microsoftLoginEnabled, microsoftLoginUrl } from "../components/auth/MicrosoftSession";
import PolicyLinks from "../components/legal/PolicyLinks";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import PasswordInput from "../components/ui/PasswordInput";
import StateMessage from "../components/ui/StateMessage";
import { currentUser, homeForCurrentRole, isSignedIn, useLogin } from "../api/auth";
import "./LoginPage.css";

const safeDestination = (path) => typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && path.split(/[?#]/)[0].replace(/\/+$/, "").toLowerCase() !== "/change-password" && !path.includes("\\") && !Array.from(path).some(character => character.charCodeAt(0) <= 32) ? path : homeForCurrentRole();

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [form, setForm] = useState({ email: location.state?.email ?? "", password: "" });

  // Already signed in? Go straight to wherever the guard bounced us from.
  if (isSignedIn()) {
    return <Navigate replace to={currentUser()?.mustChangePassword ? "/change-password" : safeDestination(location.state?.from)} />;
  }

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    login.mutate(form, {
      onSuccess: () => navigate(currentUser()?.mustChangePassword ? "/change-password" : safeDestination(location.state?.from), { replace: true }),
    });
  };

  return (
    <div className="login">
      <section>
        <b>SHIFTLY</b>
        <div>
          <h1>
            Build better schedules.
            <br />
            Run smoother teams.
          </h1>
          <p>
            Plan shifts visually, prevent conflicts, and keep every employee
            informed.
          </p>
        </div>
      </section>
      <form onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p>Sign in to manage schedules and your team.</p>
        {location.state?.sessionExpired ? <StateMessage title="Your session expired" detail="Sign in again to continue." /> : null}
        {location.state?.passwordChanged ? <StateMessage title="Password updated" detail="Sign in with your new password to continue." /> : null}
        {microsoftLoginEnabled ? <>
          <a className="btn" href={microsoftLoginUrl}>Sign in with Microsoft</a>
          {new URLSearchParams(location.search).has("microsoftError") ? <StateMessage tone="error" title="Microsoft sign-in failed" detail="Try again or contact your administrator to check your account access." /> : null}
        </> : null}
        <label htmlFor="email">
          Email address
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
            value={form.email}
            onChange={update("email")}
          />
        </label>
        <label htmlFor="password">
          <span className="login-label-row">
            Password
            <Link to="/forgot-password">Forgot password?</Link>
          </span>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={update("password")}
          />
        </label>
        {login.isError ? (
          <StateMessage
            tone="error"
            title="Sign in failed"
            detail={login.error?.message}
          />
        ) : null}
        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>
        <p className="login-security-note">Too many sign-in attempts temporarily limit access. If you cannot sign in, contact your administrator.</p>
        <PolicyLinks />
      </form>
    </div>
  );
}
