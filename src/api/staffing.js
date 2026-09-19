import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, get, post, put, query } from "./client";
import { startOfWeek, toDateParam } from "../lib/format";

export function useStaffingRequirements() {
  return useQuery({ queryKey: ["staffing-requirements"], queryFn: () => get("/StaffingRequirements") });
}

export function useCoverageWarnings(weekStart) {
  const week = toDateParam(weekStart ?? startOfWeek());
  return useQuery({
    queryKey: ["staffing-requirements", "coverage", week],
    queryFn: () => get(`/StaffingRequirements/coverage${query({ weekStart: week })}`),
  });
}

const refresh = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ["staffing-requirements"] });
  queryClient.invalidateQueries({ queryKey: ["reports"] });
};

export function useCreateStaffingRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value) => post("/StaffingRequirements", value),
    onSuccess: () => refresh(queryClient),
  });
}

export function useUpdateStaffingRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value) => put(`/StaffingRequirements/${encodeURIComponent(value.id)}`, value),
    onSuccess: () => refresh(queryClient),
  });
}

export function useDeleteStaffingRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => del(`/StaffingRequirements/${encodeURIComponent(id)}`),
    onSuccess: () => refresh(queryClient),
  });
}
