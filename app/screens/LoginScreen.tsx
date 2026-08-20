import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Logo from "../components/logo";

import { login } from "../services/authService";
import useAuthForm from "../hooks/useAuthForm";
import ScreenWrapper from "../components/ScreenWrapper";
import { useSnackbar } from "../context/SnackbarContext";
import { colors } from "../theme";
import HeaderBar from "../components/HeaderBar";

const LoginScreen = () => {
  const { email, password, setEmail, setPassword } = useAuthForm();

  const showSnackbar = useSnackbar();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error: unknown) {
      if (error instanceof Error) {
        showSnackbar(
          `Login Error: ${error?.message || "Unknown error"}`,
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
