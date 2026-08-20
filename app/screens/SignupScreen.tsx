import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { signUp } from "../services/authService";
import Logo from "../components/logo";
import useAuthForm from "../hooks/useAuthForm";
import ScreenWrapper from "../components/ScreenWrapper";

import { useSnackbar } from "../context/SnackbarContext";
import { colors } from "../theme";
import HeaderBar from "../components/HeaderBar";

export default function SignupScreen() {
  const { email, password, setEmail, setPassword } = useAuthForm();

  const showSnackbar = useSnackbar();

  const handleSignup = async () => {
    try {
      // The profiles row is created by the handle_new_user database trigger,
      // and the root navigator swaps to the app tabs once a session exists —
      // so there is nothing to write and nowhere to navigate here.
      await signUp(email, password);
      showSnackbar("Account created!", "success");
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar(
          `Signup Error: ${error?.message || "Unknown error"}`,
          "error"
        );
      }
    }
  };

  return (
    <ScreenWrapper>
      <HeaderBar showIcon={false} />
      <View style={styles.container}>
        <Logo />
        <Text style={styles.title}>Create an Account</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        <TouchableOpacity onPress={handleSignup} style={styles.button}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#1B4332",
  },
  input: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    color: "#1B4332",
    backgroundColor: colors.whiteSmoke,
  },
  button: {
    backgroundColor: "#1B4332",
    padding: 15,
    borderRadius: 10,
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  secondaryButton: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2D6A4F",
  },
  link: { color: "#1B4332", textAlign: "center" },
});
