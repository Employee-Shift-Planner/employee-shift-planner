import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get, put } from "./client";

const cacheRegionalSettings = (value) => {
  try {
    localStorage.setItem("organization-timezone", value.timeZone);
    localStorage.setItem("organization-currency", value.currency);
    localStorage.setItem("organization-week-start", String(value.workWeekStartDay ?? 1));
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
    client.invalidateQueries();
    client.invalidateQueries({ queryKey:["schedule"] });
  }});
}


// Subscribe calendar pages to organization changes, including the initial fetch.
export function useWorkWeekStartDay() {
  const settings = useOrganizationSettings();
  return settings.data?.workWeekStartDay ?? Number(localStorage.getItem("organization-week-start") ?? 1);
}
