import { Navigate, useLocation } from "react-router-dom";
import { currentRole, homeForCurrentRole, isSignedIn } from "../../api/auth";

/**
 * Authentication and role-aware UX gate for planner screens. The API mirrors
 * these rules as the actual security boundary.
 */
export default function RequireAuth({ children, roles }) {
  const location = useLocation();

  if (!isSignedIn()) {
    return <Navigate replace to="/" state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(currentRole())) {
    return <Navigate replace to={homeForCurrentRole()} />;
  }

  return children;
}
