import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  toneFor,
} from "../lib/format";

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
  const weekStart = useMemo(() => startOfWeek(), []);
  const shifts = useWeekShifts(weekStart);
  const report = useWeeklyReport(weekStart);

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
        <Button onClick={() => navigate("/create-shift")}>+ Create shift</Button>
      }
    >
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
