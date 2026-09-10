import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import Metrics from "../components/ui/Metrics";
import StateMessage from "../components/ui/StateMessage";
import WeekCalendar from "../components/schedule/WeekCalendar";
import ShiftManagerDialog from "../components/schedule/ShiftManagerDialog";
import { useCopyWeek, usePublishWeek, useWeekShifts } from "../api/schedule";
import { useWeeklyReport } from "../api/reports";
import { useCoverageWarnings } from "../api/staffing";
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
      source: shift,
      isDraft: !shift.isPublished,
    };
  });
};

export default function SchedulePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedShift, setSelectedShift] = useState(null);
  const currentWeek = useMemo(() => startOfWeek(), []);
  const weekStart = useMemo(() => {
    const requested = fromDateParam(searchParams.get("week"));
    return requested ? startOfWeek(requested) : currentWeek;
  }, [currentWeek, searchParams]);
  const shifts = useWeekShifts(weekStart);
  const report = useWeeklyReport(weekStart);
  const coverage = useCoverageWarnings(weekStart);
  const publishWeek = usePublishWeek(weekStart);
  const copyWeek = useCopyWeek(weekStart);
  const isCurrentWeek = toDateParam(weekStart) === toDateParam(currentWeek);
  const draftCount = shifts.data?.filter((shift) => !shift.isPublished).length ?? 0;

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
    { value: coverage.data?.length ?? "—", label: "Coverage gaps", tone: "red" },
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
        <>
          <Button
            tone="success"
            disabled={!draftCount || publishWeek.isPending}
            onClick={() => publishWeek.mutate()}
          >
            {publishWeek.isPending ? "Publishing…" : `Publish week${draftCount ? ` (${draftCount})` : ""}`}
          </Button>
          <Button
            tone="gray"
            disabled={copyWeek.isPending}
            onClick={() => window.confirm(`Copy shifts from ${formatWeekRange(addWeeks(weekStart, -1))} into this week as drafts?`) && copyWeek.mutate()}
          >
            {copyWeek.isPending ? "Copying…" : "Copy previous week"}
          </Button>
          <Button onClick={() => navigate(`/create-shift?week=${toDateParam(weekStart)}`)}>+ Create shift</Button>
        </>
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
      {coverage.isError ? <StateMessage tone="error" title="Could not check staffing coverage" detail={coverage.error?.message} /> : null}
      {coverage.isSuccess && coverage.data.length > 0 ? (
        <section className="coverage-warnings" aria-labelledby="coverage-warning-heading">
          <h2 id="coverage-warning-heading">Staffing coverage needed</h2>
          <div>{coverage.data.map((warning) => <article key={`${warning.requirementId}-${warning.date}`}>
            <b>{warning.dayOfWeek} · {String(warning.startTime).slice(0, 5)}–{String(warning.endTime).slice(0, 5)}</b>
            <span>{warning.positionTitle}: {warning.scheduledEmployees}/{warning.requiredEmployees} scheduled · {warning.missingEmployees} needed</span>
          </article>)}</div>
        </section>
      ) : null}
      {publishWeek.isError ? (
        <StateMessage tone="error" title="Could not publish this week" detail={publishWeek.error?.message} />
      ) : null}
      {copyWeek.isError ? (
        <StateMessage tone="error" title="Could not copy the previous week" detail={copyWeek.error?.message} />
      ) : null}
      {copyWeek.isSuccess ? (
        <div className="copy-week-result" role="status">
          Copied {copyWeek.data.copiedShifts} {copyWeek.data.copiedShifts === 1 ? "shift" : "shifts"} as drafts.
          {copyWeek.data.skippedShifts ? ` Skipped ${copyWeek.data.skippedShifts} conflicting ${copyWeek.data.skippedShifts === 1 ? "shift" : "shifts"}.` : ""}
        </div>
      ) : null}
      {shifts.isSuccess ? (
        <div className={`publication-status ${draftCount ? "draft" : "published"}`} role="status">
          <b>{draftCount ? `${draftCount} unpublished ${draftCount === 1 ? "change" : "changes"}` : "Week published"}</b>
          <span>{draftCount ? "Employees cannot see draft shifts until you publish the week." : "Employees can see all shifts currently in this week."}</span>
        </div>
      ) : null}
      {shifts.isPending ? (
        <StateMessage title="Loading the week…" detail="Fetching shifts from the scheduler." />
      ) : shifts.isError ? (
        <StateMessage
          tone="error"
          title="Could not load the schedule"
          detail={shifts.error?.message}
        />
      ) : (
        <WeekCalendar days={days} shifts={toCalendarBlocks(shifts.data, weekStart)} onShiftSelect={setSelectedShift} />
      )}
      {selectedShift ? (
        <ShiftManagerDialog shift={selectedShift} onClose={() => setSelectedShift(null)} />
      ) : null}
    </Shell>
  );
}
