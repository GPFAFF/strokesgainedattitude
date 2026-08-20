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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import AuthField from "../components/AuthField";
import ScreenWrapper from "../components/ScreenWrapper";
import HeaderBar from "../components/HeaderBar";
import useAuthForm from "../hooks/useAuthForm";
import { requestPasswordReset } from "../services/authService";
import { useSnackbar } from "../context/SnackbarContext";
import { authErrorMessage } from "../lib/authErrors";
import { colors, spacing, typography } from "../theme";
import { RootStackParamList } from "../lib/types";

export default function ForgotPasswordScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const showSnackbar = useSnackbar();
  const [sent, setSent] = useState(false);
  const { email, setEmail, errors, validate, submitting, setSubmitting } =
    useAuthForm();

  const handleSend = async () => {
    if (submitting || !validate({ requirePassword: false })) return;

    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      // Always report success. Saying "no account with that email" would let
      // anyone probe which addresses are registered.
      setSent(true);
    } catch (error) {
      showSnackbar(authErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <ScreenWrapper>
        <HeaderBar showIcon={false} />
        <View style={styles.center}>
          <Ionicons name="mail-outline" size={56} color={colors.primary} />
          <Text style={styles.title}>Check your inbox</Text>
          <Text style={styles.body}>
            If an account exists for{" "}
            <Text style={styles.linkStrong}>{email.trim()}</Text>, we&apos;ve
            sent a link to reset your password.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Back to log in</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderBar showIcon={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.body}>
            Enter the email you signed up with and we&apos;ll send you a link.
          </Text>

          <AuthField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="go"
            onSubmitEditing={handleSend}
          />

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSend}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>Send reset link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.linkButton}
          >
            <Text style={styles.link}>Back to log in</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: "center" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primaryDark,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: "center",
    marginTop: spacing.sm,
    minHeight: 52,
    justifyContent: "center",
    alignSelf: "stretch",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...typography.bodyStrong, color: colors.onPrimary },
  linkButton: { paddingVertical: spacing.sm, alignItems: "center" },
  link: { ...typography.body, color: colors.textSecondary },
  linkStrong: { color: colors.primaryDark, fontWeight: "600" },
});
