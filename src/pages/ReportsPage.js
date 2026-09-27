import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const weekStart = useMemo(() => startOfWeek(fromDateParam(searchParams.get("week")) ?? undefined), [searchParams]);
  const report = useWeeklyReport(weekStart);
  useEffect(() => {
    if (!report.isSuccess || !window.location.hash) return;
    window.requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView({ block: "start" }));
  }, [report.isSuccess]);
  const exportExcel = () => {
    if (!report.data) return;
    const rows = [
      ["Employee", "Employee ID", "Scheduled hours"],
      ...report.data.hoursByEmployee.map((row) => [row.fullName, row.employeeId, row.hours]),
      [],
      ["Employee cost forecast", "Employee ID", "Regular hours", "Overtime hours", `Hourly rate (${report.data.currency})`, `Regular cost (${report.data.currency})`, `Overtime cost (${report.data.currency})`, `Total cost (${report.data.currency})`],
      ...report.data.labourCostByEmployee.map((row) => [row.fullName, row.employeeId, row.regularHours, row.overtimeHours, row.hourlyRate, row.regularCost, row.overtimeCost, row.totalCost]),
      [],
      ["Day", "Date", "Scheduled employees", "Required employees", "Hours", "Coverage %", "Coverage gap"],
      ...report.data.coverageByDay.map((day) => [day.day, day.date, day.scheduledEmployees, day.requiredEmployees, day.hours, day.coveragePercent, day.isGap ? "Yes" : "No"]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `shift-report-${String(report.data.weekStart).slice(0, 10)}.csv`; link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Shell
      active="Reports"
      title="Reports & exports"
      copy={`${formatWeekRange(weekStart)} · Coverage, hours and labour-cost risk.`}
      actions={
        <>
          <Button disabled={!report.data} onClick={() => window.print()}>Export PDF</Button>
          <Button disabled={!report.data} tone="success" onClick={exportExcel}>Export Excel</Button>
        </>
      }
    >
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
