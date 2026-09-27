import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, put } from "./client";

const cacheRegionalSettings = (value) => {
  try {
    localStorage.setItem("organization-timezone", value.timeZone);
    localStorage.setItem("organization-currency", value.currency);
  } catch { /* storage may be unavailable in private browsing */ }
  return value;
};

export const useOrganizationSettings = () => useQuery({
  queryKey:["organization-settings"],
  queryFn:() => get("/OrganizationSettings").then(cacheRegionalSettings),
});
export function useSaveOrganizationSettings() {
  const client = useQueryClient();
  return useMutation({ mutationFn:value => put("/OrganizationSettings", value), onSuccess:value => {
    client.setQueryData(["organization-settings"], value);
    cacheRegionalSettings(value);
    client.invalidateQueries({ queryKey:["reports"] });
    client.invalidateQueries({ queryKey:["schedule"] });
  }});
}
