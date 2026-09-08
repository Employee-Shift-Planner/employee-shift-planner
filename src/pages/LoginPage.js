import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { DEMO_CREDENTIALS } from "../data/session";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/schedule");
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
            required
            defaultValue={DEMO_CREDENTIALS.email}
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
            defaultValue={DEMO_CREDENTIALS.password}
          />
        </label>
        <Button type="submit">Sign in</Button>
      </form>
    </div>
  );
}
