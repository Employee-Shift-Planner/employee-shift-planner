import { Navigate, useLocation } from "react-router-dom";
import { currentRole, homeForCurrentRole, useSession } from "../../api/auth";

/**
 * Authentication and role-aware UX gate for planner screens. The API mirrors
 * these rules as the actual security boundary.
 */
export default function RequireAuth({ children, roles }) {
  const location = useLocation();
  const signedIn = useSession();

  if (!signedIn) {
    return <Navigate replace to="/" state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (roles && !roles.includes(currentRole())) {
    return <Navigate replace to={homeForCurrentRole()} />;
  }

  return children;
}
