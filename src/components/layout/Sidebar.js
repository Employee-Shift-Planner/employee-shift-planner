import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { NAV_ITEMS } from "../../data/navigation";
import { currentRole, currentUserLabel, signOut } from "../../api/auth";
import shiftlyIcon from "../../assets/shiftly-icon.png";
import "./Sidebar.css";

/**
 * Fixed navigation rail.
 *
 * `active` is the nav label to highlight. It is passed in rather than derived
 * from the URL because sub-screens keep their parent highlighted — /create-shift
 * highlights "Schedule", /employees/:id highlights "Employees".
 */
export default function Sidebar({ active }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = () => {
    signOut(queryClient);
    navigate("/", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={shiftlyIcon} alt="" aria-hidden="true" />
        <span>
          <b>SHIFTLY</b>
          <small>WORKFORCE PLANNER</small>
        </span>
      </div>
      <nav>
        {NAV_ITEMS.filter((item) => item.roles.includes(currentRole())).map(({ label, path }) => {
          const isActive = active === label;
          return (
            <Link
              key={path}
              to={path}
              className={isActive ? "active" : ""}
              aria-current={isActive ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-session">
        <strong>{currentUserLabel()}<small>{currentRole()}</small></strong>
        <button type="button" onClick={logout}>Log out</button>
      </div>
    </aside>
  );
}
