import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import Logo from "../components/logo";
import ScreenWrapper from "../components/ScreenWrapper";
import { colors, spacing } from "../theme";

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
    backgroundColor: colors.surfaceAlt,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: spacing.sm,
    color: colors.primaryDark,
  },
  button: {
    backgroundColor: colors.primaryDark,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "700",
  },
  secondaryButton: {
    padding: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  loginText: {
    color: colors.primary,
    textAlign: "center",
    fontWeight: "700",
  },
});
