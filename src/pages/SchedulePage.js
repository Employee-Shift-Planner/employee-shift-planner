import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import Metrics from "../components/ui/Metrics";
import StateMessage from "../components/ui/StateMessage";
import WeekCalendar from "../components/schedule/WeekCalendar";
import { useWeekShifts } from "../api/schedule";
import { useWeeklyReport } from "../api/reports";
import {
  formatDayHeading,
  formatHours,
  formatPercent,
  formatShiftRange,
  formatWeekRange,
  startOfWeek,
  toDateParam,
  toneFor,
} from "../lib/format";
import { addWeeks, fromDateParam } from "../utils/week";
import "./SchedulePage.css";

/** Place each shift in its day column, stacking same-day shifts down the rows. */
const toCalendarBlocks = (shifts, weekStart) => {
  const perDay = new Map();

  return shifts.map((shift) => {
    const start = new Date(shift.startTime);
    const dayIndex = Math.floor((start - weekStart) / 86_400_000);
    const column = Math.min(Math.max(dayIndex, 0), 6) + 1;
    const row = (perDay.get(column) ?? 0) + 1;
    perDay.set(column, row);

    return {
      id: shift.id,
      column,
      row,
      label: shift.role || shift.employeeName,
      time: formatShiftRange(shift.startTime, shift.endTime),
      tone: toneFor(shift.employeeId, shift.assignedColor),
    };
  });
};

export default function SchedulePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentWeek = useMemo(() => startOfWeek(), []);
  const weekStart = useMemo(() => {
    const requested = fromDateParam(searchParams.get("week"));
    return requested ? startOfWeek(requested) : currentWeek;
  }, [currentWeek, searchParams]);
  const shifts = useWeekShifts(weekStart);
  const report = useWeeklyReport(weekStart);
  const isCurrentWeek = toDateParam(weekStart) === toDateParam(currentWeek);

  const selectWeek = (date) => {
    const normalized = startOfWeek(date);
    setSearchParams(toDateParam(normalized) === toDateParam(currentWeek)
      ? {}
      : { week: toDateParam(normalized) });
  };

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, offset) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + offset);
        return formatDayHeading(date);
      }),
    [weekStart]
  );

  const metrics = [
    { value: report.data?.scheduledShifts ?? "—", label: "Scheduled shifts", tone: "blue" },
    {
      value: report.data ? formatHours(report.data.totalHours) : "—",
      label: "Total hours",
      tone: "green",
    },
    { value: report.data?.coverageGaps ?? "—", label: "Coverage gaps", tone: "red" },
    {
      value: report.data ? formatPercent(report.data.availabilityFitPercent) : "—",
      label: "Availability fit",
      tone: "orange",
    },
  ];

  return (
    <Shell
      active="Schedule"
      title="Weekly Schedule"
      copy={formatWeekRange(weekStart)}
      actions={
        <Button onClick={() => navigate(`/create-shift?week=${toDateParam(weekStart)}`)}>+ Create shift</Button>
      }
    >
      <nav className="week-navigation" aria-label="Schedule week navigation">
        <Button tone="gray" onClick={() => selectWeek(addWeeks(weekStart, -1))} aria-label="View previous week">
          ← Previous
        </Button>
        <div className="week-navigation-current" aria-live="polite">
          <b>{isCurrentWeek ? "This week" : formatWeekRange(weekStart)}</b>
          {!isCurrentWeek ? <Button tone="gray" onClick={() => selectWeek(currentWeek)}>Today</Button> : null}
        </div>
        <Button tone="gray" onClick={() => selectWeek(addWeeks(weekStart, 1))} aria-label="View next week">
          Next →
        </Button>
      </nav>
      <Metrics items={metrics} />
      {shifts.isPending ? (
        <StateMessage title="Loading the week…" detail="Fetching shifts from the scheduler." />
      ) : shifts.isError ? (
        <StateMessage
          tone="error"
          title="Could not load the schedule"
          detail={shifts.error?.message}
        />
      ) : (
        <WeekCalendar days={days} shifts={toCalendarBlocks(shifts.data, weekStart)} />
      )}
    </Shell>
  );
}
