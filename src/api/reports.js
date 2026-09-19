import { useQuery } from "@tanstack/react-query";
import { get, query } from "./client";
import { startOfWeek, toDateParam } from "../lib/format";

/** Coverage, hours, gaps and labour cost for one week. */
export function useWeeklyReport(weekStart) {
  const week = toDateParam(weekStart ?? startOfWeek());
  return useQuery({
    queryKey: ["reports", "weekly", week],
    queryFn: () => get(`/Reports/weekly${query({ weekStart: week })}`),
  });
}
