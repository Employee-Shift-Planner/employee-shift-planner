import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearSession, getStoredUser, getToken, post, storeSession } from "./client";

export const isSignedIn = () => Boolean(getToken());

export const currentUser = () => getStoredUser();

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

export function signOut(queryClient) {
  clearSession();
  queryClient?.clear();
}
