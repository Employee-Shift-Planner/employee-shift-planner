import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import Metrics from "../components/ui/Metrics";
import CoverageCard from "../components/reports/CoverageCard";
import InsightCard from "../components/reports/InsightCard";
import { useWeeklyReport } from "../api/reports";
import { QueryState } from "../components/ui/StateMessage";
import { formatCurrencyCompact, formatHours, formatPercent } from "../lib/format";
import "./ReportsPage.css";

export default function ReportsPage() {
  const report = useWeeklyReport();
  return (
    <Shell
      active="Reports"
      title="Reports & exports"
      copy="Track coverage, hours and labour-cost risk."
      actions={
        <>
          <Button>Export PDF</Button>
          <Button tone="success">Export Excel</Button>
        </>
      }
    >
      <QueryState query={report}>
        {(data) => <>
          <Metrics items={[
            { value: formatPercent(data.coveragePercent), label: "Coverage", tone: "green" },
            { value: formatHours(data.totalHours), label: "Hours", tone: "blue" },
            { value: data.coverageGaps, label: "Coverage gaps", tone: "red" },
            { value: formatCurrencyCompact(data.labourCost, data.currency), label: "Labour cost", tone: "purple" },
          ]} />
          <div className="reports">
            <CoverageCard coverage={data.coverageByDay.map((day) => ({ day: day.day.slice(0, 3).toUpperCase(), value: formatPercent(day.coveragePercent) }))} />
            <div>
              <InsightCard title="Needs attention" detail={data.coverageGaps ? `${data.coverageGaps} day${data.coverageGaps === 1 ? "" : "s"} fall below minimum staffing.` : "No staffing gaps this week."} />
              <InsightCard title="Availability fit" detail={`${formatPercent(data.availabilityFitPercent)} of scheduled shifts fit declared availability.`} />
            </div>
          </div>
        </>}
      </QueryState>
    </Shell>
  );
}
