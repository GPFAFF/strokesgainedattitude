// Onboarding screen/component placeholderimport React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import Logo from "../components/logo";
import ScreenWrapper from "../components/ScreenWrapper";
import { colors } from "../theme";
type OnboardingScreenNavigationProp = StackNavigationProp<any, any>;

export default function OnboardingScreen({
  navigation,
}: {
  navigation: OnboardingScreenNavigationProp;
}) {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Logo />

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.warmTaupe,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
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
    fontWeight: "700",
  },
  secondaryButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: colors.whiteSmoke,
  },
  loginText: {
    color: colors.forestGreen,
    textAlign: "center",
    fontWeight: "700",
  },
});
