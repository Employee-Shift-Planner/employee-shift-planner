import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

const renderAt = (path) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

beforeEach(() => window.localStorage.clear());
afterEach(() => jest.restoreAllMocks());

test("the root renders the API-backed sign-in screen", () => {
  renderAt("/");
  expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
});

test("planner routes require an authenticated API session", () => {
  renderAt("/schedule");
  expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
});

test("unknown routes return to sign in", () => {
  renderAt("/does-not-exist");
  expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
});

test("requests a password reset without exposing whether the account exists", async () => {
  const request = jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    text: () => Promise.resolve(""),
  });
  renderAt("/forgot-password");

  fireEvent.change(screen.getByLabelText("Email address"), {
    target: { value: "employee@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send reset link" }));

  expect(await screen.findByText("Check your email")).toBeInTheDocument();
  expect(request).toHaveBeenCalledWith(
    expect.stringMatching(/\/auth\/forgot-password$/),
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ email: "employee@example.com" }),
    })
  );
});

test("submits a valid password reset link", async () => {
  const request = jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    text: () => Promise.resolve(""),
  });
  renderAt("/reset-password?email=employee%40example.com&token=secure-token");

  fireEvent.change(screen.getByLabelText("New password"), { target: { value: "new-password" } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "new-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Update password" }));

  await waitFor(() => expect(request).toHaveBeenCalled());
  expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({
    email: "employee@example.com",
    token: "secure-token",
    password: "new-password",
  });
  expect(await screen.findByText("Password updated")).toBeInTheDocument();
});

test("rejects mismatched replacement passwords before calling the API", () => {
  const request = jest.spyOn(global, "fetch");
  renderAt("/reset-password?email=employee%40example.com&token=secure-token");

  fireEvent.change(screen.getByLabelText("New password"), { target: { value: "new-password" } });
  fireEvent.change(screen.getByLabelText("Confirm new password"), { target: { value: "different-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Update password" }));

  expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  expect(request).not.toHaveBeenCalled();
});

test("an invalid reset URL offers a new password reset link", () => {
  renderAt("/reset-password");

  expect(screen.getByText("Invalid reset link")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Request a new reset link" })).toHaveAttribute(
    "href",
    "/forgot-password"
  );
});
