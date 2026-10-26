import { useWorkWeekStartDay } from "../api/organization";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DownloadDialog from "../components/ui/DownloadDialog";
import { downloadReport } from "../lib/reportExport";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import Metrics from "../components/ui/Metrics";
import CoverageCard from "../components/reports/CoverageCard";
import InsightCard from "../components/reports/InsightCard";
import { useWeeklyReport } from "../api/reports";
import { QueryState } from "../components/ui/StateMessage";
import { formatCurrency, formatCurrencyCompact, formatHours, formatPercent, formatWeekRange, startOfWeek } from "../lib/format";
import { fromDateParam } from "../utils/week";
import "./ReportsPage.css";

export default function ReportsPage() {
  const workWeekStartDay = useWorkWeekStartDay();
  const [searchParams] = useSearchParams();
  const weekStart = useMemo(() => startOfWeek(fromDateParam(searchParams.get("week")) ?? undefined, workWeekStartDay), [searchParams, workWeekStartDay]);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const report = useWeeklyReport(weekStart);
  useEffect(() => {
    if (!report.isSuccess || !window.location.hash) return;
    window.requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView({ block: "start" }));
  }, [report.isSuccess]);
  return (
    <Shell
      active="Reports"
      title="Reports & exports"
      copy={`${formatWeekRange(weekStart)} · Coverage, hours and labour-cost risk.`}
      actions={
        <Button tone="gray" disabled={!report.isSuccess} onClick={() => setDownloadOpen(true)} aria-haspopup="dialog">Download report</Button>
      }
    >
      {downloadOpen ? <DownloadDialog title="Download report" description={`${formatWeekRange(weekStart)} · Coverage, employee hours and labour costs.`} onDownload={format => downloadReport(format, weekStart, report.data)} onClose={() => setDownloadOpen(false)} /> : null}
      <QueryState query={report}>
        {(data) => <>
          <div id="overview"><Metrics items={[
            { value: formatPercent(data.coveragePercent), label: "Coverage", tone: "green" },
            { value: formatHours(data.totalHours), label: "Hours", tone: "blue" },
            { value: data.coverageGaps, label: "Coverage gaps", tone: "red" },
            { value: formatCurrencyCompact(data.labourCost, data.currency), label: "Labour cost", tone: "purple" },
            { value: formatHours(data.overtimeHours), label: "Overtime hours", tone: "red" },
            { value: formatCurrencyCompact(data.overtimeLabourCost, data.currency), label: "Overtime cost", tone: "orange" },
          ]} /></div>
          <div className="reports">
            <div id="coverage"><CoverageCard coverage={data.coverageByDay.map((day) => ({ day: day.day.slice(0, 3).toUpperCase(), value: formatPercent(day.coveragePercent) }))} /></div>
            <div>
              <InsightCard title="Needs attention" detail={data.coverageGaps ? `${data.coverageGaps} day${data.coverageGaps === 1 ? "" : "s"} fall below minimum staffing.` : "No staffing gaps this week."} />
              <InsightCard title="Availability fit" detail={`${formatPercent(data.availabilityFitPercent)} of scheduled shifts fit declared availability.`} />
            </div>
          </div>
          <section id="labour-cost" className="card labour-forecast">
            <div className="labour-forecast-heading"><div><h2>Labour-cost forecast</h2><p>Regular and overtime estimates based on assigned shifts.</p></div><b>{data.overtimeMultiplier}× overtime</b></div>
            {data.labourCostByEmployee.length === 0 ? <p>No scheduled labour cost this week.</p> : <div className="labour-forecast-table"><table><thead><tr><th>Employee</th><th>Regular</th><th>Overtime</th><th>Rate ({data.currency})</th><th>Regular cost ({data.currency})</th><th>Overtime cost ({data.currency})</th><th>Total ({data.currency})</th></tr></thead><tbody>
              {data.labourCostByEmployee.map((row) => <tr key={row.employeeId}><td>{row.fullName}</td><td>{formatHours(row.regularHours)}</td><td className={row.overtimeHours ? "cost-warning" : ""}>{formatHours(row.overtimeHours)}</td><td>{formatCurrency(row.hourlyRate, data.currency)}</td><td>{formatCurrency(row.regularCost, data.currency)}</td><td>{formatCurrency(row.overtimeCost, data.currency)}</td><td><b>{formatCurrency(row.totalCost, data.currency)}</b></td></tr>)}
            </tbody><tfoot><tr><th>Total</th><td>{formatHours(data.regularHours)}</td><td>{formatHours(data.overtimeHours)}</td><td>—</td><td>{formatCurrency(data.regularLabourCost, data.currency)}</td><td>{formatCurrency(data.overtimeLabourCost, data.currency)}</td><td><b>{formatCurrency(data.labourCost, data.currency)}</b></td></tr></tfoot></table></div>}
          </section>
        </>}
      </QueryState>
    </Shell>
  );
}
