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
  const exportExcel = () => {
    if (!report.data) return;
    const rows = [
      ["Employee", "Employee ID", "Scheduled hours"],
      ...report.data.hoursByEmployee.map((row) => [row.fullName, row.employeeId, row.hours]),
      [],
      ["Day", "Date", "Scheduled employees", "Available employees", "Hours", "Coverage %", "Coverage gap"],
      ...report.data.coverageByDay.map((day) => [day.day, day.date, day.scheduledEmployees, day.availableEmployees, day.hours, day.coveragePercent, day.isGap ? "Yes" : "No"]),
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
      copy="Track coverage, hours and labour-cost risk."
      actions={
        <>
          <Button disabled={!report.data} onClick={() => window.print()}>Export PDF</Button>
          <Button disabled={!report.data} tone="success" onClick={exportExcel}>Export Excel</Button>
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
