import { useState } from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../api/auth";
import Button from "../components/ui/Button";
import StateMessage from "../components/ui/StateMessage";
import "./LoginPage.css";

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    forgotPassword.mutate({ email });
  };

  return (
    <div className="login">
      <section>
        <b>SHIFTLY</b>
        <div>
          <h1>Get back to your schedule.</h1>
          <p>Request a secure, time-limited link to choose a new password.</p>
        </div>
      </section>
      <form onSubmit={handleSubmit}>
        <h2>Forgot password?</h2>
        <p>Enter the email address associated with your account.</p>
        {forgotPassword.isSuccess ? (
          <StateMessage
            title="Check your email"
            detail="If an account exists for that address, we sent a password reset link."
          />
        ) : (
          <>
            <label htmlFor="email">
              Email address
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            {forgotPassword.isError ? (
              <StateMessage
                tone="error"
                title="Could not send reset link"
                detail={forgotPassword.error?.message}
              />
            ) : null}
            <Button type="submit" disabled={forgotPassword.isPending}>
              {forgotPassword.isPending ? "Sending…" : "Send reset link"}
            </Button>
          </>
        )}
        <Link className="login-link" to="/">Back to sign in</Link>
      </form>
    </div>
  );
}
