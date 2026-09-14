import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, put } from "./client";

export const useOrganizationSettings = () => useQuery({ queryKey:["organization-settings"], queryFn:() => get("/OrganizationSettings") });
export function useSaveOrganizationSettings() {
  const client = useQueryClient();
  return useMutation({ mutationFn:value => put("/OrganizationSettings", value), onSuccess:value => {
    client.setQueryData(["organization-settings"], value);
    localStorage.setItem("organization-timezone", value.timeZone);
    localStorage.setItem("organization-currency", value.currency);
    client.invalidateQueries({ queryKey:["reports"] });
    client.invalidateQueries({ queryKey:["schedule"] });
  }});
}
