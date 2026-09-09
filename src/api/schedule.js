import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, post, query } from "./client";
import { startOfWeek, toDateParam } from "../lib/format";

/** Shifts inside one Monday-first week, for the calendar. */
export function useWeekShifts(weekStart) {
  const week = toDateParam(weekStart ?? startOfWeek());
  return useQuery({
    queryKey: ["schedule", "week", week],
    queryFn: () => get(`/Schedule/week${query({ weekStart: week })}`),
  });
}

/** One employee's shifts from `from` onwards. */
export function useEmployeeShifts(employeeId, from) {
  return useQuery({
    queryKey: ["schedule", "employee", employeeId, from?.toISOString()],
    queryFn: () => get(`/Schedule${query({ employeeId, from })}`),
    enabled: Boolean(employeeId),
  });
}

/**
 * Who can take a proposed shift. Only runs once a valid window is set, since
 * the API rejects an end that is not after the start.
 */
export function useShiftCandidates({ start, end, role }) {
  const valid = Boolean(start && end && new Date(end) > new Date(start));

  return useQuery({
    queryKey: ["schedule", "candidates", start, end, role],
    queryFn: () => get(`/Schedule/candidates${query({ start, end, role })}`),
    enabled: valid,
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shift) => post("/Schedule", shift),
    onSuccess: () => {
      // The new shift changes the calendar, the roster and every report.
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
