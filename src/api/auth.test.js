import { clearSession, getStoredUser, getToken, storeSession } from "./client";

const jwt = (expiresAt) => {
  const payload = window.btoa(JSON.stringify({ exp: Math.floor(expiresAt / 1000) }))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `header.${payload}.signature`;
};

beforeEach(() => clearSession());

test("an expired JWT is removed with its account data", () => {
  storeSession(jwt(Date.now() - 60_000), { email: "expired@example.com" });

  expect(getToken()).toBeNull();
  expect(getStoredUser()).toBeNull();
});

test("an active JWT remains available", () => {
  const token = jwt(Date.now() + 60_000);
  storeSession(token, { email: "active@example.com" });

  expect(getToken()).toBe(token);
  expect(getStoredUser().email).toBe("active@example.com");
});

test("access credentials are never persisted in browser storage", () => {
  storeSession(jwt(Date.now() + 60_000), { email: "active@example.com" });
  expect(localStorage.getItem("token")).toBeNull();
  expect(localStorage.getItem("user")).toBeNull();
  expect(sessionStorage.getItem("token")).toBeNull();
});

test.each([401, 403, 500])("login errors never expose server diagnostics (%s)", async (status) => {
  const { post } = require("./client");
  jest.spyOn(global, "fetch").mockResolvedValue({ ok: false, status, text: async () => JSON.stringify({ message: "Database secret failure", traceId: "private-trace" }) });
  try {
    await post("/auth/login", {}, { auth: false });
    throw new Error("Expected rejection");
  } catch (error) {
    expect(error.message).not.toMatch(/Database|private-trace/);
    expect(error.message).toBe(status === 500 ? "Could not sign in. Please try again later." : "Invalid email or password.");
  } finally { jest.restoreAllMocks(); }
});

test("rate-limited sign-in tells users to wait", async () => {
  const { post } = require("./client");
  jest.spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 429, text: async () => "Internal limiter details" });
  await expect(post("/auth/login", {}, { auth: false })).rejects.toThrow("Too many attempts. Please wait a minute and try again.");
  jest.restoreAllMocks();
});

test("Microsoft session restores profile without exposing credentials and sends CSRF on mutations", async () => {
  const { restoreCookieSession, hasCookieSession, post } = require("./client");
  const { isSignedIn } = require("./auth");
  const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({ ok: true, status: 200,
    text: async () => JSON.stringify({ user: { email: "microsoft@example.com", role: "Administrator" }, csrfToken: "csrf-test" }) });
  try {
    await restoreCookieSession();
    expect(hasCookieSession()).toBe(true);
    expect(isSignedIn()).toBe(true);
    expect(getToken()).toBeNull();
    expect(getStoredUser().email).toBe("microsoft@example.com");
    await post("/auth/logout");
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ credentials: "include", headers: { "X-CSRF-TOKEN": "csrf-test" } });
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBeUndefined();
    clearSession();
    expect(hasCookieSession()).toBe(false);
    await post("/auth/login", {}, { auth: false });
    expect(fetchMock.mock.calls[2][1].headers["X-CSRF-TOKEN"]).toBeUndefined();
  } finally { jest.restoreAllMocks(); }
});
