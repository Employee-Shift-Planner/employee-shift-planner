import { Link } from "react-router-dom";
import { NAV_ITEMS } from "../../data/navigation";
import { currentUserLabel } from "../../api/auth";
import "./Sidebar.css";

/**
 * Fixed navigation rail.
 *
 * `active` is the nav label to highlight. It is passed in rather than derived
 * from the URL because sub-screens keep their parent highlighted — /create-shift
 * highlights "Schedule", /employees/:id highlights "Employees".
 */
export default function Sidebar({ active }) {
  return (
    <aside className="sidebar">
      <div>
        <b>SHIFTLY</b>
        <small>WORKFORCE PLANNER</small>
      </div>
      <nav>
        {NAV_ITEMS.map(({ label, path }) => {
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
      <strong>{currentUserLabel()}</strong>
    </aside>
  );
}
