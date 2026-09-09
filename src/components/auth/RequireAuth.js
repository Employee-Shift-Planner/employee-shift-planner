import { Navigate, useLocation } from "react-router-dom";
import { isSignedIn } from "../../api/auth";

/**
 * Gate for the planner screens. This is a UX guard, not a security boundary —
 * the API is what must enforce access (see the [Authorize] note in the README).
 */
export default function RequireAuth({ children }) {
  const location = useLocation();

  if (!isSignedIn()) {
    return <Navigate replace to="/" state={{ from: location.pathname }} />;
  }

  return children;
}
