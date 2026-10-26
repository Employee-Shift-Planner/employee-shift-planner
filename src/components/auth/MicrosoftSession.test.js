import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { restoreCookieSession } from "../../api/client";

jest.mock("../../api/client", () => ({ API_BASE_URL: "/api", restoreCookieSession: jest.fn() }));
process.env.REACT_APP_MICROSOFT_LOGIN_ENABLED = "true";
const MicrosoftSession = require("./MicrosoftSession").default;

beforeEach(() => jest.clearAllMocks());

test("route guards wait until the server restores the session", async () => {
  let resolve;
  restoreCookieSession.mockImplementation(() => new Promise(done => { resolve = done; }));
  render(<MicrosoftSession><p>Protected routes</p></MicrosoftSession>);
  expect(screen.getByRole("status")).toHaveTextContent("Checking your session");
  expect(screen.queryByText("Protected routes")).not.toBeInTheDocument();
  resolve({ email: "user@example.com" });
  expect(await screen.findByText("Protected routes")).toBeInTheDocument();
});

test("anonymous sessions can reach login", async () => {
  restoreCookieSession.mockRejectedValue({ status: 401 });
  render(<MicrosoftSession><p>Login routes</p></MicrosoftSession>);
  expect(await screen.findByText("Login routes")).toBeInTheDocument();
});

test("network failures offer retry without rendering login", async () => {
  restoreCookieSession.mockRejectedValueOnce({ status: 0 }).mockResolvedValueOnce({});
  render(<MicrosoftSession><p>Application routes</p></MicrosoftSession>);
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not check your session");
  expect(screen.queryByText("Application routes")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() => expect(screen.getByText("Application routes")).toBeInTheDocument());
});
