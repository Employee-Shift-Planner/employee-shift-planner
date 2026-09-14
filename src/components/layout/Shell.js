import Sidebar from "./Sidebar";
import { useIsMutating } from "@tanstack/react-query";
import "./Shell.css";

/**
 * Page chrome for every desktop screen: navigation rail, page header
 * (title + supporting copy + action buttons) and the screen body.
 */
export default function Shell({ active, title, copy, actions, children }) {
  const saving = useIsMutating();
  return (
    <div className="shell">
      {saving ? <div className="global-save-progress" role="progressbar" aria-label="Saving changes"><span /></div> : null}
      <Sidebar active={active} />
      <main>
        <header>
          <div>
            <h1>{title}</h1>
            <p>{copy}</p>
          </div>
          {actions ? <div className="actions">{actions}</div> : null}
        </header>
        {children}
      </main>
    </div>
  );
}
