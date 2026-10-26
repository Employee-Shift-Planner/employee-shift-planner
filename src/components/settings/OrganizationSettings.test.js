import { fireEvent, render, screen } from "@testing-library/react";
import OrganizationSettings from "./OrganizationSettings";

const mockMutate = jest.fn();
jest.mock("../../api/auth", () => ({ isAdministrator: () => true }));
const mockSettings = { data: { locationName:"Office", countryCode:"JM", regionCode:"", timeZone:"America/Jamaica", currency:"JMD", isConfigured:true, workWeekStartDay:1 } };
jest.mock("../../api/organization", () => ({
  useOrganizationSettings: () => mockSettings,
  useSaveOrganizationSettings: () => ({ mutate:mockMutate, reset:jest.fn() }),
}));

test("editing either work week boundary preserves a seven day week and saves it", () => {
  render(<OrganizationSettings />);
  expect(screen.getByLabelText("Work week ends")).toHaveValue("0");
  fireEvent.change(screen.getByLabelText("Work week starts"), { target:{ value:"0" } });
  expect(screen.getByLabelText("Work week ends")).toHaveValue("6");
  fireEvent.change(screen.getByLabelText("Work week ends"), { target:{ value:"4" } });
  expect(screen.getByLabelText("Work week starts")).toHaveValue("5");
  fireEvent.click(screen.getByRole("button", { name:"Save organization defaults" }));
  expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ workWeekStartDay:5 }));
});
