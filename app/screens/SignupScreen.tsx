import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { login, signUp } from "../services/authService"; // from your auth.js
import { createUserDocument } from "../firebase/users"; // see below
import Logo from "../components/logo";
import useAuthForm from "../hooks/useAuthForm";
import ScreenWrapper from "../components/ScreenWrapper";

import { NavigationProp } from "@react-navigation/native";
import { useSnackbar } from "../hooks/useSnackbar";
import { db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

export default function SignupScreen({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) {
  const { email, password, setEmail, setPassword } = useAuthForm();

  const showSnackbar = useSnackbar();

  const handleSignup = async () => {
    try {
      const userCredential = await signUp(email, password);
      const { uid } = userCredential;

      await createUserDocument(uid, email); // create Firestore doc
      await setDoc(
        doc(db, "users", uid),
        {
          handicap: null,
        },
        { merge: true }
      );

      showSnackbar("Account created!", "success");
      navigation.navigate("AdminDashboard"); // or wherever you want to navigate
    } catch (error: any) {
      showSnackbar("Signup Error", error ? error?.message : "Unknown error");
    }
  };

  const handleLogin = () => {
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
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#1B4332",
  },
  input: {
    borderWidth: 1,
    borderColor: "#1B4332",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    color: "#1B4332",
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
  link: { color: "#1B4332", textAlign: "center" },
});
