import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, Bell, BriefcaseBusiness, CalendarDays, Clock3, LogOut, MoreHorizontal, Settings, Users } from "lucide-react";
import { NAV_ITEMS } from "../../data/navigation";
import { currentRole, currentUserLabel, signOut } from "../../api/auth";
import shiftlyIcon from "../../assets/shiftly-icon.png";
import "./Sidebar.css";

const ICONS = { calendar: CalendarDays, users: Users, clock: Clock3, briefcase: BriefcaseBusiness, chart: BarChart3, bell: Bell, settings: Settings, more: MoreHorizontal, logout: LogOut };
const NavIcon = ({ name }) => { const Component = ICONS[name] ?? BriefcaseBusiness; return <Component size={20} strokeWidth={1.8} aria-hidden="true" />; };

/**
 * Fixed navigation rail.
 *
 * `active` is the nav label to highlight. It is passed in rather than derived
 * from the URL because sub-screens keep their parent highlighted — /create-shift
 * highlights "Schedule", /employees/:id highlights "Employees".
 */
export default function Sidebar({ active }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = () => {
    signOut(queryClient);
    navigate("/", { replace: true });
  };

  const items = NAV_ITEMS.filter((item) => item.roles.includes(currentRole()));
  const primaryLabels = currentRole() === "Employee"
    ? ["My schedule", "Availability", "Time off", "Operations"]
    : ["Schedule", "Employees", "Time off", "Operations"];
  const primary = items.filter((item) => primaryLabels.includes(item.label));
  const secondary = items.filter((item) => !primaryLabels.includes(item.label));
  const navLink = ({ label, path, icon }) => {
    const isActive = active === label;
    return <Link key={path} to={path} className={isActive ? "active" : ""} aria-label={label} aria-current={isActive ? "page" : undefined} onClick={() => setMoreOpen(false)}><NavIcon name={icon} /><span>{label}</span></Link>;
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
      <nav className="desktop-nav">
        {items.map(navLink)}
      </nav>
      <div className="sidebar-session">
        <strong>{currentUserLabel()}<small>{currentRole()}</small></strong>
        <button type="button" onClick={logout}>Log out</button>
      </div>
      <nav className="mobile-nav" aria-label="Primary navigation">
        {primary.map(navLink)}
        <button type="button" className={moreOpen || secondary.some(item => item.label === active) ? "active" : ""} onClick={() => setMoreOpen(value => !value)} aria-expanded={moreOpen} aria-controls="mobile-more-menu"><NavIcon name="more" /><span>More</span></button>
      </nav>
      {moreOpen ? <div className="mobile-more-backdrop" onClick={() => setMoreOpen(false)}><section id="mobile-more-menu" className="mobile-more-menu" aria-label="More navigation" onClick={event => event.stopPropagation()}>
        <div className="mobile-more-heading"><div><b>{currentUserLabel()}</b><span>{currentRole()}</span></div><button type="button" aria-label="Close more menu" onClick={() => setMoreOpen(false)}>×</button></div>
        <nav>{secondary.map(navLink)}</nav>
        <button type="button" className="mobile-logout" onClick={logout}><NavIcon name="logout" />Log out</button>
      </section></div> : null}
    </aside>
  );
}
