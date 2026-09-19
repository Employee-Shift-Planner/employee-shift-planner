import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, get, post, put, query } from "./client";
import { startOfWeek, toDateParam, toOrganizationInstant } from "../lib/format";

// datetime-local controls have no zone. The organization currently operates in
// America/Jamaica (UTC-05:00, with no daylight-saving transitions).
const asOrganizationInstant = toOrganizationInstant;

const withScheduleOffsets = (shift) => ({
  ...shift,
  startTime: asOrganizationInstant(shift.startTime),
  endTime: asOrganizationInstant(shift.endTime),
});

/** Shifts inside one Monday-first week, for the calendar. */
export function useWeekShifts(weekStart) {
  const week = toDateParam(weekStart ?? startOfWeek());
  return useQuery({
    queryKey: ["schedule", "week", week],
    queryFn: () => get(`/Schedule/week${query({ weekStart: week })}`),
  });
}

/** Final server-side publication preflight for every active shift in a week. */
export function useScheduleReadiness(weekStart) {
  const week = toDateParam(weekStart ?? startOfWeek());
  return useQuery({
    queryKey: ["schedule", "readiness", week],
    queryFn: () => get(`/Schedule/week/readiness${query({ weekStart: week })}`),
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
export function useShiftCandidates({ start, end, role, requiredSkill, breakMinutes, excludeShiftId }) {
  const valid = Boolean(start && end && new Date(end) > new Date(start));

  return useQuery({
    queryKey: ["schedule", "candidates", start, end, role, requiredSkill, breakMinutes, excludeShiftId],
    queryFn: () => get(`/Schedule/candidates${query({ start: asOrganizationInstant(start), end: asOrganizationInstant(end), role, requiredSkill, breakMinutes, excludeShiftId })}`),
    enabled: valid,
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shift) => post("/Schedule", withScheduleOffsets(shift)),
    onSuccess: () => {
      // The new shift changes the calendar, the roster and every report.
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

const invalidateScheduleData = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["schedule"] });
  queryClient.invalidateQueries({ queryKey: ["employees"] });
  queryClient.invalidateQueries({ queryKey: ["reports"] });
};

export function useUpdateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shift) => put(`/Schedule/${encodeURIComponent(shift.id)}`, withScheduleOffsets(shift)),
    onSuccess: () => invalidateScheduleData(queryClient),
  });
}

export function useCancelShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shiftId) => del(`/Schedule/${encodeURIComponent(shiftId)}`),
    onSuccess: () => invalidateScheduleData(queryClient),
  });
}

export function usePublishWeek(weekStart) {
  const queryClient = useQueryClient();
  const week = toDateParam(weekStart ?? startOfWeek());

  return useMutation({
    mutationFn: () => post(`/Schedule/week/publish${query({ weekStart: week })}`),
    onSuccess: () => invalidateScheduleData(queryClient),
  });
}

export function useCopyWeek(targetWeekStart) {
  const queryClient = useQueryClient();
  const target = targetWeekStart ?? startOfWeek();
  const source = new Date(target);
  source.setDate(source.getDate() - 7);

  return useMutation({
    mutationFn: () => post("/Schedule/week/copy", {
      sourceWeekStart: toDateParam(source),
      targetWeekStart: toDateParam(target),
    }),
    onSuccess: () => invalidateScheduleData(queryClient),
  });
}

export function useShiftTemplates() {
  return useQuery({
    queryKey: ["shift-templates"],
    queryFn: () => get("/ShiftTemplates"),
  });
}

export function useCreateShiftTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (template) => post("/ShiftTemplates", template),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shift-templates"] }),
  });
}

export function useDeleteShiftTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId) => del(`/ShiftTemplates/${encodeURIComponent(templateId)}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shift-templates"] }),
  });
}
