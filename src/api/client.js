// Thin fetch wrapper around the Scheduler API.
//
// The base URL comes from REACT_APP_API_BASE_URL so local, staging and
// production builds can point at different hosts without a code change.

// Missing configuration stays on the current origin; never silently use production.
export const API_BASE_URL = (
  process.env.REACT_APP_API_BASE_URL || "/api"
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const TOKEN_KEY = "token";
const USER_KEY = "user";
const EXPIRES_KEY = "sessionExpiresAt";
export const SESSION_CHANGED_EVENT = "shiftly:session-changed";

// Legacy bearer credentials and the cookie session profile live only in memory.
// HttpOnly cookie sessions are restored from /auth/me after a reload.
let csrfToken = null;
let cookieSession = false;
export const hasCookieSession = () => cookieSession;
const session = new Map();
const safeRead = (key) => session.get(key) ?? null;
const safeWrite = (key, value) => {
  if (value === null) session.delete(key);
  else session.set(key, value);
};
// Remove credentials persisted by older versions without adopting them.
try {
  [TOKEN_KEY, USER_KEY, EXPIRES_KEY].forEach(key => window.localStorage.removeItem(key));
} catch { /* storage unavailable */ }

const tokenExpiration = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(normalized)).exp * 1000 || null;
  } catch {
    return null;
  }
};

const announceSessionChange = () => {
  try { window.dispatchEvent(new Event(SESSION_CHANGED_EVENT)); } catch { /* no browser event target */ }
};

export const getSessionExpiration = () => {
  const value = Number(safeRead(EXPIRES_KEY));
  return Number.isFinite(value) && value > 0 ? value : null;
};

export const getToken = () => {
  const token = safeRead(TOKEN_KEY);
  const expiresAt = getSessionExpiration();
  if (token && expiresAt && expiresAt <= Date.now()) {
    safeWrite(TOKEN_KEY, null);
    safeWrite(USER_KEY, null);
    safeWrite(EXPIRES_KEY, null);
    announceSessionChange();
    return null;
  }
  return token;
};

export const getStoredUser = () => {
  const raw = safeRead(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const storeSession = (token, user) => {
  cookieSession = false;
  csrfToken = null;
  safeWrite(TOKEN_KEY, token ?? null);
  safeWrite(USER_KEY, user ? JSON.stringify(user) : null);
  safeWrite(EXPIRES_KEY, token ? String(tokenExpiration(token) ?? "") : null);
  announceSessionChange();
};

export const clearSession = () => storeSession(null, null);

export const restoreCookieSession = async () => {
  const data = await get("/auth/me");
  if (!data?.user || !data?.csrfToken) throw new Error("Could not restore your Microsoft session.");
  storeSession(null, data.user);
  cookieSession = true;
  csrfToken = data.csrfToken;
  announceSessionChange();
  return data.user;
};

export const subscribeToSession = (listener) => {
  window.addEventListener(SESSION_CHANGED_EVENT, listener);
  return () => window.removeEventListener(SESSION_CHANGED_EVENT, listener);
};

/** Build a query string from defined values only. */
export const query = (params) => {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, value instanceof Date ? value.toISOString() : value);
    }
  });
  const asString = search.toString();
  return asString ? `?${asString}` : "";
};

const parse = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

/** Pull the most useful message out of an ASP.NET error payload. */
const messageFor = (payload, status, path) => {
  if (status === 429) return "Too many attempts. Please wait a minute and try again.";
  if (status === 423) return "Sign-in is temporarily unavailable. Try again later or contact your administrator.";
  if (path === "/auth/login") {
    if (status === 400 || status === 401 || status === 403) return "Invalid email or password.";
    return "Could not sign in. Please try again later.";
  }
  if (status >= 500) return "The scheduler service is temporarily unavailable. Please try again later.";
  if (typeof payload === "string" && payload.trim()) return payload;
  if (payload?.message) return payload.message;
  if (payload?.title) return payload.title;
  if (payload?.errors) {
    const first = Object.values(payload.errors).flat()[0];
    if (first) return first;
  }
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 404) return "That record could not be found.";
  return `Request failed (${status}).`;
};

export async function request(path, options = {}) {
  const { method = "GET", body, signal, auth = true } = options;

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (auth && csrfToken && !["GET", "HEAD", "OPTIONS"].includes(method)) headers["X-CSRF-TOKEN"] = csrfToken;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    // Network failure, DNS failure, or a CORS rejection — all opaque here.
    throw new ApiError(
      "Could not reach the scheduler service. Check your connection and try again.",
      0,
      null
    );
  }

  const payload = parse(await response.text());

  if (!response.ok) {
    if (auth && response.status === 401) clearSession();
    throw new ApiError(messageFor(payload, response.status, path), response.status, payload);
  }

  return payload;
}

export const get = (path, options) => request(path, { ...options, method: "GET" });
export const post = (path, body, options) => request(path, { ...options, method: "POST", body });
export const put = (path, body, options) => request(path, { ...options, method: "PUT", body });
export const del = (path, options) => request(path, { ...options, method: "DELETE" });
