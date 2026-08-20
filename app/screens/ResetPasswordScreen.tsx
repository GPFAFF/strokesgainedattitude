import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import AuthField from "../components/AuthField";
import ScreenWrapper from "../components/ScreenWrapper";
import HeaderBar from "../components/HeaderBar";
import { updatePassword, logout } from "../services/authService";
import { useSnackbar } from "../context/SnackbarContext";
import { authErrorMessage } from "../lib/authErrors";
import { MIN_PASSWORD_LENGTH, validatePassword } from "../lib/validation";
import { colors, spacing, typography } from "../theme";

type Props = {
  /** Called once the password has been changed, to leave recovery mode. */
  onDone: () => void;
};

/**
 * Shown when the app is opened from a password-recovery link. At that point the
 * user already holds a valid recovery session, so this only has to set the new
 * password.
 */
export default function ResetPasswordScreen({ onDone }: Props) {
  const showSnackbar = useSnackbar();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (submitting) return;

    const passwordError = validatePassword(password);
    const mismatch = password !== confirm ? "Passwords don't match." : undefined;
    setError(passwordError ?? undefined);
    setConfirmError(mismatch);
    if (passwordError || mismatch) return;

    setSubmitting(true);
    try {
      await updatePassword(password);
      // Sign out so the new password is used for a clean login, rather than
      // leaving the user in the short-lived recovery session.
      await logout();
      showSnackbar("Password updated — log in with your new password.", "success");
      onDone();
    } catch (err) {
      showSnackbar(authErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper>
      <HeaderBar showIcon={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Choose a new password</Text>

          <AuthField
            label="New password"
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setError(undefined);
            }}
            error={error}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
          />

          <AuthField
            label="Confirm password"
            placeholder="Re-enter your password"
            value={confirm}
            onChangeText={(v) => {
              setConfirm(v);
              setConfirmError(undefined);
            }}
            error={confirmError}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            returnKeyType="go"
            onSubmitEditing={handleSave}
          />

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>Save password</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onDone} style={styles.linkButton}>
            <Text style={styles.link}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: "center" },
  title: {
    ...typography.h1,
    color: colors.primaryDark,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.primaryDark,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginTop: spacing.sm,
    minHeight: 52,
    justifyContent: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...typography.bodyStrong, color: colors.onPrimary },
  linkButton: { paddingVertical: spacing.sm, alignItems: "center" },
  link: { ...typography.body, color: colors.textSecondary },
});
