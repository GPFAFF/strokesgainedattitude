import { AuthError } from "@supabase/supabase-js";

/**
 * Supabase surfaces auth failures as terse API strings ("Invalid login
 * credentials", "User already registered"). Map the ones a user can actually
 * hit onto something that tells them what to do next, and never leak a raw
 * "AuthApiError: ..." into the UI.
 */
export function authErrorMessage(error: unknown): string {
  const raw =
    error instanceof AuthError || error instanceof Error
      ? error.message
      : String(error ?? "");

  const message = raw.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "That email or password doesn't look right.";
  }
  if (message.includes("email not confirmed")) {
    return "Please confirm your email first — check your inbox for the link.";
  }
  if (message.includes("user already registered")) {
    return "That email already has an account. Try logging in instead.";
  }
  if (message.includes("password should be at least")) {
    return "Password must be at least 6 characters.";
  }
  if (message.includes("unable to validate email") || message.includes("invalid email")) {
    return "That email address doesn't look valid.";
  }
  if (message.includes("for security purposes") || message.includes("rate limit")) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (message.includes("same password")) {
    return "Your new password must be different from the old one.";
  }
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout")
  ) {
    return "Can't reach the server. Check your connection and try again.";
  }

  return raw || "Something went wrong. Please try again.";
}
