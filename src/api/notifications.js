import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, get, put } from "./client";

/** The defaults the API applies to an employee with no saved row yet. */
export const DEFAULT_PREFERENCES = {
  newShiftAssignment: true,
  shiftChanged: true,
  upcomingReminder: true,
  schedulePublished: true,
  smsEnabled: false,
  reminderHoursBefore: 12,
};

/**
 * Notification rules for one employee. The API returns 404 until preferences
 * have been saved once, which is a normal empty state rather than an error.
 */
export function useNotificationPreferences(employeeId) {
  return useQuery({
    queryKey: ["notifications", employeeId],
    enabled: Boolean(employeeId),
    retry: false,
    queryFn: async () => {
      try {
        return await get(`/NotificationPreferences/${encodeURIComponent(employeeId)}`);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return { ...DEFAULT_PREFERENCES, employeeId };
        }
        throw error;
      }
    },
  });
}

export function useSaveNotificationPreferences(employeeId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences) =>
      put(`/NotificationPreferences/${encodeURIComponent(employeeId)}`, {
        ...preferences,
        employeeId,
      }),
    onSuccess: (saved) => {
      queryClient.setQueryData(["notifications", employeeId], saved);
    },
  });
}
