import { render, screen } from "@testing-library/react";
import SaveFeedback from "./SaveFeedback";

test("save feedback progresses from saving to success or failure", () => {
  const { rerender } = render(<SaveFeedback mutation={{ isPending:true }} />);
  expect(screen.getByText("Saving changes…")).toBeInTheDocument();

  rerender(<SaveFeedback mutation={{ isSuccess:true }} success="Settings saved." />);
  expect(screen.getByText("Settings saved.")).toBeInTheDocument();

  rerender(<SaveFeedback mutation={{ isError:true, error:new Error("Server unavailable") }} />);
  expect(screen.getByRole("alert")).toHaveTextContent("Changes were not saved");
  expect(screen.getByRole("alert")).toHaveTextContent("Server unavailable");
});
