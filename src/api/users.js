import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, post, put } from "./client";

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: () => get("/User") });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user) => post("/Auth/register", user),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUserAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role, isActive }) => put(`/User/${encodeURIComponent(id)}/access`, { role, isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
