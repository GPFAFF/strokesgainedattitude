import * as Linking from "expo-linking";

import { supabase } from "../lib/supabase";

export type SignUpResult = {
  /** True when Supabase issued a session immediately (email confirmation off). */
  signedIn: boolean;
  /** True when the user must click a link in their inbox before logging in. */
  needsEmailConfirmation: boolean;
};

export const signUp = async (
  email: string,
  password: string
): Promise<SignUpResult> => {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: Linking.createURL("/auth/confirm") },
  });
  if (error) throw error;

  // With "Confirm email" enabled, signUp returns a user but no session. The
  // caller has to say so rather than silently appearing to do nothing.
  // The profiles row is created by the handle_new_user trigger either way.
  return {
    signedIn: !!data.session,
    needsEmailConfirmation: !data.session && !!data.user,
  };
};

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return data.user;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Sends a recovery email. The link opens the app via its URL scheme, which
 * App.tsx turns into a session and routes to the reset screen.
 */
export const requestPasswordReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: Linking.createURL("/auth/reset"),
  });
  if (error) throw error;
};

/** Sets a new password for the user in the current (recovery) session. */
export const updatePassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
};
