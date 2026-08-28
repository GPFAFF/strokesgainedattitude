import React from "react";
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

import Logo from "../components/logo";
import AuthField from "../components/AuthField";
import ScreenWrapper from "../components/ScreenWrapper";
import HeaderBar from "../components/HeaderBar";
import useAuthForm from "../hooks/useAuthForm";
import { login } from "../services/authService";
import { useSnackbar } from "../context/SnackbarContext";
import { authErrorMessage } from "../lib/authErrors";
import { colors, spacing, typography } from "../theme";
import { RootStackParamList } from "../lib/types";

const LoginScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const showSnackbar = useSnackbar();
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

  const handleLogin = async () => {
    if (submitting || !validate()) return;

    setSubmitting(true);
    try {
      // On success a session appears and the root navigator swaps to the app
      // tabs, so there is nothing to navigate to here.
      await login(email, password);
    } catch (error: unknown) {
      showSnackbar(authErrorMessage(error), "error");
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
          <Logo />
          <Text style={styles.title}>Welcome back</Text>

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
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.buttonText}>Log in</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.linkButton}
          >
            <Text style={styles.link}>Forgot your password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Signup")}
            style={styles.linkButton}
          >
            <Text style={styles.link}>
              Don&apos;t have an account?{" "}
              <Text style={styles.linkStrong}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: "center" },
  title: {
    ...typography.h1,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
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
  linkStrong: { color: colors.primaryDark, fontWeight: "600" },
});
