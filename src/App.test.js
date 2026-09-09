import { render, screen } from "@testing-library/react";
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
