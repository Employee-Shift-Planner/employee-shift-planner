import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import StateMessage from "../components/ui/StateMessage";
import { homeForCurrentRole, isSignedIn, useLogin } from "../api/auth";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [form, setForm] = useState({ email: "", password: "" });

  // Already signed in? Go straight to wherever the guard bounced us from.
  if (isSignedIn()) {
    return <Navigate replace to={location.state?.from ?? homeForCurrentRole()} />;
  }

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    login.mutate(form, {
      onSuccess: () => navigate(location.state?.from ?? homeForCurrentRole(), { replace: true }),
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
          Password
          <input
            id="password"
            name="password"
            type="password"
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
      </form>
    </div>
  );
}
