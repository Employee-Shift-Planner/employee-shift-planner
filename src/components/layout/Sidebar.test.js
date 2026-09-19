import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { storeSession } from "../../api/client";
import Sidebar from "./Sidebar";

test("logout clears the session and returns to sign in", () => {
  const client = new QueryClient();
  storeSession("test-token", { email: "manager@example.com", role: "Supervisor" });

  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/schedule"]}>
        <Routes>
          <Route path="/schedule" element={<Sidebar active="Schedule" />} />
          <Route path="/" element={<h1>Sign in</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  fireEvent.click(screen.getByRole("button", { name: "Log out" }));

  expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  expect(localStorage.getItem("token")).toBeNull();
  expect(localStorage.getItem("user")).toBeNull();
});
