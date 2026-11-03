import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, get, post, put, query } from "./client";
import { currentUser } from "./auth";

export function useTimeOffRequests(filters = {}) {
  return useQuery({
    queryKey: ["time-off", filters],
    queryFn: () => get(`/TimeOffRequests${query(filters)}`),
  });
}

const invalidateTimeOff = client => {
  ["time-off", "schedule", "availability", "reports"].forEach(key => client.invalidateQueries({ queryKey:[key] }));
};

export function useUpdateTimeOffRequest() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...request }) => put(`/TimeOffRequests/${encodeURIComponent(id)}`, request),
    onSuccess: () => invalidateTimeOff(client),
  });
}

export function useDeleteTimeOffRequest() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: id => del(`/TimeOffRequests/${encodeURIComponent(id)}`),
    onSuccess: () => invalidateTimeOff(client),
  });
}

export function useCreateTimeOffRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request) => post("/TimeOffRequests", request),
    onSuccess: () => invalidateTimeOff(queryClient),
  });
}

export function useReviewTimeOffRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, decision, reviewNotes }) => put(`/TimeOffRequests/${encodeURIComponent(id)}/review`, {
      decision,
      reviewNotes: reviewNotes.trim() || null,
      reviewedBy: currentUser()?.email ?? null,
    }),
    onSuccess: () => invalidateTimeOff(queryClient),
  });
}
