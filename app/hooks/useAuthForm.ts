import { useCallback, useState } from "react";

import { validateEmail, validatePassword } from "../lib/validation";

type Field = "email" | "password";

export default function useAuthForm() {
  const [email, setEmailValue] = useState("");
  const [password, setPasswordValue] = useState("");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Clear a field's error as soon as the user edits it — leaving a stale error
  // under a field they've already fixed reads as though it's still wrong.
  const setEmail = useCallback((value: string) => {
    setEmailValue(value);
    setErrors((prev) => (prev.email ? { ...prev, email: undefined } : prev));
  }, []);

  const setPassword = useCallback((value: string) => {
    setPasswordValue(value);
    setErrors((prev) =>
      prev.password ? { ...prev, password: undefined } : prev
    );
  }, []);

  const validate = useCallback(
    ({ requirePassword = true }: { requirePassword?: boolean } = {}) => {
      const next: Partial<Record<Field, string>> = {};

      const emailError = validateEmail(email);
      if (emailError) next.email = emailError;

      if (requirePassword) {
        const passwordError = validatePassword(password);
        if (passwordError) next.password = passwordError;
      }

      setErrors(next);
      return Object.keys(next).length === 0;
    },
    [email, password]
  );

  const setFieldError = useCallback((field: Field, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  return {
    email,
    password,
    setEmail,
    setPassword,
    errors,
    validate,
    setFieldError,
    submitting,
    setSubmitting,
  };
}
