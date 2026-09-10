import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import NextShiftCard from "../components/mobile/NextShiftCard";
import MobileShiftRow from "../components/mobile/MobileShiftRow";
import { useCurrentEmployee } from "../api/employees";
import { useEmployeeShifts } from "../api/schedule";
import StateMessage from "../components/ui/StateMessage";
import { formatShiftDay, formatShiftRangeLong, startOfWeek } from "../lib/format";
import "./MobilePage.css";

/** Employee-facing mobile view of their own schedule. */
export default function MobilePage() {
  const navigate = useNavigate();
  const employee = useCurrentEmployee();
  const shifts = useEmployeeShifts(employee.data?.employeeId, startOfWeek());
  const next = shifts.data?.find((shift) => new Date(shift.endTime) >= new Date()) ?? shifts.data?.[0];

  return (
    <div className="mobile">
      <header>
        <b>SHIFTLY</b>
        <h1>Hi, {employee.data?.firstName ?? "there"}</h1>
        <p>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
      </header>
      <main>
        <h4>Your next shift</h4>
        {employee.isError || shifts.isError ? <StateMessage tone="error" title="Could not load your shifts" detail={(employee.error ?? shifts.error)?.message} /> : !next ? <StateMessage title="No upcoming shifts" detail="Your schedule is clear." /> : <NextShiftCard shift={{ role: next.role ?? "Scheduled shift", time: formatShiftRangeLong(next.startTime, next.endTime), detail: `${formatShiftDay(next.startTime)} · ${next.breakMinutes || 0} min break` }} />}
        <Button onClick={() => navigate("/time-off")}>Request time off</Button>
        <h2>This week</h2>
        {(shifts.data ?? []).map((shift) => (
          <MobileShiftRow key={shift.id} day={formatShiftDay(shift.startTime)} time={formatShiftRangeLong(shift.startTime, shift.endTime)} />
        ))}
      </main>
    </div>
  );
}
