import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, post, put, query } from "./client";
import { currentUser } from "./auth";

export function useTimeOffRequests(filters = {}) {
  return useQuery({
    queryKey: ["time-off", filters],
    queryFn: () => get(`/TimeOffRequests${query(filters)}`),
  });
}

export function useCreateTimeOffRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request) => post("/TimeOffRequests", request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["time-off"] }),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
