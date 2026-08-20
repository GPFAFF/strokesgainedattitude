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

import Logo from "../components/logo";
import AuthField from "../components/AuthField";
import ScreenWrapper from "../components/ScreenWrapper";
import HeaderBar from "../components/HeaderBar";
import useAuthForm from "../hooks/useAuthForm";
import { signUp } from "../services/authService";
import { useSnackbar } from "../context/SnackbarContext";
import { authErrorMessage } from "../lib/authErrors";
import { MIN_PASSWORD_LENGTH } from "../lib/validation";
import { colors, spacing, typography } from "../theme";
import { RootStackParamList } from "../lib/types";

export default function SignupScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const showSnackbar = useSnackbar();
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const {
    email,
    password,
    setEmail,
    setPassword,
    errors,
    validate,
    submitting,
    setSubmitting,
  } = useAuthForm();

  const handleSignup = async () => {
    if (submitting || !validate()) return;

    setSubmitting(true);
    try {
      // The profiles row is created by the handle_new_user database trigger.
      const { signedIn } = await signUp(email, password);

      if (signedIn) {
        // A session exists, so the root navigator swaps to the app tabs.
        showSnackbar("Account created!", "success");
      } else {
        // Email confirmation is on: there is no session yet, and without
        // saying so the screen would just sit there looking broken.
        setAwaitingConfirmation(true);
      }
    } catch (error) {
      showSnackbar(authErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (awaitingConfirmation) {
    return (
      <ScreenWrapper>
        <HeaderBar showIcon={false} />
        <View style={styles.confirmContainer}>
          <Ionicons name="mail-outline" size={56} color={colors.primary} />
          <Text style={styles.title}>Check your inbox</Text>
          <Text style={styles.confirmBody}>
            We sent a confirmation link to{" "}
            <Text style={styles.linkStrong}>{email.trim()}</Text>. Tap it to
            finish setting up your account, then log in.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Go to log in</Text>
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
          <Logo />
          <Text style={styles.title}>Create an account</Text>

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
            returnKeyType="next"
          />

          <AuthField
            label="Password"
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            returnKeyType="go"
            onSubmitEditing={handleSignup}
          />

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.linkButton}
          >
            <Text style={styles.link}>
              Already have an account?{" "}
              <Text style={styles.linkStrong}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: "center" },
  confirmContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  confirmBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
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
    alignSelf: "stretch",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...typography.bodyStrong, color: colors.onPrimary },
  linkButton: { paddingVertical: spacing.sm, alignItems: "center" },
  link: { ...typography.body, color: colors.textSecondary },
  linkStrong: { color: colors.primaryDark, fontWeight: "600" },
});
