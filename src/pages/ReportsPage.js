import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import Metrics from "../components/ui/Metrics";
import CoverageCard from "../components/reports/CoverageCard";
import InsightCard from "../components/reports/InsightCard";
import {
  COVERAGE_BY_DAY,
  REPORT_INSIGHTS,
  REPORT_METRICS,
} from "../data/reports";
import "./ReportsPage.css";

export default function ReportsPage() {
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
      <Metrics items={REPORT_METRICS} />
      <div className="reports">
        <CoverageCard coverage={COVERAGE_BY_DAY} />
        <div>
          {REPORT_INSIGHTS.map((insight) => (
            <InsightCard key={insight.id} {...insight} />
          ))}
        </div>
      </div>
    </Shell>
  );
}
