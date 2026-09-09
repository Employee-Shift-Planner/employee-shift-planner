import { useQuery } from "@tanstack/react-query";
import { get, query } from "./client";
import { currentUser } from "./auth";
import { startOfWeek, toDateParam } from "../lib/format";

const weekParam = (weekStart) => toDateParam(weekStart ?? startOfWeek());

/** Every active employee — used wherever a name or role is needed. */
export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => get("/Employee"),
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
export function useCurrentEmployee() {
  const employees = useEmployees();
  const email = currentUser()?.email?.toLowerCase();

  const match =
    employees.data?.find((e) => e.email?.toLowerCase() === email) ??
    employees.data?.[0] ??
    null;

  return { ...employees, data: match };
}
