import { useNavigate } from "react-router-dom";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import Metrics from "../components/ui/Metrics";
import WeekCalendar from "../components/schedule/WeekCalendar";
import { CURRENT_WEEK, SCHEDULE_METRICS, WEEK_SHIFTS } from "../data/shifts";

export default function SchedulePage() {
  const navigate = useNavigate();

  return (
    <Shell
      active="Schedule"
      title="Weekly Schedule"
      copy={CURRENT_WEEK.label}
      actions={
        <Button onClick={() => navigate("/create-shift")}>+ Create shift</Button>
      }
    >
      <Metrics items={SCHEDULE_METRICS} />
      <WeekCalendar days={CURRENT_WEEK.days} shifts={WEEK_SHIFTS} />
    </Shell>
  );
}
