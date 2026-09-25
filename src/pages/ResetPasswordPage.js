import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useResetPassword } from "../api/auth";
import Button from "../components/ui/Button";
import PasswordInput from "../components/ui/PasswordInput";
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
          <>
            <StateMessage
              tone="error"
              title="Invalid reset link"
              detail="This link is incomplete. Request a new password reset email and use the link in that message."
            />
            <Link className="login-primary-link" to="/forgot-password">Request a new reset link</Link>
          </>
        ) : resetPassword.isSuccess ? (
          <>
            <StateMessage title="Password updated" detail="Your password was changed successfully. You can now sign in with your new password." />
            <Link className="login-primary-link" to="/">Continue to sign in</Link>
          </>
        ) : (
          <>
            <label htmlFor="password">
              New password
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                minLength="8"
                required
                value={form.password}
                onChange={update("password")}
              />
            </label>
            <label htmlFor="confirmation">
              Confirm new password
              <PasswordInput
                id="confirmation"
                name="confirmation"
                autoComplete="new-password"
                minLength="8"
                required
                value={form.confirmation}
                onChange={update("confirmation")}
              />
            </label>
            {validationError || resetPassword.isError ? (
              <>
                <StateMessage
                  tone="error"
                  title="Could not reset password"
                  detail={validationError || resetPassword.error?.message}
                />
                {resetPassword.isError ? (
                  <Link className="login-inline-link" to="/forgot-password">Request a new reset link</Link>
                ) : null}
              </>
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
