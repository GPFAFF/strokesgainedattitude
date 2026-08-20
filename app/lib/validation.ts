// Deliberately permissive: enough to catch typos and empty submits without
// rejecting addresses that are actually deliverable. The server is the real
// authority on whether an email exists.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Supabase's own default minimum. */
export const MIN_PASSWORD_LENGTH = 6;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Enter your email address.";
  if (!EMAIL_RE.test(trimmed)) return "That email address doesn't look valid.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Enter a password.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}
