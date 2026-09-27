import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import StateMessage from "../components/ui/StateMessage";
import ScheduleBuilder from "../components/schedule/ScheduleBuilder";
import ShiftManagerDialog from "../components/schedule/ShiftManagerDialog";
import { useCopyWeek, usePublishWeek, useScheduleReadiness, useWeekShifts } from "../api/schedule";
import { useWeeklyReport } from "../api/reports";
import { useCoverageWarnings } from "../api/staffing";
import { useStaffingRequirements } from "../api/staffing";
import { useEmployees } from "../api/employees";
import { useHolidays } from "../api/holidays";
import {
  formatDayHeading,
  formatCurrencyCompact,
  formatPercent,
  formatWeekRange,
  startOfWeek,
  toDateParam,
} from "../lib/format";
import { addWeeks, fromDateParam } from "../utils/week";
import "./SchedulePage.css";

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
  const readiness = useScheduleReadiness(weekStart);
  const report = useWeeklyReport(weekStart);
  const coverage = useCoverageWarnings(weekStart);
  const requirements = useStaffingRequirements();
  const employees = useEmployees();
  const weekEnd = useMemo(() => { const value = new Date(weekStart); value.setDate(value.getDate() + 6); return value; }, [weekStart]);
  const holidays = useHolidays(toDateParam(weekStart), toDateParam(weekEnd));
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

  const openReport = (focus) => navigate(`/reports?week=${toDateParam(weekStart)}#${focus}`);

  return (
    <Shell
      active="Schedule"
      title="Weekly Schedule"
      copy={formatWeekRange(weekStart)}
      actions={
        <>
          <Button
            tone="success"
            disabled={!draftCount || readiness.isPending || !readiness.data?.isReady || publishWeek.isPending}
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
      <section className="schedule-summary card" aria-label="Current week scheduling summary">
        <div className="schedule-summary-heading"><b>Week at a glance</b><span>Operational signals for this schedule</span></div>
        <button type="button" onClick={() => openReport("coverage")}><strong>{report.data ? formatPercent(report.data.coveragePercent) : "—"}</strong><span>Coverage</span></button>
        <button type="button" className={(coverage.data?.length ?? 0) > 0 ? "needs-attention" : ""} onClick={() => openReport("coverage")}><strong>{coverage.data?.length ?? "—"}</strong><span>Coverage gaps</span></button>
        <button type="button" className={(readiness.data?.issues?.length ?? 0) > 0 ? "needs-attention" : ""} onClick={() => document.querySelector(".schedule-readiness")?.scrollIntoView({ behavior: "smooth", block: "center" })}><strong>{readiness.data?.issues?.length ?? "—"}</strong><span>Conflicts</span></button>
        <button type="button" onClick={() => openReport("labour-cost")}><strong>{report.data ? formatCurrencyCompact(report.data.labourCost, report.data.currency) : "—"}</strong><span>Forecast cost</span></button>
        <button type="button" className="schedule-summary-report" onClick={() => openReport("overview")}><span>Full report</span><strong aria-hidden="true">→</strong></button>
      </section>
      {holidays.isError ? <StateMessage tone="error" title="Could not load holidays" detail={holidays.error?.message} /> : null}
      {holidays.isSuccess && holidays.data.length ? <section className="holiday-week" aria-label="Holidays this week">{holidays.data.map((holiday) => <article key={holiday.id}><b>{holiday.date} · {holiday.name}</b><span>{holiday.schedulingPolicy === "Closed" ? "Closed — shifts cannot be assigned" : holiday.schedulingPolicy === "Warning" ? "Review holiday staffing" : "Holiday"}</span></article>)}</section> : null}
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
      {readiness.isError ? (
        <div className="schedule-readiness"><StateMessage tone="error" title="Could not check schedule readiness" detail={readiness.error?.message} /></div>
      ) : readiness.isPending ? (
        <div className="schedule-readiness"><StateMessage title="Checking schedule readiness…" detail="Running the final assignment and labour-rule preflight." /></div>
      ) : readiness.data?.isReady ? null : (
        <div className="schedule-readiness"><StateMessage
          tone="error"
          title={`Schedule readiness: ${readiness.data?.issues?.length ?? 0} blocking ${(readiness.data?.issues?.length ?? 0) === 1 ? "issue" : "issues"}`}
          detail={(readiness.data?.issues ?? []).slice(0, 3).map((issue) => `Shift ${issue.shiftId}: ${issue.errors.join(" ")}`).join(" ")}
        /></div>
      )}
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
        <ScheduleBuilder days={days} weekStart={weekStart} shifts={shifts.data} employees={employees.data ?? []} requirements={requirements.data ?? []} onOpenShift={setSelectedShift} />
      )}
      {selectedShift ? (
        <ShiftManagerDialog shift={selectedShift} onClose={() => setSelectedShift(null)} />
      ) : null}
    </Shell>
  );
}
