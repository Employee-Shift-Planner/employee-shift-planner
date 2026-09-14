import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useResetPassword } from "../api/auth";
import Button from "../components/ui/Button";
import StateMessage from "../components/ui/StateMessage";
import "./LoginPage.css";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const resetPassword = useResetPassword();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const hasResetLink = Boolean(email && token);
  const [form, setForm] = useState({ password: "", confirmation: "" });
  const [validationError, setValidationError] = useState("");

  const update = (field) => (event) => {
    setValidationError("");
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (form.password !== form.confirmation) {
      setValidationError("Passwords do not match.");
      return;
    }
    resetPassword.mutate({ email, token, password: form.password });
  };

  return (
    <div className="login">
      <section>
        <b>SHIFTLY</b>
        <div>
          <h1>Choose a new password.</h1>
          <p>Use a strong password that you do not reuse on another account.</p>
        </div>
      </section>
      <form onSubmit={handleSubmit}>
        <h2>Reset password</h2>
        <p>Enter and confirm your new password.</p>
        {!hasResetLink ? (
          <StateMessage
            tone="error"
            title="Invalid reset link"
            detail="Request a new password reset link and try again."
          />
        ) : resetPassword.isSuccess ? (
          <StateMessage title="Password updated" detail="You can now sign in with your new password." />
        ) : (
          <>
            <label htmlFor="password">
              New password
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength="8"
                required
                value={form.password}
                onChange={update("password")}
              />
            </label>
            <label htmlFor="confirmation">
              Confirm new password
              <input
                id="confirmation"
                name="confirmation"
                type="password"
                autoComplete="new-password"
                minLength="8"
                required
                value={form.confirmation}
                onChange={update("confirmation")}
              />
            </label>
            {validationError || resetPassword.isError ? (
              <StateMessage
                tone="error"
                title="Could not reset password"
                detail={validationError || resetPassword.error?.message}
              />
            ) : null}
            <Button type="submit" disabled={resetPassword.isPending}>
              {resetPassword.isPending ? "Updating…" : "Update password"}
            </Button>
          </>
        )}
        <Link className="login-link" to="/">Back to sign in</Link>
      </form>
    </div>
  );
}
