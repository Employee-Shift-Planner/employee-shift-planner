import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, post, put, query } from "./client";
import { currentUser, isManager } from "./auth";
import { startOfWeek, toDateParam } from "../lib/format";

const weekParam = (weekStart) => toDateParam(weekStart ?? startOfWeek());

/** Every active employee — used wherever a name or role is needed. */
export function useEmployees(options = {}) {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => get("/Employee"),
    ...options,
  });
}

export function useEmployee(employeeId) {
  return useQuery({
    queryKey: ["employees", employeeId],
    queryFn: () => get(`/Employee/${encodeURIComponent(employeeId)}`),
    enabled: Boolean(employeeId),
    retry: false,
  });
}

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: () => get("/Position"),
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, description }) => post("/Position", {
      title: title.trim(),
      description: description.trim() || null,
      isActive: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });
}

const employeePayload = (employee) => ({
  employeeID: employee.employeeId.trim(),
  firstName: employee.firstName.trim(),
  middleName: employee.middleName.trim() || null,
  lastName: employee.lastName.trim(),
  email: employee.email.trim() || null,
  phone: employee.phone.trim() || null,
  positionId: employee.positionId ? Number(employee.positionId) : null,
  active: employee.active,
  preferredShift: employee.preferredShift || null,
  maxWeeklyHours: Number(employee.maxWeeklyHours),
  hourlyRate: Number(employee.hourlyRate),
  overtimeThresholdHours: Number(employee.overtimeThresholdHours),
});

export function useSaveEmployee(employeeId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employee) => employeeId
      ? put(`/Employee/${encodeURIComponent(employeeId)}`, employeePayload(employee))
      : post("/Employee", employeePayload(employee)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

/** The Employees table: role, availability summary and hours for the week. */
export function useRoster(weekStart) {
  const week = weekParam(weekStart);
  return useQuery({
    queryKey: ["employees", "roster", week],
    queryFn: () => get(`/Employee/roster${query({ weekStart: week })}`),
  });
}

/** Profile, weekly load and upcoming shifts for one person. */
export function useEmployeeSummary(employeeId, weekStart) {
  const week = weekParam(weekStart);
  return useQuery({
    queryKey: ["employees", employeeId, "summary", week],
    queryFn: () => get(`/Employee/${encodeURIComponent(employeeId)}/summary${query({ weekStart: week })}`),
    enabled: Boolean(employeeId),
    retry: false, // a 404 here means "no such employee" — don't hammer it
  });
}

/**
 * Which employee record the signed-in user corresponds to.
 *
 * The API's User and Employee tables are not linked, so this matches on email
 * address and falls back to the first employee. See the notes in README —
 * a User.EmployeeId column would make this exact.
 */
export function useCurrentEmployee(options = {}) {
  return useQuery({
    queryKey: ["employees", "me", currentUser()?.id, isManager()],
    queryFn: async () => {
      if (!isManager()) return get("/Employee/me");
      const employees = await get("/Employee");
      const email = currentUser()?.email?.toLowerCase();
      return employees.find((employee) => employee.email?.toLowerCase() === email) ?? employees[0] ?? null;
    },
    retry: false,
    ...options,
  });
}
