import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearSession, getSessionExpiration, getStoredUser, getToken, post, storeSession, subscribeToSession } from "./client";

export const isSignedIn = () => Boolean(getToken());

export const currentUser = () => getStoredUser();

export const currentRole = () => {
  const role = String(getStoredUser()?.role ?? "Employee").toLowerCase();
  if (role === "administrator" || role === "admin") return "Administrator";
  if (role === "supervisor" || role === "manager") return "Supervisor";
  return "Employee";
};

export const isManager = () => ["Administrator", "Supervisor"].includes(currentRole());
export const isAdministrator = () => currentRole() === "Administrator";
export const homeForCurrentRole = () => isManager() ? "/schedule" : "/mobile";

/** Keeps route guards in sync with logout, another browser tab and JWT expiry. */
export function useSession() {
  const [signedIn, setSignedIn] = useState(isSignedIn);

  useEffect(() => {
    let timer;
    const refresh = () => {
      setSignedIn(isSignedIn());
      window.clearTimeout(timer);
      const expiresAt = getSessionExpiration();
      if (expiresAt) timer = window.setTimeout(refresh, Math.max(0, expiresAt - Date.now()) + 25);
    };
    const unsubscribe = subscribeToSession(refresh);
    refresh();
    return () => { unsubscribe(); window.clearTimeout(timer); };
  }, []);

  return signedIn;
}

/**
 * The label shown at the foot of the sidebar. The API's user record carries an
 * email and role but no display name, so the email's local part stands in.
 */
export const currentUserLabel = () => {
  const user = getStoredUser();
  if (!user?.email) return "Signed in";
  const [name] = user.email.split("@");
  return name
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }) =>
      post("/auth/login", { email, password }, { auth: false }),
    onSuccess: (data) => {
      storeSession(data?.token, data?.user);
      // Anything cached for a previous account must not leak into this one.
      queryClient.clear();
    },
  });
}

/**
 * Both password-recovery endpoints are public. The API should always return a
 * successful forgot-password response, even when the email is not registered,
 * so this screen cannot be used to discover employee accounts.
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ email }) =>
      post("/auth/forgot-password", { email }, { auth: false }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email, token, password }) =>
      post("/auth/reset-password", { email, token, password }, { auth: false }),
  });
}

export function signOut(queryClient) {
  clearSession();
  queryClient?.clear();
}
