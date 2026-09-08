export const REPORT_METRICS = [
  { value: "92%", label: "Coverage", tone: "green" },
  { value: "326h", label: "Hours", tone: "blue" },
  { value: "3", label: "Open shifts", tone: "red" },
  { value: "JMD 428K", label: "Labour cost", tone: "purple" },
];

export const COVERAGE_BY_DAY = [
  { day: "MON", value: "92%" },
  { day: "TUE", value: "94%" },
  { day: "WED", value: "100%" },
  { day: "THU", value: "88%" },
  { day: "FRI", value: "93%" },
  { day: "SAT", value: "66%" },
  { day: "SUN", value: "54%" },
];

export const REPORT_INSIGHTS = [
  {
    id: "needs-attention",
    title: "Needs attention",
    detail: "Saturday afternoon has two uncovered shifts.",
  },
  {
    id: "positive-trend",
    title: "Positive trend",
    detail: "Wednesday reached 100% coverage.",
  },
];
