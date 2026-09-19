import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { del, get, post, put, query } from "./client";

const refresh = (client) => client.invalidateQueries({ queryKey: ["holidays"] });

export function useHolidaySettings() {
  return useQuery({ queryKey: ["holidays", "settings"], queryFn: () => get("/Holidays/settings") });
}

export function useHolidays(from, to) {
  return useQuery({
    queryKey: ["holidays", from, to],
    queryFn: () => get(`/Holidays${query({ from, to })}`),
    enabled: Boolean(from && to),
  });
}

export function useSaveHolidaySettings() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (value) => put("/Holidays/settings", value), onSuccess: () => refresh(client) });
}

export function useImportHolidays() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (year) => post(`/Holidays/import/${year}`), onSuccess: () => refresh(client) });
}

export function useCreateHoliday() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (value) => post("/Holidays", value), onSuccess: () => refresh(client) });
}

export function useDeleteHoliday() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id) => del(`/Holidays/${id}`), onSuccess: () => refresh(client) });
}
