// Login screen/component placeholderimport React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Logo from "../components/logo";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { login } from "../services/authService";
import useAuthForm from "../hooks/useAuthForm";
import ScreenWrapper from "../components/ScreenWrapper";
import { useSnackbar } from "../context/SnackbarContext";
import { colors } from "../theme";
import { NavigationProp } from "@react-navigation/native";

const LoginScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const { email, password, setEmail, setPassword } = useAuthForm();

  const showSnackbar = useSnackbar();

  const handleLogin = async () => {
    try {
      await login(email, password);
      navigation.navigate("AdminDashboard");
    } catch (error: any) {
      showSnackbar("An error occurred during login", "error");
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Logo />
        <Text style={styles.title}>Login</Text>
        <TextInput
          placeholder="Email"
          style={styles.input}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.warmTaupe,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: "bold",
    color: "#1B4332",
  },
  input: {
    borderWidth: 1,
    borderColor: "#1B4332",
    backgroundColor: colors.whiteSmoke,
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
    fontWeight: "600",
  },
});
