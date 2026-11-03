import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import AssignEmployees from "./AssignEmployees";

test("selects multiple available employees and allows deselection", () => {
  function Form() {
    const [ids, setIds] = useState([]);
    return <AssignEmployees candidates={[
      { employeeId:"E1", fullName:"John Brown", status:"Available" },
      { employeeId:"E2", fullName:"Alicia Reid", status:"Available" },
      { employeeId:"E3", fullName:"Unavailable Employee", status:"Time conflict" },
    ]} selectedIds={ids} onSelect={id => setIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id])} />;
  }
  render(<Form />);
  const john = screen.getByRole("checkbox", { name:/John Brown/ });
  const alicia = screen.getByRole("checkbox", { name:/Alicia Reid/ });
  expect(screen.getByRole("checkbox", { name:/Unavailable Employee/ })).toBeDisabled();
  fireEvent.click(john);
  fireEvent.click(alicia);
  expect(john).toBeChecked();
  expect(alicia).toBeChecked();
  expect(screen.getByText(/2 selected/)).toBeInTheDocument();
  fireEvent.click(john);
  expect(john).not.toBeChecked();
  expect(alicia).toBeChecked();
});
