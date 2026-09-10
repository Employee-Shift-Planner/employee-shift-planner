import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, put } from "./client";

/** One row per employee with a cell for every day of the week. */
export function useAvailabilityMatrix() {
  return useQuery({
    queryKey: ["availability", "matrix"],
    queryFn: () => get("/Availability/matrix"),
  });
}

/** Toggle or retime a single day for one employee. */
export function useSetAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (changes) => Promise.all(changes.map(({ employeeId, dayOfWeek, isAvailable, startTime, endTime, notes }) =>
      put(
        `/Availability/employee/${encodeURIComponent(employeeId)}/day/${encodeURIComponent(dayOfWeek)}`,
        {
          isAvailable,
          startTime: startTime ?? null,
          endTime: endTime ?? null,
          notes: notes ?? null,
        }
      ))),
    onSuccess: () => {
      // Availability feeds the roster summary and the coverage report too.
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
