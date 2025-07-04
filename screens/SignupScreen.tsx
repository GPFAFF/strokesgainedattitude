import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { login, signUp } from "../services/authService"; // from your auth.js
import { createUserDocument } from "../firebase/users"; // see below
import Logo from "../components/logo";
import useAuthForm from "../hooks/useAuthForm";
import ScreenWrapper from "../components/ScreenWrapper";

import { NavigationProp } from "@react-navigation/native";

export default function SignupScreen({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) {
  const { email, password, setEmail, setPassword } = useAuthForm();

  const handleSignup = async () => {
    try {
      const userCredential = await signUp(email, password);
      const { uid } = userCredential;

      await createUserDocument(uid, email); // create Firestore doc

      Alert.alert("Success", "Account created!");
      navigation.navigate("AdminDashboard"); // or wherever you want to navigate
    } catch (error: any) {
      Alert.alert("Signup Error", error ? error?.message : "Unknown error");
    }
  };

  const handleLogin = async () => {
    await login(email, password);
    navigation.navigate("Login");
  };

  return (
    <ScreenWrapper>
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
        <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
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
  },
  secondaryButton: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2D6A4F",
  },
  link: { color: "#2D6A4F", textAlign: "center" },
});
