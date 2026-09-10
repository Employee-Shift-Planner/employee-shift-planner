import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, post, put, query } from "./client";
import { startOfWeek, toDateParam } from "../lib/format";

export const useSwapRequests = () => useQuery({ queryKey: ["operations", "swaps"], queryFn: () => get("/Operations/swaps") });
export function useCreateSwapRequest() { const client = useQueryClient(); return useMutation({ mutationFn: (value) => post("/Operations/swaps", value), onSuccess: () => client.invalidateQueries({ queryKey: ["operations"] }) }); }
export function useReviewSwapRequest() { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, ...value }) => put(`/Operations/swaps/${id}/review`, value), onSuccess: () => { client.invalidateQueries({ queryKey: ["operations"] }); client.invalidateQueries({ queryKey: ["schedule"] }); } }); }
export function useAttendance(weekStart, options = {}) { const week = toDateParam(weekStart ?? startOfWeek()); return useQuery({ queryKey: ["operations", "attendance", week], queryFn: () => get(`/Operations/attendance${query({ weekStart: week })}`), ...options }); }
export function useSaveAttendance() { const client = useQueryClient(); return useMutation({ mutationFn: (value) => put(`/Operations/attendance/${value.shiftId}`, value), onSuccess: () => client.invalidateQueries({ queryKey: ["operations", "attendance"] }) }); }
export const useAuditLog = (options = {}) => useQuery({ queryKey: ["operations", "audit"], queryFn: () => get("/Operations/audit?take=100"), ...options });
